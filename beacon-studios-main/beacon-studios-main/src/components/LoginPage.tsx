import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Building, Rocket, ShieldCheck, Mail, ArrowRight, 
  ArrowLeft, User as UserIcon, Lock, Award, KeyRound, Check 
} from 'lucide-react';
import BeaconLogo, { BeaconWordmark } from './BeaconLogo';
import ThemeToggle from './ThemeToggle';
import { dbService } from '../supabaseClient';
import { User, College, UserRole, PortalType } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

type AuthStage = 'login' | 'signup' | 'forgot_password';

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [stage, setStage] = useState<AuthStage>('login');
  const [colleges, setColleges] = useState<College[]>([]);

  // Password hide/show states
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);

  // Error and success messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(''); // email or username
  const [loginPassword, setLoginPassword] = useState('');

  // 2. Signup form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Core Team');
  const [regCollegeId, setRegCollegeId] = useState('');
  const [regCoreTeamRole, setRegCoreTeamRole] = useState('Marketing and Sales');
  const [regPassword, setRegPassword] = useState('');

  // 3. Forgot Password state
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  // Fetch colleges list for selectors
  useEffect(() => {
    dbService.getColleges().then(list => {
      setColleges(list);
      if (list.length > 0) {
        setRegCollegeId(list[0].id);
      }
    });
  }, []);

  // Validation pattern for email
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Trigger Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const identTrimmed = loginIdentifier.trim();
    const passTrimmed = loginPassword;

    if (!identTrimmed) {
      setErrorMsg('Please enter your unique username or registered email ID.');
      return;
    }
    if (!passTrimmed) {
      setErrorMsg('Please enter your secure password.');
      return;
    }

    // Lookup user
    const matchedUser = await dbService.getUserByEmailOrUsername(identTrimmed);
    if (!matchedUser) {
      setErrorMsg('No active Beacon Indica profile detected matching those credentials.');
      return;
    }

    // Verify Password (fallback mock check or matched value check)
    // If user has a password set, compare it. If not, fallback to 'demo123' for smooth testing
    const registeredPassword = matchedUser.password || 'demo123';
    if (registeredPassword !== passTrimmed) {
      setErrorMsg('Incorrect password! Check security key caps or attempt reset.');
      return;
    }

    // Successful Login
    onLoginSuccess(matchedUser);
  };

  // Trigger Registration Sign Up
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const name = regName.trim();
    const username = regUsername.trim().toLowerCase();
    const email = regEmail.trim();
    const password = regPassword;

    if (!name) {
      setErrorMsg('Please specify your first and last name.');
      return;
    }
    if (!username) {
      setErrorMsg('Please claim a unique username.');
      return;
    }
    if (!email || !validateEmail(email)) {
      setErrorMsg('Please state a valid active email ID.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('Please formulate a secure password of at least 4 characters.');
      return;
    }

    // Build user record attributes
    const initials = name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 3)
      .toUpperCase() || 'US';

    const portal: PortalType = (regRole === 'Admin' || regRole === 'Associate') ? 'bi' : 'college';
    const college_id = (portal === 'college') ? regCollegeId : null;
    const core_team_role = (regRole === 'Core Team') ? regCoreTeamRole : undefined;

    try {
      await dbService.registerUser({
        name,
        username,
        email,
        initials,
        role: regRole,
        portal,
        college_id,
        password,
        core_team_role
      });

      setSuccessMsg('Account registered successfully! Try signing in with your unique credentials now.');
      
      // Auto transition to login page & pre-fill username
      setLoginIdentifier(username);
      setLoginPassword('');
      setStage('login');
      
      // Reset registration form attributes
      setRegName('');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error arose during credentials validation.');
    }
  };

  // Trigger Forgot Password Reset
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const username = forgotUsername.trim().toLowerCase();
    const newPass = forgotNewPassword;
    const confirmPass = forgotConfirmPassword;

    if (!username) {
      setErrorMsg('Please input your registered username.');
      return;
    }
    if (!newPass) {
      setErrorMsg('Please write your new desired security key.');
      return;
    }
    if (newPass.length < 4) {
      setErrorMsg('Your password must contain at least 4 characters for clearance.');
      return;
    }
    if (newPass !== confirmPass) {
      setErrorMsg('Your passwords do not match. Verify characters.');
      return;
    }

    const updated = await dbService.updateUserPassword(username, newPass);
    if (!updated) {
      setErrorMsg('That username is not recognized in our ecosystem directory.');
      return;
    }

    setSuccessMsg('Your security credential has been altered successfully! Sign in to enter.');
    setLoginIdentifier(username);
    setLoginPassword(newPass);
    setStage('login');

    // Reset forgot password state
    setForgotUsername('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
  };

  return (
    <div className="min-h-screen w-full flex bg-[#1B2240] relative" id="screen-login">
      {/* Floating Theme Switcher */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* LEFT COLUMN: Premium Info Dashboard Banner Overlay */}
      <div className="hidden lg:flex flex-1 flex-col justify-between px-16 py-16 relative overflow-hidden bg-gradient-to-br from-[#1B2240] to-[#0d111d]">
        {/* Visual ambient circles */}
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-radial from-[rgba(45,197,162,0.12)] to-transparent pointer-events-none" />
        <div className="absolute bottom-[-150px] left-[-80px] w-96 h-96 rounded-full bg-radial from-[rgba(45,197,162,0.06)] to-transparent pointer-events-none" />

        <div className="relative z-10 text-left">
          <BeaconWordmark dark={false} size={42} showSub={true} />
        </div>

        <div className="relative z-10 max-w-xl text-left">
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 text-[#2DC5A2] text-xs font-bold uppercase tracking-wider mb-5 inline-block">
            ● Beacon Indica Ecosystem Portals
          </span>
          <h1 className="font-['Bricolage_Grotesque'] text-[42px] font-black text-white leading-[1.12] mb-6 tracking-tight">
            Connect. Coordinate.<br />Build real partnerships.<br /><span className="text-[#2DC5A2]">No friction, live updates.</span>
          </h1>
          <p className="text-[14.5px] text-slate-400 leading-relaxed max-w-md mb-8">
            An operating workspace linking national incubator administrators, regional coordinators, academic faculties, and student core team leads across multiple states.
          </p>

          {/* Core Hierarchy Features */}
          <div className="grid grid-cols-2 gap-5 pt-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-[#2DC5A2] mb-2" />
              <div className="font-bold text-white text-xs mb-1">Hierarchy Clearance</div>
              <div className="text-[11px] text-slate-400">Custom views for Admins, Associates, Mentors, and Teams.</div>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <Rocket className="w-5 h-5 text-[#2DC5A2] mb-2" />
              <div className="font-bold text-white text-xs mb-1">Interactive Milestones</div>
              <div className="text-[11px] text-slate-400">Launch programs, track student cohort startups, and file approvals.</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-left text-xs text-slate-400/80">
          © 2026 Beacon Indica Inc. Real-time monitoring and reporting workspace. All rights secured.
        </div>
      </div>

      {/* RIGHT COLUMN: Dynamic Interactive Access Card (Forms) */}
      <div className="w-full lg:w-[500px] bg-white dark:bg-[#161b2b] flex flex-col justify-center px-8 sm:px-14 py-12 transition-all">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Branding */}
          <div className="block lg:hidden mb-8 text-left">
            <BeaconWordmark dark={true} size={36} showSub={true} />
          </div>

          {/* Feedback banners */}
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/25 border border-red-200/60 dark:border-red-900/30 rounded-xl p-3.5 text-xs text-red-600 dark:text-red-400 mb-6 flex items-start gap-3">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span className="text-left font-semibold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200/60 dark:border-emerald-900/30 rounded-xl p-3.5 text-xs text-emerald-700 dark:text-emerald-400 mb-6 flex items-start gap-3">
              <span className="shrink-0 text-emerald-500 mt-0.5">✓</span>
              <span className="text-left font-semibold leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* STAGE CONTAINER */}
          {stage === 'login' ? (
            /* ==================== 1. LOGIN SCREEN ==================== */
            <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
              <div>
                <h2 className="font-['Bricolage_Grotesque'] text-[28px] font-black text-[#1B2240] dark:text-white leading-tight">Welcome back</h2>
                <p className="text-xs text-[#8891B0] dark:text-slate-400 mt-1">Access your personalized operations center</p>
              </div>

              <div className="space-y-4">
                {/* Username or Email ID */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#4A5270] dark:text-slate-300 uppercase tracking-wider block">Username or Email ID</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. rahul, admin, or you@institute.edu" 
                      className="w-full pl-10 pr-4 py-3 border-2 border-[#E2E5EC] dark:border-[rgba(255,255,255,0.1)] rounded-xl text-xs text-[#1B2240] dark:text-white bg-slate-50 dark:bg-slate-900/40 focus:border-[#2DC5A2] focus:bg-white transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#4A5270] dark:text-slate-300 uppercase tracking-wider block">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setStage('forgot_password');
                      }}
                      className="text-[11px] text-[#2DC5A2] hover:underline font-bold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter security key" 
                      className="w-full pl-10 pr-11 py-3 border-2 border-[#E2E5EC] dark:border-[rgba(255,255,255,0.1)] rounded-xl text-xs text-[#1B2240] dark:text-white bg-slate-50 dark:bg-slate-900/40 focus:border-[#2DC5A2] focus:bg-white transition-all outline-none"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8891B0] hover:text-[#4A5270] outline-none"
                    >
                      {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#1B2240] text-white hover:bg-slate-800 active:scale-[0.99] font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Authorize Workspace Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/45 text-center text-xs">
                <span className="text-[#8891B0] dark:text-slate-400">Need a partner account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setStage('signup');
                  }}
                  className="font-extrabold text-[#2DC5A2] hover:underline"
                >
                  Create free account now
                </button>
              </div>

              {/* Minimal help hints for reviewers (since demo list is removed) */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Developer Quick Reference Links:</div>
                <div>• Initial accounts exist for: <span className="font-semibold text-slate-700 dark:text-slate-200">admin</span>, <span className="font-semibold text-slate-700 dark:text-slate-200">associate</span>, <span className="font-semibold text-slate-700 dark:text-slate-200">rahul</span>, or <span className="font-semibold text-slate-700 dark:text-slate-200">priya</span> (all with password: <span className="italic font-semibold text-emerald-600">demo123</span>).</div>
                <div>• Or sign up as a new user with any unique brand username you fancy!</div>
              </div>
            </form>
          ) : stage === 'signup' ? (
            /* ==================== 2. SIGNUP SCREEN ==================== */
            <form onSubmit={handleSignupSubmit} className="space-y-4 text-left">
              <div>
                <h2 className="font-['Bricolage_Grotesque'] text-[26px] font-black text-[#1B2240] dark:text-white leading-tight">Join Ecosystem</h2>
                <p className="text-xs text-[#8891B0] dark:text-slate-400 mt-1">Register your profile to align operational insights</p>
              </div>

              <div className="space-y-3.5">
                {/* Full name input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#4A5270] dark:text-slate-300 uppercase tracking-wider block">Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Satish Patil"
                    className="w-full px-3.5 py-2.5 border-2 border-[#E2E5EC] dark:border-[rgba(255,255,255,0.1)] rounded-xl text-xs text-[#1B2240] dark:text-white bg-slate-50 dark:bg-slate-900/40 focus:border-[#2DC5A2] focus:bg-white outline-none"
                    required
                  />
                </div>

                {/* Grid for credentials (Username & Email) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#4A5270] dark:text-slate-300 uppercase tracking-wider block">Username (Unique)</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. satish_patil"
                      className="w-full px-3.5 py-2.5 border-2 border-[#E2E5EC] dark:border-[rgba(255,255,255,0.1)] rounded-xl text-xs text-[#1B2240] dark:text-white bg-slate-50 dark:bg-slate-900/40 focus:border-[#2DC5A2] focus:bg-white outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#4A5270] dark:text-slate-300 uppercase tracking-wider block">Email Address</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="satish@institute.edu"
                      className="w-full px-3.5 py-2.5 border-2 border-[#E2E5EC] dark:border-[rgba(255,255,255,0.1)] rounded-xl text-xs text-[#1B2240] dark:text-white bg-slate-50 dark:bg-slate-900/40 focus:border-[#2DC5A2] focus:bg-white outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Role selection dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#4A5270] dark:text-slate-300 uppercase tracking-wider block">Ecosystem Post / Position</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 border-2 border-[#E2E5EC] dark:border-[rgba(255,255,255,0.1)] rounded-xl text-xs text-[#1B2240] dark:text-white bg-slate-50 dark:bg-slate-900/40 focus:border-[#2DC5A2] cursor-pointer"
                  >
                    <option value="Core Team">🎓 Core Team Member (Campus rep)</option>
                    <option value="Faculty">🏫 Faculty Mentor / Advisor</option>
                    <option value="Associate">💼 BI Regional Associate</option>
                    <option value="Admin">🔑 BI Head Administrator</option>
                  </select>
                </div>

                {/* CONDITIONAL FIELD: COLLEGE SELECTOR */}
                {(regRole === 'Core Team' || regRole === 'Faculty') && (
                  <div className="space-y-1 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2.5 transition-all">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">Select College Campus</label>
                      <select
                        value={regCollegeId}
                        onChange={(e) => setRegCollegeId(e.target.value)}
                        className="w-full px-3 py-2 border border-emerald-200 dark:border-emerald-900/30 rounded-lg text-xs bg-white dark:bg-slate-900 text-[#1B2240] dark:text-white"
                        required
                      >
                        {colleges.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                        ))}
                      </select>
                    </div>

                    {/* CONDITIONAL SECONDARY ROLE IN CORE TEAM */}
                    {regRole === 'Core Team' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">Core Team Segment Role</label>
                        <select
                          value={regCoreTeamRole}
                          onChange={(e) => setRegCoreTeamRole(e.target.value)}
                          className="w-full px-3 py-2 border border-emerald-200 dark:border-emerald-900/30 rounded-lg text-xs bg-white dark:bg-slate-900 text-[#1B2240] dark:text-white"
                        >
                          <option value="President">👑 President (Cohort Authority Lead)</option>
                          <option value="Vice President">👥 Vice President (Operations)</option>
                          <option value="Marketing and Sales">📈 Marketing & Sales Representative</option>
                          <option value="Tech Team">💻 Tech Team & Infrastructure lead</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Password field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#4A5270] dark:text-slate-300 uppercase tracking-wider block">Setup Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type={showRegPassword ? "text" : "password"} 
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create security combination" 
                      className="w-full pl-10 pr-11 py-2.5 border-2 border-[#E2E5EC] dark:border-[rgba(255,255,255,0.1)] rounded-xl text-xs text-[#1B2240] dark:text-white bg-slate-50 dark:bg-slate-900/40 focus:border-[#2DC5A2] focus:bg-white outline-none"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8891B0] hover:text-[#4A5270]"
                    >
                      {showRegPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-[#2DC5A2] text-[#1B2240] hover:bg-[#22a088] active:scale-[0.99] font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md mt-4"
              >
                <span>Complete Registration</span>
                <Check className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/45 text-center text-xs">
                <span className="text-[#8891B0] dark:text-slate-400">Already have an authorized profile? </span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setStage('login');
                  }}
                  className="font-extrabold text-[#2DC5A2] hover:underline"
                >
                  Return to login
                </button>
              </div>
            </form>
          ) : (
            /* ==================== 3. FORGOT PASSWORD ==================== */
            <form onSubmit={handleForgotSubmit} className="space-y-5 text-left animate-fade-in">
              <div>
                <h2 className="font-['Bricolage_Grotesque'] text-[26px] font-black text-[#1B2240] dark:text-white leading-tight flex items-center gap-2">
                  <KeyRound className="w-6 h-6 text-[#2DC5A2]" />
                  <span>Credential Reset</span>
                </h2>
                <p className="text-xs text-[#8891B0] dark:text-slate-400 mt-1">Change credentials instantly without verification constraints</p>
              </div>

              <div className="space-y-4">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#4A5270] dark:text-slate-300 uppercase tracking-wider block">Ecosystem Username</label>
                  <input
                    type="text"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="Enter unique username (e.g. rahul)"
                    className="w-full px-3.5 py-3 border-2 border-[#E2E5EC] dark:border-[rgba(255,255,255,0.1)] rounded-xl text-xs text-[#1B2240] dark:text-white bg-slate-50 dark:bg-slate-900/40 focus:border-[#2DC5A2] focus:bg-white outline-none"
                    required
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#4A5270] dark:text-slate-300 uppercase tracking-wider block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type={showForgotNewPassword ? "text" : "password"}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Specify customized password key"
                      className="w-full pl-10 pr-11 py-3 border-2 border-[#E2E5EC] dark:border-[rgba(255,255,255,0.1)] rounded-xl text-xs text-[#1B2240] dark:text-white bg-slate-50 dark:bg-slate-900/40 focus:border-[#2DC5A2] focus:bg-white outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8891B0] hover:text-[#4A5270]"
                    >
                      {showForgotNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#4A5270] dark:text-slate-300 uppercase tracking-wider block">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type={showForgotConfirmPassword ? "text" : "password"}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Repeat desired combination key"
                      className="w-full pl-10 pr-11 py-3 border-2 border-[#E2E5EC] dark:border-[rgba(255,255,255,0.1)] rounded-xl text-xs text-[#1B2240] dark:text-white bg-slate-50 dark:bg-slate-900/40 focus:border-[#2DC5A2] focus:bg-white outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8891B0] hover:text-[#4A5270]"
                    >
                      {showForgotConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1B2240] text-white hover:bg-slate-800 active:scale-[0.99] font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>Save New Secret Key Credentials</span>
                <Check className="w-4 h-4 text-[#2DC5A2]" />
              </button>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/45 text-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setStage('login');
                  }}
                  className="font-extrabold text-[#2DC5A2] hover:underline flex items-center justify-center gap-1.5 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to login gate</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-[11px] text-[#8891B0] dark:text-slate-500 text-center">
            By accessing this node, you align with Beacon Indica's active compliance terms and cohort coordination protocol.
          </div>
        </div>
      </div>
    </div>
  );
}
