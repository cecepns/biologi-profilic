import React, { createContext, useContext, useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Pembelajaran Baru', message: 'Ibu Guru Maya telah mempublikasikan proyek Ekosistem di Sekitarku.', time: '10 menit lalu', read: false },
    { id: 2, title: 'Tugas Tahap 3 Dibuka', message: 'Collaborative Investigation telah dibuka. Silakan berdiskusi di workspace kelompok.', time: '1 jam lalu', read: false },
    { id: 3, title: 'Feedback Presentasi', message: 'Presentasi kelompok Anda telah dinilai oleh Guru Maya (Skor: 90/100).', time: '2 jam lalu', read: true }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
