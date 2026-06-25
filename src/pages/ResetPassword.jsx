import React, { useState, useEffect } from "react";
import { base44, supabase } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if we are currently in a recovery flow (has token in URL query or hash)
    const hasToken = window.location.hash.includes("access_token=") || 
                      window.location.search.includes("code=") ||
                      window.location.hash.includes("type=recovery");

    // Listen for PASSWORD_RECOVERY event from Supabase
    // This fires when the user clicks the reset link from their email
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true);
        setChecking(false);
      }
    });

    // Also check if there's already an active session (page refresh case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
        setChecking(false);
      } else if (!hasToken) {
        // Only stop checking if we don't expect a token exchange
        setChecking(false);
      }
    });

    // Safety timeout in case token exchange fails or hangs
    const safetyTimeout = setTimeout(() => {
      setChecking(false);
    }, 5000);

    return () => {
      subscription?.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Failed to reset password. Please request a new reset link.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AuthLayout icon={Lock} title="Verifying reset link..." subtitle="Please wait">
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AuthLayout>
    );
  }

  if (!sessionReady) {
    return (
      <AuthLayout icon={AlertTriangle} title="Invalid or expired link" subtitle="This password reset link has expired">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Please request a new password reset link.
          </p>
          <Button className="w-full h-12" onClick={() => window.location.href = '/forgot-password'}>
            Request New Link
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Lock}
      title="Set new password"
      subtitle="Enter your new password below"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting...</>
          ) : "Reset Password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
