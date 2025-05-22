import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSupabase } from '../lib/supabase-client';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({
  user: null,
  session: null,
  isLoading: true,
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
  signInWithGoogle: () => {},
  handleOAuthCallback: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabase();
  const navigate = useNavigate();

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      if (!data?.session) throw new Error('No active session found');
      
      setSession(data.session);
      setUser(data.session.user);
      return { data, error: null };
    } catch (error) {
      console.error('OAuth callback error:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Handle email/password sign in
  const signIn = async (email, password) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email/password sign up
  const signUp = async (email, password) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get the current session
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error.message);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error) {
        console.error("Error in getInitialSession:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        // Don't redirect here to prevent unwanted navigation
        // The ProtectedRoute will handle the redirection
      }
    );

    // Get the initial session
    getInitialSession();

    return () => {
      // Cleanup subscription
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, [supabase]); // Removed navigate from dependencies

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }

    return data
  }

  // Sign out
  const signOut = async () => {
    setIsLoading(true)

    const { error } = await supabase.auth.signOut()

    setIsLoading(false)

    if (error) {
      throw error
    }
  }

  // Update user profile
  const updateProfile = async (updates) => {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (error) {
      throw error
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    handleOAuthCallback,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
