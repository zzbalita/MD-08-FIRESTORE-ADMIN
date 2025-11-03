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
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`; // Set token cho axios khi load lại
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

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // ✅ Set token sau login
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
