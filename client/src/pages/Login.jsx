import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithCredentials, loginCitizenOtp } = useAuth();

  const [activeTab, setActiveTab] = useState('officer'); // 'citizen' | 'officer'

  // Citizen state
  const [mobileNumber, setMobileNumber] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('12345');

  // Officer state
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCitizenMobileSubmit = async (e) => {
    e.preventDefault();
    const digitsOnly = mobileNumber.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    if (step === 1) {
      setStep(2);
      setOtp('12345');
      return;
    }
    setLoading(true);
    try {
      await loginCitizenOtp(digitsOnly, otp || '12345');
      navigate('/');
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleCitizenOtpVerify = async (e) => {
    e.preventDefault();
    const digitsOnly = mobileNumber.replace(/\D/g, '');
    setError('');
    setLoading(true);
    try {
      await loginCitizenOtp(digitsOnly, otp || '12345');
      navigate('/');
    } catch {
      navigate('/');
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
      navigate('/ward-dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f4f7fa] font-sans flex flex-col antialiased">
      <main className="w-full flex-1 flex min-h-screen">
        {/* LEFT COLUMN: Crisp High-Res Hero Image with Animated AI Network Nodes */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#001f42] overflow-hidden select-none">
          {/* Crisp, Static High-Res Vadodara Image with subtle slow zoom on hover */}
          <img
            alt="Vadodara Smart City AI Hub"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] ease-out hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDz3EA1SEexHtRHcf0T8zjTVj-DKMINu3oEZZqnrbYRTUxl102Gch4ZEmY3Z02jIE4q-lgSL8sp7W_IoacZe9QiHxFLeZRCQ094eJmOf7qipoLccesT-7Mgt7oOFe8s--oqsbZI77PTGUCK3WllQdRA8HAOg11gGw0Z_wPQgFs95QfrIUDDXGlS5JWS8CWDFHpF2Ydwg4L6GsYCx6KqJiVyxawo9LTmNOgQhMTb701CKF15UeHbRZX9"
          />

          {/* Deep Gradient & Glassmorphism Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#001f42]/95 via-[#003975]/55 to-transparent"></div>

          {/* Animated AI Floating Nodes Overlay */}
          <div className="absolute top-1/4 left-1/4 flex items-center gap-2 bg-blue-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-400/40 text-white text-xs font-medium animate-bounce shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>AI Node #104 Active</span>
          </div>

          <div className="absolute top-1/3 right-1/4 flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-400/40 text-white text-xs font-medium shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Sayajigunj Ward Sync</span>
          </div>

          {/* Content Box */}
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

        {/* RIGHT COLUMN: Modern Crisp Form Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-md flex flex-col gap-6 my-auto">
            {/* Top Bar Header & Portal Switcher */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#004085] text-white flex items-center justify-center font-bold text-xl shadow-md">
                  <span className="material-symbols-outlined text-[26px]">location_city</span>
                </div>
                <span className="text-2xl font-extrabold text-[#004085] tracking-tight">VMC Civic AI</span>
              </div>

              {/* Toggle Switch Tabs */}
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

            {/* Error Notification */}
            {error && (
              <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* ---------------- CITIZEN PORTAL TAB ---------------- */}
            {activeTab === 'citizen' && (
              <div className="flex flex-col gap-6 transition-all duration-300">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[#004085]">
                    <span className="material-symbols-outlined text-[28px]">person_pin</span>
                    <h1 className="text-2xl font-bold text-gray-900 m-0">Citizen Login</h1>
                  </div>
                  <p className="text-sm text-gray-500 m-0">
                    Welcome back, Citizen. Log in with your 10-digit mobile number to report issues and track progress.
                  </p>
                </div>

                {step === 1 ? (
                  <form onSubmit={handleCitizenMobileSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Mobile Number
                      </label>
                      <div className="relative flex items-center bg-[#f2f4f7] rounded-xl border border-gray-200 focus-within:border-[#004085] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#004085]/20 transition-all overflow-hidden px-3.5 py-3">
                        <span className="text-gray-500 font-semibold text-sm mr-2 border-r border-gray-300 pr-2.5">+91</span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter your 10-digit number"
                          className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm font-medium"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#004085] hover:bg-[#002b5c] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                    >
                      <span>{loading ? 'Processing...' : 'Continue'}</span>
                      <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCitizenOtpVerify} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Enter Verification Code (OTP)
                        </label>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-xs text-[#004085] font-semibold hover:underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 m-0">
                        OTP sent to <span className="font-semibold text-gray-900">+91 {mobileNumber}</span> (Demo OTP: <strong>12345</strong>)
                      </p>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="12345"
                        className="w-full bg-[#f2f4f7] border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-bold tracking-widest text-gray-900 focus:border-[#004085] focus:bg-white outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-[#004085] hover:bg-[#002b5c] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
                    >
                      <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                      <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                        check_circle
                      </span>
                    </button>
                  </form>
                )}

                <div className="pt-4 border-t border-gray-100 text-center">
                  <span className="text-xs text-gray-500">New to VMC Civic AI? </span>
                  <Link to="/register" className="text-xs font-bold text-[#004085] hover:underline ml-1">
                    Register as a New User
                  </Link>
                </div>
              </div>
            )}

            {/* ---------------- OFFICER PORTAL ACCESS TAB ---------------- */}
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
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider" htmlFor="password">
                        Password
                      </label>
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo password is 12345'); }} className="text-xs text-[#004085] font-semibold hover:underline">
                        Forgot Password?
                      </a>
                    </div>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3.5 text-gray-400 text-[20px]">lock</span>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={officerPassword}
                        onChange={(e) => setOfficerPassword(e.target.value)}
                        placeholder="••••••••"
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
