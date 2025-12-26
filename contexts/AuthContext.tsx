import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User, AuthError, type PostgrestSingleResponse } from '@supabase/supabase-js';

type GetSessionResponse = {
  data: { session: Session | null };
  error: AuthError | null;
};

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'dealer' | 'buyer' | 'seller';
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string; role?: string; phone?: string }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
  resendVerificationEmail: () => Promise<{ error: AuthError | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: AuthError | null }>;
  resetPasswordRequest: (email: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local storage where possible
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Initialize profile from local storage for instant render
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const cached = localStorage.getItem('cached_profile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const withTimeout = async <T,>(
    promise: PromiseLike<T>,
    timeoutMs: number,
    timeoutMessage: string
  ): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        Promise.resolve(promise),
        new Promise<T>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(timeoutMessage));
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Cache the fresh profile
      if (data) {
        localStorage.setItem('cached_profile', JSON.stringify(data));
      }

      return data as Profile;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      // Fallback to cache if network fails? No, we trust current state or cache already loaded.
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      if (profileData) setProfile(profileData);
    }
  };

  useEffect(() => {
    // Get initial session
    (async () => {
      try {
        const sessionRes = await supabase.auth.getSession();

        const session = sessionRes.data.session;
        setSession(session);
        setUser(session?.user ?? null);

        // If no session found, clear profile cache
        if (!session) {
          localStorage.removeItem('cached_profile');
          setProfile(null);
        }

        // Stop loading immediately
        setLoading(false);

        if (session?.user) {
          // fetchProfile updates cache and returns data
          fetchProfile(session.user.id).then(profileData => {
            if (profileData) setProfile(profileData);
          });
        }
      } catch (err) {
        console.warn('Initial session check failed or timed out:', err);
        setSession(null);
        setUser(null);
        // Do not clear profile here immediately to avoid flash if it was just a timeout, 
        // but arguably if session check failed we should be safe.
        // Let's keep optimistic profile if we have it? No, security first.
        setProfile(null);
        setLoading(false);
      }
    })();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);

        // Handle explicit sign out
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('cached_profile');
          setProfile(null);
        }

        // If we get an auth change event, we should ensure loading is false
        setLoading(false);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (profileData) setProfile(profileData);
        } else if (!session) {
          // Double check clear
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth state change handling error:', err);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; role?: string; phone?: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.full_name || email,
            role: metadata?.role || 'buyer',
            phone: metadata?.phone,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected sign up error:', err);
      return { error: err as AuthError };
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      // Handle remember me - set session persistence
      if (rememberMe) {
        // Session persists in localStorage (default)
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Session only for current browser session
        localStorage.setItem('rememberMe', 'false');
        // Note: Supabase uses localStorage by default, but we track preference
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected sign in error:', err);
      return { error: err as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected Google sign in error:', err);
      return { error: err as AuthError };
    }
  };

  const signOut = async () => {
    console.log('AuthContext: signOut called');
    try {
      // 1. Immediate local cleanup (Optimistic UI)
      setSession(null);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('cached_profile');

      // 2. Network cleanup (don't let it block UI)
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error (background):', error);
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      // Ensure state is cleared even if unexpected error
      setSession(null);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('cached_profile');
      return { error: err as AuthError };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user?.email) {
        return { error: { message: 'No user email found' } as AuthError };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) {
        console.error('Resend verification error:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected resend error:', err);
      return { error: err as AuthError };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error) {
        console.error('OTP verification error:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected OTP verification error:', err);
      return { error: err as AuthError };
    }
  };

  const resetPasswordRequest = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        console.error('Password reset request error:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected password reset request error:', err);
      return { error: err as AuthError };
    }
  };

  const resetPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Password reset error:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected password reset error:', err);
      return { error: err as AuthError };
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
    resendVerificationEmail,
    verifyOtp,
    resetPasswordRequest,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
