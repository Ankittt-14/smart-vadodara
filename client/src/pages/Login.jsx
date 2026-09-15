import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const {
    loginWithEmail,
    loginWithGoogle,
    loginWithCredentials,
    pendingVerificationEmail,
    resendVerificationEmail,
  } = useAuth();

  const [activeTab, setActiveTab] = useState('citizen');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [officerEmail, setOfficerEmail] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [showOfficerPassword, setShowOfficerPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationBlocked, setShowVerificationBlocked] = useState(false);
  const [blockedEmail, setBlockedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const handleCitizenLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/email-not-verified') {
        setBlockedEmail(email);
        setShowVerificationBlocked(true);
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please register first.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('');
      } else {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOfficerLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithCredentials(officerEmail, officerPassword);
      navigate('/ward-dashboard');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg('');
    try {
      await resendVerificationEmail();
      setResendMsg('Verification email sent! Check your inbox.');
    } catch {
      setResendMsg('Failed to send. Try again in a moment.');
    } finally {
      setResending(false);
    }
  };

  // Verification blocked screen
  if (showVerificationBlocked) {
    return (
      <div className="w-full min-h-screen bg-[#f4f7fa] font-sans flex flex-col antialiased">
        <main className="w-full flex-1 flex min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-gray-200 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[36px]">block</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 m-0 mb-2">Email Not Verified</h1>
            <p className="text-sm text-gray-500 mb-1">
              Please verify your email to continue.
            </p>
            <p className="text-sm font-semibold text-gray-900 mb-6">{blockedEmail}</p>
            <p className="text-xs text-gray-500 mb-6">
              We sent a verification link when you registered. Check your inbox and click the link to verify your account.
            </p>

            {resendMsg && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-sm mb-4">
                {resendMsg}
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all mb-3 cursor-pointer disabled:opacity-60"
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>

            <button
              onClick={() => {
                setShowVerificationBlocked(false);
                setBlockedEmail('');
                setResendMsg('');
                setError('');
              }}
              className="w-full py-3 bg-[#004085] hover:bg-[#002b5c] text-white font-semibold rounded-xl transition-all cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f4f7fa] font-sans flex flex-col antialiased">
      <main className="w-full flex-1 flex min-h-screen">
        {/* LEFT COLUMN: Hero Image */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#001f42] overflow-hidden select-none">
          <img
            alt="Vadodara Smart City AI Hub"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] ease-out hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz3EA1SEexHtRHcf0T8zjTVj-DKMINu3oEZZqnrbYRTUxl102Gch4ZEmY3Z02jIE4q-lgSL8sp7W_IoacZe9QiHxFLeZRCQ094eJmOf7qipoLccesT-7Mgt7oOFe8s--oqsbZI77PTGUCK3WllQdRA8HAOg11gGw0Z_wPQgFs95QfrIUDDXGlS5JWS8CWDFHpF2Ydwg4L6GsYCx6KqJiVyxawo9LTmNOgQhMTb701CKF15UeHbRZX9"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001f42]/95 via-[#003975]/55 to-transparent"></div>

          <div className="absolute top-1/4 left-1/4 flex items-center gap-2 bg-blue-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-400/40 text-white text-xs font-medium animate-bounce shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>AI Node #104 Active</span>
          </div>

          <div className="absolute top-1/3 right-1/4 flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-400/40 text-white text-xs font-medium shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Sayajigunj Ward Sync</span>
          </div>

          <div className="absolute bottom-0 left-0 p-12 text-white flex flex-col gap-4 z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/25 text-xs font-semibold tracking-wider uppercase text-blue-100 w-fit shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              VMC Civic AI Governance Platform
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white m-0 leading-tight drop-shadow-md">
              Smart City Vision
            </h2>
            <p className="text-base text-blue-100/90 leading-relaxed max-w-lg m-0 font-normal drop-shadow-sm">
              Empowering Vadodara with AI-driven civic governance and connected infrastructure for a sustainable, resilient future.
            </p>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/15 text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                <span>Real-Time AI Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-300 text-[18px]">cell_tower</span>
                <span>Automated Ward Dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-md flex flex-col gap-6 my-auto">
            {/* Header & Tab Switcher */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#004085] text-white flex items-center justify-center font-bold text-xl shadow-md">
                  <span className="material-symbols-outlined text-[26px]">location_city</span>
                </div>
                <span className="text-2xl font-extrabold text-[#004085] tracking-tight">VMC Civic AI</span>
              </div>

              <div className="flex items-center bg-gray-100 p-1.5 rounded-full border border-gray-200 text-xs font-semibold shadow-inner">
                <button
                  type="button"
                  onClick={() => { setActiveTab('citizen'); setError(''); }}
                  className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
                    activeTab === 'citizen'
                      ? 'bg-[#004085] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('officer'); setError(''); }}
                  className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
                    activeTab === 'officer'
                      ? 'bg-[#004085] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Officer
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* ---- CITIZEN PORTAL TAB ---- */}
            {activeTab === 'citizen' && (
              <div className="flex flex-col gap-6 transition-all duration-300">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[#004085]">
                    <span className="material-symbols-outlined text-[28px]">person_pin</span>
                    <h1 className="text-2xl font-bold text-gray-900 m-0">Citizen Login</h1>
                  </div>
                  <p className="text-sm text-gray-500 m-0">
                    Sign in to report civic issues and track resolution progress in Vadodara.
                  </p>
                </div>

                {/* Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-700 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group cursor-pointer disabled:opacity-60"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleCitizenLogin} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-gray-400 text-[20px]">mail</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-[#f2f4f7] text-gray-900 text-sm font-medium pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#004085] focus:bg-white focus:ring-2 focus:ring-[#004085]/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Password
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-gray-400 text-[20px]">lock</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full bg-[#f2f4f7] text-gray-900 text-sm font-medium pl-10 pr-11 py-3 rounded-xl border border-gray-200 focus:border-[#004085] focus:bg-white focus:ring-2 focus:ring-[#004085]/20 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-gray-400 hover:text-gray-700 transition-colors focus:outline-none cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#004085] hover:bg-[#002b5c] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                  >
                    <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </form>

                <div className="pt-4 border-t border-gray-100 text-center">
                  <span className="text-xs text-gray-500">New to VMC Civic AI? </span>
                  <Link to="/register" className="text-xs font-bold text-[#004085] hover:underline ml-1">
                    Register as a New User
                  </Link>
                </div>
              </div>
            )}

            {/* ---- OFFICER PORTAL ACCESS TAB ---- */}
            {activeTab === 'officer' && (
              <div className="flex flex-col gap-6 transition-all duration-300">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[#004085]">
                    <span className="material-symbols-outlined text-[28px]">admin_panel_settings</span>
                    <h1 className="text-2xl font-bold text-gray-900 m-0">Officer Portal Access</h1>
                  </div>
                  <p className="text-sm text-gray-500 m-0">
                    Secure access for authorized VMC staff, Ward Engineers, and administrative officers.
                  </p>
                </div>

                <form onSubmit={handleOfficerLogin} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider" htmlFor="employee-id">
                      Employee ID / VMC Email
                    </label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-gray-400 text-[20px]">badge</span>
                      <input
                        id="employee-id"
                        type="text"
                        required
                        value={officerEmail}
                        onChange={(e) => setOfficerEmail(e.target.value)}
                        placeholder="Enter ID or email"
                        className="w-full bg-[#f2f4f7] text-gray-900 text-sm font-medium pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#004085] focus:bg-white focus:ring-2 focus:ring-[#004085]/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider" htmlFor="officer-password">
                        Password
                      </label>
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password is 12345'); }} className="text-xs text-[#004085] font-semibold hover:underline">
                        Forgot Password?
                      </a>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-gray-400 text-[20px]">lock</span>
                      <input
                        id="officer-password"
                        type={showOfficerPassword ? 'text' : 'password'}
                        required
                        value={officerPassword}
                        onChange={(e) => setOfficerPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f2f4f7] text-gray-900 text-sm font-medium pl-10 pr-11 py-3 rounded-xl border border-gray-200 focus:border-[#004085] focus:bg-white focus:ring-2 focus:ring-[#004085]/20 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOfficerPassword(!showOfficerPassword)}
                        className="absolute right-3.5 text-gray-400 hover:text-gray-700 transition-colors focus:outline-none cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showOfficerPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#004085] hover:bg-[#002b5c] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 mt-1"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>

                  <div className="flex items-start gap-2.5 p-3.5 bg-[#f2f4f7] border border-gray-200 rounded-xl mt-1 text-xs text-gray-600">
                    <span className="material-symbols-outlined text-gray-500 text-[18px] shrink-0 mt-0.5">info</span>
                    <p className="m-0 leading-relaxed">
                      This is a restricted government portal. All activities are monitored and logged.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
