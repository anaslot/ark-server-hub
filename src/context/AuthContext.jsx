import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        if (!user) return;

        let role = 'User';
        if (user.email === 'anasbarfeel28@gmail.com') role = 'Admin';
        if (user.email === 'anasvex25@gmail.com') role = 'Owner';

        const newProfile = {
          id: userId,
          username: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
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

  useEffect(() => {
    let mounted = true;

    // Check current session
    const checkSession = async () => {
      try {
        // Increase timeout to 10 seconds for slower networks
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

        if (session && mounted) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (mounted) {
          const guestUser = localStorage.getItem('guest_user');
          if (guestUser) {
            const parsedGuest = JSON.parse(guestUser);
            setUser(parsedGuest);
            setProfile({
              id: parsedGuest.id,
              username: parsedGuest.user_metadata?.full_name || 'Guest',
              role: 'Guest',
              is_active: true
            });
          }
        }
      } catch (err) {
        console.error('Session check error or timeout:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
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
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

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

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    // Explicitly set the session in memory to avoid initial loading flicker
    if (data.user) {
      setUser(data.user);
      await fetchProfile(data.user.id);
    }
    
    return data;
  };

  const signUpWithEmail = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username,
        },
      },
    });
    if (error) throw error;
    return data;
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
    <AuthContext.Provider value={{ 
      user, profile, loading, 
      loginWithGoogle, loginWithApple, 
      signInWithEmail, signUpWithEmail,
      loginAsGuest, logout, setProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
