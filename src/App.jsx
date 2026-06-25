import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { base44 } from '@/api/base44Client';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import PendingApproval from '@/components/auth/PendingApproval';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Catches any render crash and shows the actual error instead of blank screen
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#fff', minHeight: '100vh' }}>
          <h2 style={{ color: '#e11d48', marginBottom: '12px' }}>⚠️ App Crashed</h2>
          <p style={{ marginBottom: '8px', color: '#555' }}>Please share this error with the developer:</p>
          <pre style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', whiteSpace: 'pre-wrap', color: '#991b1b' }}>
            {this.state.error.toString()}
            {this.state.error.stack}
          </pre>
          <button onClick={() => window.location.href = '/login'} style={{ marginTop: '16px', padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Back to Login</button>
        </div>
      );
    }
    return this.props.children;
  }
}

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Colleges from '@/pages/Colleges';
import Startups from '@/pages/Startups';
import Events from '@/pages/Events';
import Broadcast from '@/pages/Broadcast';
import Analytics from '@/pages/Analytics';
import AdminApprovals from '@/pages/AdminApprovals';
import Proposals from '@/pages/Proposals';
import Students from '@/pages/Students';
import Messaging from '@/pages/Messaging';
import Tasks from '@/pages/Tasks';
import Team from '@/pages/Team';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user } = useAuth();
  const [isPending, setIsPending] = React.useState(null);

  React.useEffect(() => {
    if (user) {
      const checkApproval = async () => {
        try {
          const members = await base44.entities.TeamMember.filter({ user_id: user.id }, '-created_at', 1);
          if (Array.isArray(members) && members.length > 0) {
            const memberStatus = members[0].status;
            if (memberStatus === 'inactive') {
              // Revoked — force logout
              await base44.auth.logout();
              return;
            }
            setIsPending(memberStatus === 'pending_approval');
          } else {
            setIsPending(false);
          }
        } catch {
          setIsPending(false);
        }
      };
      checkApproval();
    }
  }, [user]);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground font-medium">Loading Beacon Studios...</p>
        </div>
      </div>
    );
  }

  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicPath = publicPaths.includes(window.location.pathname);

  // authError is a plain string — if set and we're not on a public path, redirect to login
  // (Login.jsx will display the authError from useAuth context)
  if (authError && !isPublicPath) {
    return <Navigate to="/login" replace />;
  }

  if (user && isPending === null && user.role !== 'admin') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isPending) {
    return <PendingApproval user={user} />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout user={user} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="/startups" element={<Startups />} />
          <Route path="/events" element={<Events />} />
          <Route path="/broadcast" element={<Broadcast />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/approvals" element={user?.role === 'admin' ? <AdminApprovals /> : <Navigate to="/" replace />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/students" element={<Students />} />
          <Route path="/messaging" element={<Messaging />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/team" element={<Team />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
