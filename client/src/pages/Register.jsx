import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { registerCitizen, pendingVerificationEmail, resendVerificationEmail } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerCitizen(name, email, password);
      setRegisteredEmail(email);
      setRegistered(true);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
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

  if (registered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full py-8">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-gray-200 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-[36px]">mark_email_unread</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 m-0 mb-2">Check Your Email</h1>
          <p className="text-sm text-gray-500 mb-1">
            We sent a verification link to
          </p>
          <p className="text-sm font-semibold text-gray-900 mb-6">{registeredEmail}</p>
          <p className="text-xs text-gray-500 mb-6">
            Click the link in the email to verify your account, then come back and sign in.
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

          <Link
            to="/login"
            className="block w-full py-3 bg-[#004085] hover:bg-[#002b5c] text-white font-semibold rounded-xl transition-all text-center"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full py-8">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#004085] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Citizen Registration</h1>
          <p className="text-sm text-gray-500 mt-2">
            Create an account to report and track civic issues in Vadodara
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              className="w-full bg-[#f2f4f7] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#004085]/20 focus:border-[#004085] outline-none transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ramesh@example.com"
              className="w-full bg-[#f2f4f7] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#004085]/20 focus:border-[#004085] outline-none transition-all text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-[#f2f4f7] border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#004085]/20 focus:border-[#004085] outline-none transition-all text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#004085] text-white font-semibold rounded-xl shadow-lg hover:bg-[#002b5c] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-500">Already registered? </span>
          <Link to="/login" className="text-sm text-[#004085] font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
