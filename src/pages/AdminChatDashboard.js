import React, { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import '../pages/StyleWeb/AdminChat.css';
import { BASE_URL } from '../config';

const AdminChatDashboard = () => {
  const { adminToken, adminInfo } = useAdminAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [newMessageIndicator, setNewMessageIndicator] = useState(false);
  
  const messagesEndRef = useRef(null);
  const API_BASE_URL = BASE_URL;

  // Check if user is admin or staff
  const isAdminOrStaff = adminInfo?.role === 'admin' || adminInfo?.role === 'staff';

  // Debug logging
  console.log('Admin Info:', adminInfo);
  console.log('Admin Token:', adminToken);
  console.log('Is Admin or Staff:', isAdminOrStaff);

  useEffect(() => {
    if (adminInfo && adminToken && isAdminOrStaff) {
      loadAdminChats();
      setupSocketConnection();
    }

    return () => {
      if (socket) {
        // Leave admin chat room before disconnecting
        if (selectedSession) {
          socket.emit('leaveChatSupportRoom', { 
            roomId: selectedSession.room_id,
            userId: adminInfo?.id || adminInfo?.username
          });
        }
        socket.disconnect();
      }
    };
  }, [adminInfo, adminToken, isAdminOrStaff]);

  // Set up periodic refresh for real-time updates
  useEffect(() => {
    if (!adminInfo || !adminToken || !isAdminOrStaff) return;

    // Refresh sessions list every 30 seconds to catch any missed updates
    const sessionsInterval = setInterval(() => {
      loadAdminChats();
    }, 30000);

    // Refresh current chat messages every 15 seconds if a session is selected
    const messagesInterval = setInterval(() => {
      if (selectedSession) {
        refreshCurrentChatMessages(selectedSession.room_id);
      }
    }, 15000);

    // Refresh user online status every 5 seconds
    const statusInterval = setInterval(() => {
      refreshUserOnlineStatus();
    }, 5000);

    return () => {
      clearInterval(sessionsInterval);
      clearInterval(messagesInterval);
      clearInterval(statusInterval);
    };
  }, [adminInfo, adminToken, isAdminOrStaff, selectedSession]);

  // Debug effect to log sessions state changes
  useEffect(() => {
    console.log('📊 Sessions state changed:', sessions);
  }, [sessions]);

  // Function to refresh user online status using chat-support API
  const refreshUserOnlineStatus = async (currentSessions = null) => {
    try {
      const sessionsToCheck = currentSessions || sessions;
      if (!sessionsToCheck || sessionsToCheck.length === 0) return;
      
      // Get online status for each user in sessions
      const updatedSessions = await Promise.all(
        sessionsToCheck.map(async (session) => {
          if (!session.user?.id) return { ...session, is_online: false };
          
          try {
            const response = await axios.get(
              `${API_BASE_URL}/api/chat-support/status/${session.user.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${adminToken}`
                }
              }
            );
            
            if (response.data.success) {
              return {
                ...session,
                is_online: response.data.data.is_online || false
              };
            }
          } catch (err) {
            // Silently handle status check errors
            console.log(`Could not get status for user ${session.user?.id}`);
          }
          return { ...session, is_online: false };
        })
      );
      
      // Only update if we have sessions
      if (updatedSessions.length > 0) {
        setSessions(updatedSessions);
        
        // Update online users set
        const onlineUserIds = updatedSessions
          .filter(s => s.is_online)
          .map(s => s.user?.id)
          .filter(Boolean);
        setOnlineUsers(new Set(onlineUserIds));
        
        console.log('🔍 Online users:', onlineUserIds);
      }
    } catch (error) {
      console.error('Error refreshing user online status:', error);
    }
  };

  const setupSocketConnection = () => {
    const newSocket = io(API_BASE_URL, {
      transports: ['websocket'],
      auth: {
        token: adminToken
      }
    });

    newSocket.on('connect', () => {
      console.log('🔌 Admin connected to socket:', newSocket.id);
      newSocket.emit('adminConnect', { adminId: adminInfo?.id || adminInfo?.username });
    });

    // Listen for new chat sessions (new chat support system)
    newSocket.on('newChatSession', (data) => {
      console.log('🆕 New chat session:', data);
      loadAdminChats();
    });

    // Listen for new user messages (new chat support system)
    newSocket.on('newUserMessage', (data) => {
      console.log('📱 New user message received:', data);
      
      // Refresh sessions list
      loadAdminChats();
      
      // If this room is currently selected, refresh messages
      if (selectedSession && selectedSession.room_id === data.room_id) {
        // Add message to local state immediately
        if (data.message) {
          addMessageToChat({
            id: data.message._id || data.message.id || `user_${Date.now()}`,
            message: data.message.message || data.message.text,
            sender_type: data.message.sender_type || 'user',
            is_from_user: true,
            timestamp: data.message.timestamp || data.message.created_at || new Date()
          });
        }
        
        setNewMessageIndicator(true);
        refreshCurrentChatMessages(data.room_id);
      }
    });

    // Listen for new messages in joined rooms (new chat support system)
    newSocket.on('newMessage', (data) => {
      console.log('📨 New message received:', data);
      
      // Refresh sessions list
      loadAdminChats();
      
      // If this room is currently selected, add message
      if (selectedSession && selectedSession.room_id === data.room_id) {
        if (data.message) {
          const isFromUser = data.message.sender_type === 'user';
          addMessageToChat({
            id: data.message._id || data.message.id || `msg_${Date.now()}`,
            message: data.message.message || data.message.text,
            sender_type: data.message.sender_type,
            is_from_user: isFromUser,
            timestamp: data.message.timestamp || data.message.created_at || new Date()
          });
          
          if (isFromUser) {
            setNewMessageIndicator(true);
          }
        }
        
        refreshCurrentChatMessages(data.room_id);
      }
    });

    // Listen for new admin messages
    newSocket.on('newAdminMessage', (data) => {
      console.log('👨‍💼 New admin message received:', data);
      
      loadAdminChats();
      
      if (selectedSession && selectedSession.room_id === data.room_id) {
        if (data.message) {
          addMessageToChat({
            id: data.message._id || data.message.id || `admin_${Date.now()}`,
            message: data.message.message || data.message.text,
            sender_type: 'admin',
            is_from_user: false,
            timestamp: data.message.timestamp || data.message.created_at || new Date()
          });
        }
        
        refreshCurrentChatMessages(data.room_id);
      }
    });

    // User joined room notification
    newSocket.on('userJoinedRoom', (data) => {
      console.log('👤 User joined room:', data);
      loadAdminChats();
    });

    // User left room notification
    newSocket.on('userLeftRoom', (data) => {
      console.log('👤 User left room:', data);
      loadAdminChats();
    });

    newSocket.on('userTyping', (data) => {
      console.log('⌨️ User typing:', data);
      // You can add typing indicator here
    });

    setSocket(newSocket);
  };

  // Load admin chat rooms using new chat support API
  const loadAdminChats = async () => {
    try {
      setLoading(true);
      
      // Use the new chat support API endpoint
      const response = await axios.get(`${API_BASE_URL}/api/chat-support/admin/rooms?all=true&status=active`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        const rooms = response.data.data.rooms || [];
        console.log('📋 Loaded chat rooms:', rooms);
        
        // Transform rooms to match expected session format
        const transformedSessions = rooms.map(room => ({
          session_id: room.room_id, // Keep for backward compatibility
          room_id: room.room_id,
          socket_room: room.socket_room,
          user: room.user,
          admin: room.admin,
          status: room.status,
          last_message: room.last_message ? {
            text: room.last_message.text,
            is_user: room.last_message.sender_type === 'user',
            timestamp: room.last_message.timestamp
          } : null,
          last_activity: room.last_activity,
          total_messages: room.stats?.total_messages || 0,
          unread_count: room.stats?.unread_user_messages || 0,
          is_online: false // Will be updated by refreshUserOnlineStatus
        }));
        
        setSessions(transformedSessions);
        
        // Immediately refresh online status with the new sessions
        await refreshUserOnlineStatus(transformedSessions);
        
        // If we have a selected session, update it with fresh data
        if (selectedSession) {
          const updatedSession = transformedSessions.find(s => s.room_id === selectedSession.room_id);
          if (updatedSession) {
            setSelectedSession(updatedSession);
          }
        }
      }
    } catch (error) {
      console.error('Error loading admin chats:', error);
      
      // If the new endpoint doesn't exist, fall back to old endpoint
      if (error.response?.status === 404) {
        console.log('⚠️ New chat support API not found, trying legacy endpoint...');
        try {
          const legacyResponse = await axios.get(`${API_BASE_URL}/api/chat/admin/all-chats`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          });
          
          if (legacyResponse.data.success) {
            setSessions(legacyResponse.data.data.sessions || []);
          }
        } catch (legacyError) {
          console.error('Error loading legacy admin chats:', legacyError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh messages for the currently selected chat room
  const refreshCurrentChatMessages = async (roomId) => {
    if (!roomId || !adminToken) return;
    
    try {
      console.log('🔄 Refreshing chat messages for room:', roomId);
      
      // Use admin-specific chat support API endpoint
      const response = await axios.get(`${API_BASE_URL}/api/chat-support/admin/rooms/${roomId}/history`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        // Only update messages if this room is still selected
        if (selectedSession && selectedSession.room_id === roomId) {
          const transformedMessages = (response.data.data.messages || []).map(msg => ({
            message_id: msg.id || msg._id,
            text: msg.message,
            is_user: msg.is_from_user || msg.sender_type === 'user',
            timestamp: msg.timestamp,
            sender_type: msg.sender_type,
            sender_name: msg.sender_name
          }));
          
          setMessages(transformedMessages);
          console.log('✅ Chat messages refreshed:', transformedMessages.length);
          scrollToBottom();
          setNewMessageIndicator(false);
        }
      }
    } catch (error) {
      console.error('Error refreshing chat messages:', error);
      
      // Fallback to legacy endpoint
      if (error.response?.status === 404) {
        try {
          const legacyResponse = await axios.get(`${API_BASE_URL}/api/chat/admin/sessions/${roomId}`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          });
          
          if (legacyResponse.data.success && selectedSession?.room_id === roomId) {
            setMessages(legacyResponse.data.data.messages || []);
            scrollToBottom();
          }
        } catch (legacyError) {
          console.error('Error refreshing legacy chat messages:', legacyError);
        }
      }
    }
  };

  const selectSession = async (session) => {
    // Leave previous session room if exists
    if (selectedSession && socket) {
      socket.emit('leaveChatSupportRoom', { 
        roomId: selectedSession.room_id,
        userId: adminInfo?.id || adminInfo?.username
      });
      console.log('👨‍💼 Admin left chat room:', selectedSession.room_id);
    }
    
    setSelectedSession(session);
    setNewMessageIndicator(false);
    
    // Join the new chat support room
    if (socket) {
      socket.emit('joinChatSupportRoom', { 
        roomId: session.room_id,
        userId: adminInfo?.id || adminInfo?.username,
        userType: 'Admin'
      });
      console.log('👨‍💼 Admin joined chat room:', session.room_id);
    }
    
    try {
      // Use admin-specific chat support API to get chat history
      const response = await axios.get(`${API_BASE_URL}/api/chat-support/admin/rooms/${session.room_id}/history`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        const transformedMessages = (response.data.data.messages || []).map(msg => ({
          message_id: msg.id || msg._id,
          text: msg.message,
          is_user: msg.is_from_user || msg.sender_type === 'user',
          timestamp: msg.timestamp,
          sender_type: msg.sender_type,
          sender_name: msg.sender_name
        }));
        
        setMessages(transformedMessages);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      
      // Fallback to legacy endpoint
      if (error.response?.status === 404) {
        try {
          const legacyResponse = await axios.get(`${API_BASE_URL}/api/chat/admin/sessions/${session.session_id}`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          });
          
          if (legacyResponse.data.success) {
            setMessages(legacyResponse.data.data.messages || []);
            scrollToBottom();
          }
        } catch (legacyError) {
          console.error('Error loading legacy chat history:', legacyError);
        }
      }
    }
  };

  const sendAdminResponse = async () => {
    if (!inputText.trim() || !selectedSession) return;

    try {
      // Use new chat support API to send admin response
      const response = await axios.post(
        `${API_BASE_URL}/api/chat-support/admin/rooms/${selectedSession.room_id}/respond`,
        { message: inputText.trim() },
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.data.success) {
        // Add message to local state
        const newMessage = response.data.data.message;
        addMessageToChat({
          message_id: newMessage.id || newMessage._id || `admin_${Date.now()}`,
          text: newMessage.message || inputText.trim(),
          is_user: false,
          timestamp: newMessage.timestamp || new Date(),
          sender_type: 'admin'
        });
        
        setInputText('');
        setNewMessageIndicator(false);
        
        // Refresh sessions list to update last message
        loadAdminChats();
      }
    } catch (error) {
      console.error('Error sending admin response:', error);
      
      // Fallback to legacy endpoint
      if (error.response?.status === 404) {
        try {
          const legacyResponse = await axios.post(
            `${API_BASE_URL}/api/chat/admin/sessions/${selectedSession.session_id}/respond`,
            { message: inputText.trim() },
            {
              headers: {
                'Authorization': `Bearer ${adminToken}`
              }
            }
          );
          
          if (legacyResponse.data.success) {
            addMessageToChat(legacyResponse.data.data.message);
            setInputText('');
            loadAdminChats();
          }
        } catch (legacyError) {
          console.error('Error sending legacy admin response:', legacyError);
          alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
        }
      } else {
        alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
      }
    }
  };

  const addMessageToChat = (message) => {
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(m => 
        m.message_id === message.message_id || 
        (m.text === message.text && m.timestamp === message.timestamp)
      );
      
      if (exists) return prev;
      return [...prev, message];
    });
    setTimeout(scrollToBottom, 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSessionStatus = (session) => {
    if (session.status === 'active') {
      return <span className="status-badge active">Đang hoạt động</span>;
    } else if (session.status === 'closed') {
      return <span className="status-badge closed">Đã đóng</span>;
    } else {
      return <span className="status-badge archived">Đã lưu trữ</span>;
    }
  };

  const getUnreadCount = (session) => {
    return session.unread_count || 0;
  };

  if (!adminInfo || !isAdminOrStaff) {
    return (
      <div className="admin-chat-container">
        <div className="access-denied">
          <h2>🔒 Truy cập bị từ chối</h2>
          <p>Bạn cần đăng nhập với quyền admin hoặc staff để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-chat-container">
      <div className="admin-chat-header">
        <h1>💬 Chăm sóc khách hàng</h1>
        <p>Quản lý chat với khách hàng từ ứng dụng di động</p>
        <div className="admin-info">
          <span>👨‍💼 {adminInfo.name}</span>
          <span>🟢 Online</span>
        </div>
      </div>

      <div className="admin-chat-content">
        {/* Sessions List */}
        <div className="sessions-panel">
          <div className="sessions-header">
            <h3>Danh sách Chat ({sessions.length})</h3>
            <button 
              className="refresh-btn"
              onClick={loadAdminChats}
              disabled={loading}
            >
              🔄 {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
          </div>
          
          <div className="sessions-list">
            {sessions.length === 0 ? (
              <div className="no-sessions">
                <p>📭 Chưa có cuộc trò chuyện nào</p>
              </div>
            ) : (
              sessions.map((session) => {
                const unreadCount = getUnreadCount(session);
                const isOnline = session.is_online || false;
                
                return (
                  <div
                    key={session.room_id || session.session_id}
                    className={`session-item ${selectedSession?.room_id === session.room_id ? 'selected' : ''}`}
                    onClick={() => selectSession(session)}
                  >
                    <div className="session-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          {session.user?.name?.charAt(0) || session.user?.full_name?.charAt(0) || 'K'}
                        </div>
                        <div className="user-details">
                          <h4>{session.user?.name || session.user?.full_name || 'Khách hàng'}</h4>
                          <p>{session.user?.email}</p>
                        </div>
                      </div>
                      <div className="session-meta">
                        <span className={`online-status ${isOnline ? 'online' : 'offline'}`}>
                          {isOnline ? '🟢 Online' : '🔴 Offline'}
                        </span>
                      </div>
                    </div>
                    
                    {session.last_message && (
                      <div className="last-message">
                        <p className="message-preview">
                          {session.last_message.is_user ? '👤 ' : '👨‍💼 '}
                          {session.last_message.text}
                        </p>
                        <span className="message-time">
                          {formatTimestamp(session.last_message.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    {unreadCount > 0 && (
                      <div className="unread-badge">
                        {unreadCount} tin nhắn mới
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-panel">
          {selectedSession ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <h3>
                    💬 Chat với {selectedSession.user?.name || selectedSession.user?.full_name || 'Khách hàng'}
                    {newMessageIndicator && <span className="new-message-indicator">🆕</span>}
                  </h3>
                  <p>{selectedSession.user?.email}</p>
                  <div className="chat-meta">
                    <span>Room: {selectedSession.room_id}</span>
                    <span>Tin nhắn: {selectedSession.total_messages || messages.length}</span>
                  </div>
                </div>
              </div>

              <div 
                className="messages-container"
                onClick={() => setNewMessageIndicator(false)}
              >
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>📝 Chưa có tin nhắn nào</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((message, index) => (
                      <div
                        key={`${message.message_id}_${index}`}
                        className={`message ${message.is_user ? 'user-message' : 'admin-message'}`}
                      >
                        <div className="message-content">
                          <div className="message-header">
                            <span className="message-sender">
                              {message.is_user ? '👤 Khách hàng' : `👨‍💼 ${message.sender_name || 'Bạn'}`}
                            </span>
                            <span className="message-time">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          <p className="message-text">{message.text || message.message}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="chat-input">
                <div className="input-container">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Nhập tin nhắn phản hồi cho khách hàng..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendAdminResponse();
                      }
                    }}
                  />
                  <button
                    className="send-btn"
                    onClick={sendAdminResponse}
                    disabled={!inputText.trim()}
                  >
                    📤 Gửi
                  </button>
                </div>
                <div className="input-tips">
                  <small>💡 Nhấn Enter để gửi, Shift+Enter để xuống dòng</small>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="welcome-message">
                <h2>👋 Chào mừng đến với Chăm sóc khách hàng</h2>
                <p>Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu hỗ trợ khách hàng.</p>
                <div className="stats">
                  <div className="stat-item">
                    <span className="stat-number">{sessions.length}</span>
                    <span className="stat-label">Cuộc trò chuyện</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{sessions.filter(s => s.status === 'active').length}</span>
                    <span className="stat-label">Đang hoạt động</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{onlineUsers.size}</span>
                    <span className="stat-label">Người dùng online</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatDashboard;
