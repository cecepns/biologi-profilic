import React, { createContext, useContext, useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initial state: load saved user from localStorage, otherwise null (requiring login)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bioproflic_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('bioproflic_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bioproflic_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bioproflic_user');
    }
  }, [user]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('bioproflic_token', res.token);
        localStorage.setItem('bioproflic_user', JSON.stringify(res.user));
        toast.success(`Selamat datang, ${res.user.name}!`);
        return { success: true, user: res.user };
      } else {
        toast.error(res.message || 'Login gagal.');
        return { success: false };
      }
    } catch (err) {
      toast.error(err.message || 'Login gagal, periksa NIS/Username Anda.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('bioproflic_user', JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bioproflic_token');
    localStorage.removeItem('bioproflic_user');
    toast.success('Anda telah keluar dari aplikasi.');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

