import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (profile) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [profile]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const subscribeToNotifications = () => {
    // Listen for ALL relevant notifications
    const channel = supabase
      .channel('public-notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications'
      }, (payload) => {
        const newNotif = payload.new;
        
        // Show if it's for this user
        if (newNotif.user_id === profile.id) {
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Browser Push Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('ARK Server Hub', { 
              body: newNotif.message,
              icon: '/favicon.svg' 
            });
          }
          toast.info(newNotif.message);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendNotification = async (userId, message) => {
    try {
      await supabase
        .from('notifications')
        .insert({ user_id: userId, message, created_at: new Date().toISOString() });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', profile.id)
        .eq('read', false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      }
    }
  };

  const notifyAdmins = async (message) => {
    try {
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['Admin', 'Owner']);
      
      if (admins) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          message,
          created_at: new Date().toISOString()
        }));
        await supabase.from('notifications').insert(notifications);
      }
    } catch (error) {
      console.error('Error notifying admins:', error);
    }
  };

  const notifyAll = async (message) => {
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('id');
      
      if (users) {
        const notifications = users.map(user => ({
          user_id: user.id,
          message,
          created_at: new Date().toISOString()
        }));
        await supabase.from('notifications').insert(notifications);
      }
    } catch (error) {
      console.error('Error notifying all:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead, 
      requestPushPermission,
      sendNotification,
      notifyAdmins,
      notifyAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
