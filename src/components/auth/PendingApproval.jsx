import React, { useState } from 'react';
import { Clock, LogOut, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44, supabase } from '@/api/base44Client';

export default function PendingApproval({ user }) {
  const [isApproved, setIsApproved] = useState(false);

  React.useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser && currentUser.status === 'active') {
          setIsApproved(true);
        }
      } catch (err) {
        console.error('Polling auth state failed:', err);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (isApproved) {
      supabase.auth.signOut().catch(err => console.error('Sign out failed:', err));
    }
  }, [isApproved]);

  if (isApproved) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Application Approved!</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Your application has been approved! You can now log in.
            </p>
          </div>
          <div className="flex justify-center w-full">
            <Button
              className="w-full h-12 font-medium"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Approval Pending</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your account has been created but requires admin or associate approval before you can access Beacon Studios.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This page refreshes automatically. You'll be redirected as soon as your account is approved.
          </p>
          <div className="mt-6 bg-card rounded-xl border border-border p-5 text-left space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user?.full_name || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="text-amber-600 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Awaiting Approval
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          You'll be notified once an admin or associate reviews and approves your request. This usually takes 1-2 business days.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="ghost"
            className="text-destructive gap-2"
            onClick={() => base44.auth.logout('/login')}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
