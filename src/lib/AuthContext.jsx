import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44, supabase } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState({});
  
  // Flag to prevent double-calling checkUserAuth from both initAuth and onAuthStateChange
  const isCheckingRef = useRef(false);

  const checkUserAuth = async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    try {
      setIsLoadingAuth(true);
      const currentUser = await base44.auth.me();
      if (currentUser) {
        if (currentUser.status === 'inactive') {
          await supabase.auth.signOut();
          throw new Error('Your signup application has been declined or restricted. Contact your admin.');
        }
        if (currentUser.status === 'pending_approval') {
          // Don't sign out — let them stay in auth session so PendingApproval page can poll
          setUser(currentUser);
          setIsAuthenticated(false); // Not fully authenticated — blocks dashboard access
          setAuthError(null);
          setAuthChecked(true);
          setIsLoadingAuth(false);
          isCheckingRef.current = false;
          return; // Stop here — App.jsx will render PendingApproval based on user.status
        }
        setUser(currentUser);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        console.warn('AuthContext: me() returned null — user not found in team_member');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.warn('AuthContext: checkUserAuth failed:', error.message);
      setIsAuthenticated(false);
      setUser(null);
      if (error.message?.includes('No team member profile found')) {
        // User exists in Supabase auth but has no profile — sign them out and show a clear message
        await supabase.auth.signOut();
        setAuthError('Your account is not set up yet. Please contact your admin.');
      } else if (error.message?.includes('declined or restricted')) {
        await supabase.auth.signOut();
        setAuthError(error.message);
      } else {
        setAuthError(null);
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        if (window.location.pathname === '/reset-password') {
          setIsLoadingAuth(false);
          setAuthChecked(true);
          return;
        }
        await checkUserAuth();
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth event:', event);
      if (event === 'SIGNED_IN') {
        if (window.location.pathname === '/reset-password') return;
        // Also check if this is a recovery session — don't run checkUserAuth on recovery sessions
        if (session?.user?.recovery_sent_at || window.location.hash.includes('type=recovery')) return;
        await checkUserAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setAuthChecked(true);
      } else if (event === 'PASSWORD_RECOVERY') {
        // Recovery session active — do NOT run checkUserAuth, do NOT sign out
        // ResetPassword.jsx handles this via its own onAuthStateChange listener
        setIsLoadingAuth(false);
        setAuthChecked(true);
        return;
      } else if (event === 'TOKEN_REFRESHED') {
        // Session token was refreshed — re-check user state quietly
        if (!isCheckingRef.current) {
          if (window.location.pathname === '/reset-password') {
            return;
          }
          await checkUserAuth();
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    await supabase.auth.signOut();
    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const checkAppState = async () => {
    // Mocked for backwards compatibility
    setIsLoadingPublicSettings(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
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
