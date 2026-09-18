import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexusguard_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
          localStorage.setItem('nexusguard_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (employee_id, password) => {
    const res = await api.login(employee_id, password);
    localStorage.setItem('nexusguard_token', res.access_token);
    localStorage.setItem('nexusguard_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const switchPersona = async (employee_id) => {
    setLoading(true);
    try {
      const res = await api.demoSwitch(employee_id);
      localStorage.setItem('nexusguard_token', res.access_token);
      localStorage.setItem('nexusguard_user', JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nexusguard_token');
    localStorage.removeItem('nexusguard_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, switchPersona, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
