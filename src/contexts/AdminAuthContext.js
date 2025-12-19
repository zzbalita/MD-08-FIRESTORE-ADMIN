import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminInfo');

    if (storedToken) {
      setAdminToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    if (storedAdmin) {
      setAdminInfo(JSON.parse(storedAdmin));
    }
  }, []);

  const login = (token, adminData) => {
    setAdminToken(token);
    setAdminInfo(adminData);
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminInfo', JSON.stringify(adminData));

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setAdminToken(null);
    setAdminInfo(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');

    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AdminAuthContext.Provider value={{ adminToken, adminInfo, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

// Helper functions for role checking
export const isAdmin = (adminInfo) => {
  return adminInfo?.role === 'admin' || adminInfo?.role === 'Admin';
};

export const isStaff = (adminInfo) => {
  return adminInfo?.role === 'staff' || adminInfo?.role === 'Staff';
};

export const hasPermission = (adminInfo, permission) => {
  if (!adminInfo) return false;
  
  // Admin has all permissions
  if (isAdmin(adminInfo)) return true;
  
  // Staff permissions - deny specific permissions
  if (isStaff(adminInfo)) {
    const deniedPermissions = ['manage_taxonomy', 'manage_staff', 'view_statistics'];
    return !deniedPermissions.includes(permission);
  }
  
  return false;
};
