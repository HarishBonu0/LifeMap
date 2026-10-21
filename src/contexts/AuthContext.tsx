import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, Language } from '../types';
import { StorageAdapter } from '../lib/storage';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  session: any | null;
  loading: boolean;
  isDemoMode: boolean;
  isSupabaseLive: boolean;
  signUp: (email: string, password: string, name?: string, language?: Language) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile({
          id: data.id,
          email: data.email,
          name: data.name || data.email.split('@')[0],
          preferredLanguage: data.preferred_language || 'en',
          age: data.age,
          employmentType: data.employment_type,
          maritalStatus: data.marital_status,
          dependantsCount: data.dependants_count || 0,
          isDemoUser: false,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        });
      }
    } catch (err) {
      console.warn('Failed to fetch user profile', err);
    }
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data }: { data: any }) => {
      const initialSession = data?.session || null;
      setSession(initialSession);
      const currentUser = initialSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        StorageAdapter.setScopedUserId(currentUser.id);
        fetchProfile(currentUser.id);
      } else {
        StorageAdapter.setScopedUserId(null);
      }
      setLoading(false);
    });

    // Listen to auth events
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, newSession: any) => {
        setSession(newSession);
        const currentUser = newSession?.user || null;
        setUser(currentUser);

        if (currentUser) {
          StorageAdapter.setScopedUserId(currentUser.id);
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
          StorageAdapter.setScopedUserId(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, name?: string, language: Language = 'en') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          preferred_language: language
        }
      }
    });

    if (!error && data?.user) {
      setUser(data.user);
      setSession(data.session);
      StorageAdapter.setScopedUserId(data.user.id);
      await fetchProfile(data.user.id);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error && data?.user) {
      setUser(data.user);
      setSession(data.session);
      StorageAdapter.setScopedUserId(data.user.id);
      await fetchProfile(data.user.id);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    StorageAdapter.setScopedUserId(null);
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return { error: null };
    const { error } = await supabase
      .from('profiles')
      .eq('id', user.id)
      .update({
        name: updates.name,
        preferred_language: updates.preferredLanguage,
        updated_at: new Date().toISOString()
      });
    if (!error) {
      await fetchProfile(user.id);
    }
    return { error };
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isDemoMode: !user,
        isSupabaseLive: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
