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
  const [role, setRole] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { data: colleges = [] } = useQuery({ queryKey: ['colleges'], queryFn: () => base44.entities.College.list() });

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      // Step 1: Create Supabase auth account
      const result = await base44.auth.register({ email, password });
      const user = result?.user;

      // Step 2: Create TeamMember profile record immediately
      const finalStatus = role === 'admin' ? 'pending_approval' : 'active';
      await base44.entities.TeamMember.create({
        full_name: fullName,
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

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <AuthLayout icon={Mail} title="Account created!" subtitle={`Welcome to Beacon Studios, ${fullName}`}>
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Your account has been created! You can now log in with your credentials.
            {role === 'admin' && (
              <span className="block mt-2 font-medium text-amber-600">
                ⏳ Admin accounts require approval from an existing admin before access is granted.
              </span>
            )}
          </p>
          <Link to="/login" className="block">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Step 2: Profile Details
  if (step === 2) {
    return (
      <AuthLayout icon={User} title="Tell us about yourself" subtitle="Complete your profile to get started">
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10 h-12" required />
            </div>
          </div>

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

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Your phone number" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10 h-12" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button
              type="button"
              className="flex-1 h-12 font-medium"
              onClick={() => {
                if (!fullName) { setError("Please enter your full name"); return; }
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

  // Step 1: Email & Password
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
      <form onSubmit={(e) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) { setError("Passwords do not match"); return; }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
        setStep(2);
      }} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10 h-12" required />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="confirm" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium">
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </AuthLayout>
  );
}
