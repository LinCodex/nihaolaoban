import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User, AuthError, type PostgrestSingleResponse } from '@supabase/supabase-js';

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
  signUp: (email: string, password: string, metadata?: { full_name?: string; role?: string }) => Promise<{ error: AuthError | null }>;
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
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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
      const { data, error } = await withTimeout<PostgrestSingleResponse<Profile>>(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        15000,
        'Profile request timed out'
      );

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Get initial session
    (async () => {
      try {
        type GetSessionResponse = Awaited<ReturnType<typeof supabase.auth.getSession>>;
        const sessionRes = await withTimeout<GetSessionResponse>(
          supabase.auth.getSession(),
          15000,
          'Session request timed out'
        );

        const session = sessionRes.data.session;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    })();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth state change handling error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; role?: string }
  ) => {
    try {
      const { data, error } = await withTimeout(
        supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata?.full_name || email,
            role: metadata?.role || 'buyer',
          },
        },
        }),
        15000,
        'Sign up request timed out'
      );

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
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
        email,
        password,
        }),
        15000,
        'Sign in request timed out'
      );

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
      const { data, error } = await withTimeout(
        supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
        }),
        15000,
        'Google sign in request timed out'
      );

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
    try {
      const { error } = await withTimeout(
        supabase.auth.signOut(),
        15000,
        'Sign out request timed out'
      );

      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      setSession(null);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('rememberMe');

      return { error: null };
    } catch (err) {
      console.error('Unexpected sign out error:', err);
      return { error: err as AuthError };
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user?.email) {
        return { error: { message: 'No user email found' } as AuthError };
      }

      const { error } = await withTimeout(
        supabase.auth.resend({
          type: 'signup',
          email: user.email,
        }),
        15000,
        'Resend verification request timed out'
      );

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
      const { data, error } = await withTimeout(
        supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        }),
        15000,
        'Verification request timed out'
      );

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
      const { error } = await withTimeout(
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        }),
        15000,
        'Password reset email request timed out'
      );

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
      const { error } = await withTimeout(
        supabase.auth.updateUser({
          password: newPassword,
        }),
        15000,
        'Password update request timed out'
      );

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
