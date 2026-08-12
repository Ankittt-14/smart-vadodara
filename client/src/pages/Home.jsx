import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setVal(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return <>{val.toLocaleString()}{suffix}</>;
}

const STEPS = [
  { icon: 'add_a_photo', title: '1. Citizen/Staff Report', desc: 'Submit photo and GPS location.', bg: 'bg-primary-container', fg: 'text-on-primary-container' },
  { icon: 'memory', title: '2. AI Processing', desc: 'Categorization & risk assessment.', bg: 'bg-secondary-container', fg: 'text-on-secondary-container' },
  { icon: 'assignment_ind', title: '3. Ward Assignment', desc: 'Routed to appropriate engineer.', bg: 'bg-tertiary-container', fg: 'text-on-tertiary-container' },
  { icon: 'verified', title: '4. Verified Resolution', desc: 'Issue closed with proof.', bg: 'bg-primary', fg: 'text-on-primary' },
];

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalResolved: 0, totalActive: 0, avgConfidence: 94 });

  useEffect(() => {
    api.get('/api/stats').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col w-full">
      <div className="relative bg-surface rounded-xl p-8 mb-margin-desktop shadow-sm flex flex-col md:flex-row items-center gap-gutter">
        <div className="flex-1 space-y-6">
          <h1 className="font-display-lg text-display-lg text-on-surface">AI-Powered Civic Management for Vadodara</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Automating issue detection, prioritizing high-risk repairs, and ensuring municipal transparency.
          </p>
          <div className="flex flex-wrap gap-base pt-4">
            <button onClick={() => navigate('/report')} className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-full transition-colors flex items-center shadow-md">
              <span className="material-symbols-outlined mr-2">report</span> Report a Civic Issue
            </button>
            <button onClick={() => navigate('/ward-dashboard')} className="bg-secondary hover:bg-secondary-container text-on-secondary font-label-md text-label-md px-6 py-3 rounded-full transition-colors flex items-center shadow-md">
              <span className="material-symbols-outlined mr-2">engineering</span> Engineer Portal
            </button>
            <button onClick={() => navigate('/outcome')} className="bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md px-6 py-3 rounded-full transition-colors flex items-center shadow-sm">
              <span className="material-symbols-outlined mr-2">dashboard</span> View Public Dashboard
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-primary via-primary-container to-secondary flex items-center justify-center">
          <span className="material-symbols-outlined text-white/90" style={{ fontSize: 96 }}>satellite_alt</span>
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl p-8 mb-margin-desktop shadow-sm">
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8 text-center">How it Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter relative">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-outline-variant/30 hidden md:block -z-10"></div>
          {STEPS.map((s) => (
            <div key={s.title} className="flex flex-col items-center text-center p-4 relative bg-surface rounded-xl shadow-sm z-10 transition-transform hover:-translate-y-2">
              <div className={`w-16 h-16 rounded-full ${s.bg} ${s.fg} flex items-center justify-center mb-4 shadow-md`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">{s.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div className="bg-surface rounded-xl p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
          <span className="material-symbols-outlined text-display-lg text-primary mb-4">check_circle</span>
          <div className="font-display-lg text-display-lg text-on-surface mb-2"><Counter target={stats.totalResolved} /></div>
          <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Issues Resolved</div>
        </div>
        <div className="bg-surface rounded-xl p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
          <span className="material-symbols-outlined text-display-lg text-error mb-4">pending_actions</span>
          <div className="font-display-lg text-display-lg text-on-surface mb-2"><Counter target={stats.totalActive} /></div>
          <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Active Reports</div>
        </div>
        <div className="bg-surface rounded-xl p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
          <span className="material-symbols-outlined text-display-lg text-secondary mb-4">analytics</span>
          <div className="font-display-lg text-display-lg text-on-surface mb-2"><Counter target={stats.avgConfidence || 94} suffix="%" /></div>
          <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">AI Accuracy</div>
        </div>
      </div>
    </div>
  );
}
