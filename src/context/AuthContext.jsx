import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        // Check for guest login in localStorage
        const guestUser = localStorage.getItem('guest_user');
        if (guestUser) {
          const parsedGuest = JSON.parse(guestUser);
          setUser(parsedGuest);
          setProfile({
            id: parsedGuest.id,
            username: parsedGuest.user_metadata.full_name || 'Guest',
            role: 'Guest',
            is_active: true
          });
        }
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('guest_user');
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: { user } } = await supabase.auth.getUser();
        let role = 'User';
        
        // Handle specific emails for Admin/Owner
        if (user.email === 'anasbarfeel28@gmail.com') role = 'Admin';
        if (user.email === 'anasvex25@gmail.com') role = 'Owner';

        const newProfile = {
          id: userId,
          username: user.user_metadata.full_name || user.email.split('@')[0],
          email: user.email,
          role: role,
          is_active: true,
          created_at: new Date().toISOString()
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        setProfile(createdProfile);
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
    }
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
  };

  const loginWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
    });
    if (error) throw error;
  };

  const loginAsGuest = () => {
    const guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
    const guestData = {
      id: guestId,
      email: 'guest@arkserverhub.local',
      user_metadata: { full_name: 'Guest User' },
      is_guest: true
    };
    localStorage.setItem('guest_user', JSON.stringify(guestData));
    setUser(guestData);
    setProfile({
      id: guestId,
      username: 'Guest User',
      role: 'Guest',
      is_active: true
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('guest_user');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, loginWithApple, loginAsGuest, logout, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
