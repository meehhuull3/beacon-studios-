import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Mail, Lock, Loader2, User, Phone, GraduationCap, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [emailError, setEmailError] = useState("");

  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });

  const checkUsername = async (enteredUsername) => {
    if (!enteredUsername) {
      setUsernameError("");
      setUsernameAvailable(false);
      return;
    }
    try {
      const results = await base44.entities.TeamMember.filter({ username: enteredUsername });
      if (results && results.length > 0) {
        setUsernameError("This username is already taken");
        setUsernameAvailable(false);
      } else {
        setUsernameError("");
        setUsernameAvailable(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const checkEmail = async (enteredEmail) => {
    if (!enteredEmail) {
      setEmailError("");
      return;
    }
    try {
      const results = await base44.entities.TeamMember.filter({ email: enteredEmail });
      if (results && results.length > 0) {
        setEmailError("An account with this email already exists.");
      } else {
        setEmailError("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      // Step 1: Create Supabase auth account
      const result = await base44.auth.register({ email, password });

      // Step 2: Create TeamMember profile record immediately
      const finalStatus = 'pending_approval';
      await base44.entities.TeamMember.create({
        full_name: fullName,
        username,
        email,
        phone: phone || null,
        college_id: (role === 'associate' || role === 'admin') ? null : (collegeId || null),
        role,
        position: role === 'core_team' ? position : null,
        user_id: result.user?.id || null,
        status: finalStatus,
      });

      // Step 3: Notify admins
      try {
        await base44.entities.Notification.create({
          type: 'broadcast',
          message: `New signup: ${fullName} (${email}) has requested to join as ${role === 'core_team' ? `Core Team - ${position}` : role}.`,
          target_role: 'admin',
          actor_name: fullName,
        });
      } catch {}

      // Auto login so AuthContext can verify session and show PendingApproval page
      try {
        await base44.auth.loginViaEmailPassword(email, password);
      } catch (loginErr) {
        console.warn("Auto login after registration failed:", loginErr);
      }
      window.location.href = '/';
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Profile Details
  if (step === 2) {
    return (
      <AuthLayout icon={User} title="Tell us about yourself" subtitle="Complete your profile to get started">
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-12"><SelectValue placeholder="Select your role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="core_team">Core Team</SelectItem>
                <SelectItem value="associate">Associate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === 'core_team' && (
            <div className="space-y-2">
              <Label>Position *</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select your position" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="president">President</SelectItem>
                  <SelectItem value="vice_president">Vice President</SelectItem>
                  <SelectItem value="marketing">Marketing Team</SelectItem>
                  <SelectItem value="tech">Tech Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(role === 'faculty' || role === 'core_team') && (
            <div className="space-y-2">
              <Label>College *</Label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Select value={collegeId} onValueChange={setCollegeId}>
                  <SelectTrigger className="h-12 pl-10"><SelectValue placeholder="Select your college" /></SelectTrigger>
                  <SelectContent>
                    {colleges.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {(role === 'associate' || role === 'admin') && (
            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              {role === 'associate'
                ? '🌐 Associates manage all colleges globally — no college selection needed.'
                : '🔐 Admin accounts require approval from an existing admin before access is granted.'}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button
              type="button"
              className="flex-1 h-12 font-medium"
              onClick={() => {
                if (!role) { setError("Please select your role"); return; }
                if ((role === 'faculty' || role === 'core_team') && !collegeId) { setError("Please select your college"); return; }
                if (role === 'core_team' && !position) { setError("Please select your position"); return; }
                setError("");
                handleRegister();
              }}
              disabled={loading}
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Account"}
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Step 1: Profile Details (FullName, Username, Email, Phone, Passwords)
  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to join Beacon Studios"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">Log in</Link>
        </>
      }
    >
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <form onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        
        if (!fullName.trim()) { setError("Please enter your full name"); return; }
        if (!username.trim()) { setError("Please enter a username"); return; }
        
        setLoading(true);
        try {
          const usernameCheck = await base44.entities.TeamMember.filter({ username });
          if (usernameCheck && usernameCheck.length > 0) {
            setUsernameError("This username is already taken");
            setError("This username is already taken");
            setLoading(false);
            return;
          }
          const emailCheck = await base44.entities.TeamMember.filter({ email });
          if (emailCheck && emailCheck.length > 0) {
            setEmailError("An account with this email already exists.");
            setError("An account with this email already exists.");
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Uniqueness check failed:", err);
        } finally {
          setLoading(false);
        }

        if (password !== confirmPassword) { setError("Passwords do not match"); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
        setStep(2);
      }} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="fullName"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="username"
              placeholder="unique_username"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              onBlur={() => checkUsername(username)}
              className="pl-10 h-12"
              required
            />
          </div>
          {usernameError && (
            <p className="text-xs text-destructive mt-1">{usernameError}</p>
          )}
          {usernameAvailable && !usernameError && username && (
            <p className="text-xs text-emerald-600 mt-1">✓ Username available</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => checkEmail(email)}
              className="pl-10 h-12"
              required
            />
          </div>
          {emailError && (
            <p className="text-xs text-destructive mt-1">{emailError}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              placeholder="Your phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Create Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Create Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
        </Button>
      </form>
    </AuthLayout>
  );
}
