import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const fetchUserProfile = async (authId) => {
    try {
      console.log('📝 Fetching user profile for auth_id:', authId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        console.log('✅ Profile fetched:', { email: data.email, role: data.role });
        setUserProfile(data);
        return data;
      } else {
        console.warn('⚠️ No profile found for auth_id:', authId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };
  const clearAuthStorage = () => {
    console.log('🧹 Clearing all auth storage...');
    
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('auth'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('✅ Auth storage cleared');
  };

  const checkUser = async () => {
    try {
      console.log('🔍 Checking current user...');
      
      // Get session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (session?.user) {
        console.log('👤 User found from session:', session.user.email);
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        console.log('No session found, checking getUser...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
          console.log('👤 User found:', user.email);
          setUser(user);
          await fetchUserProfile(user.id);
        } else {
          console.log('No user found');
          setUser(null);
          setUserProfile(null);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setAuthError(error.message);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        await checkUser();
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔔 Auth event:', event);
          
          if (!mounted) return;
          
          try {
            if (event === 'SIGNED_OUT') {
              console.log('User signed out, clearing state');
              setUser(null);
              setUserProfile(null);
              clearAuthStorage();
            } else if (event === 'SIGNED_IN' && session?.user) {
              console.log('User signed in:', session.user.email);
              setUser(session.user);
              await fetchUserProfile(session.user.id);
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              console.log('Token refreshed for:', session.user.email);
              setUser(session.user);
            }
          } catch (err) {
            console.error('Error in auth state change:', err);
          }
        });

        return () => {
          mounted = false;
          if (subscription?.unsubscribe) {
            subscription.unsubscribe();
          }
        };
      } catch (err) {
        console.error('Error initializing auth:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Logging in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email, 
        password
      });

      if (error) throw error;
      
      if (data?.user) {
        console.log('✅ Login successful, fetching profile...');
        setUser(data.user);
        await fetchUserProfile(data.user.id);
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Registering user:', userData.email);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const insertData = {
          auth_id: authData.user.id,
          full_name: userData.full_name,
          email: userData.email,
          contact_number: userData.contact_number || null,
          address: userData.address || null,
          role: userData.role || 'resident',
          created_at: new Date().toISOString()
        };

        if (userData.disabilityType) {
          insertData.disability_type = userData.disabilityType;
        }

        const { error: insertError } = await supabase
          .from('users')
          .insert([insertData]);

        if (insertError) {
          console.error('Error creating user record:', insertError);
          return { success: false, error: 'Failed to create user profile' };
        }

        const { data: userRecord, error: fetchError } = await supabase
          .from('users')
          .select('user_id')
          .eq('auth_id', authData.user.id)
          .single();

        if (userData.isPWD && userData.disabilityType && userRecord) {
          const pwdData = {
            user_id: userRecord.user_id,
            disability_category: userData.disabilityType,
            mobility_level: userData.mobilityLevel || 'Independent',
            needs_medical_device: userData.needsMedicalDevice || false,
            auth_id: authData.user.id,
            created_at: new Date().toISOString()
          };

          if (userData.deviceDetails) {
            pwdData.device_details = userData.deviceDetails;
          }
          if (userData.emergencyContactName) {
            pwdData.emergency_contact_name = userData.emergencyContactName;
          }
          if (userData.emergencyContactNumber) {
            pwdData.emergency_contact_number = userData.emergencyContactNumber;
          }

          const { error: pwdError } = await supabase
            .from('pwd_registry')
            .insert([pwdData]);

          if (pwdError) {
            console.warn('PWD registration warning:', pwdError.message);
          }
        }

        return { success: true };
      }
      
      return { success: false, error: 'Registration failed' };
      
    } catch (error) {
      console.error('Register error:', error);
      if (error.message.includes('User already registered')) {
        return { success: false, error: 'Email already registered. Please login instead.' };
      }
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out...');
    
    try {
      setUser(null);
      setUserProfile(null);
      clearAuthStorage();
  
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
      }
      
      await supabase.auth.setSession(null);
      
      console.log('✅ Logout successful');
      
      window.location.href = '/login?t=' + Date.now();
      
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
      setUserProfile(null);
      clearAuthStorage();
      window.location.href = '/login';
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      return await fetchUserProfile(user.id);
    }
    return null;
  };

  const isAdmin = userProfile?.role === 'admin';

  console.log('📊 Auth State:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    hasProfile: !!userProfile,
    profileRole: userProfile?.role,
    isAdmin: isAdmin,
    loading 
  });

  const value = {
    user,
    userProfile,
    loading,
    authError,
    isAdmin,
    login,
    register,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};