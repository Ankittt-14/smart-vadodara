import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import AIProcessingResult from './pages/AIProcessingResult';
import WardDashboard from './pages/WardDashboard';
import PublicOutcome from './pages/PublicOutcome';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

function AppRoutes() {
  const { isAuthenticated, loading, isOfficer } = useAuth();

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f4f7fa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#004085] text-white flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-[28px]">location_city</span>
          </div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/processing" element={<AIProcessingResult />} />
        <Route path="/processing/:id" element={<AIProcessingResult />} />
        <Route path="/ward-dashboard" element={isOfficer ? <WardDashboard /> : <Navigate to="/" replace />} />
        <Route path="/outcome" element={<PublicOutcome />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
