import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { registerCitizen } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerCitizen(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full py-8">
      <div className="w-full max-w-md bg-surface-container rounded-2xl p-8 shadow-xl border border-outline-variant/30">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="material-symbols-outlined text-3xl">person_add</span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface m-0">Citizen Registration</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Create an account to report and track civic issues in Vadodara
          </p>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl font-body-md text-body-md mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Patel"
              className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-variant/40 focus:ring-2 focus:ring-secondary font-body-md"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ramesh@example.com"
              className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-variant/40 focus:ring-2 focus:ring-secondary font-body-md"
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-2">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-variant/40 focus:ring-2 focus:ring-secondary font-body-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-secondary text-on-secondary font-headline-md text-headline-md rounded-xl shadow-lg hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="font-body-md text-body-md text-on-surface-variant">Already registered? </span>
          <Link to="/login" className="font-label-md text-label-md text-secondary font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
