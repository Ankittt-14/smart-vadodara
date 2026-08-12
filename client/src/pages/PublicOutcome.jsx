import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { api, RISK_COLORS } from '../api';

const RISK_HEX = { Critical: '#ba1a1a', High: '#722b00', Moderate: '#003f87', Low: '#006c4f' };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const isoStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (isNaN(diff)) return '';
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PublicOutcome() {
  const [stats, setStats] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  useEffect(() => {
    const load = () => api.get('/api/stats').then((res) => {
      setStats(res.data);
      setSelectedWard((prev) => prev || res.data.wardStats[0]);
    });
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  const ward = useMemo(() => {
    if (!stats || !selectedWard) return null;
    return stats.wardStats.find((w) => w.id === selectedWard.id) || stats.wardStats[0];
  }, [stats, selectedWard]);

  if (!stats || !ward) {
    return <div className="p-12 text-center font-body-lg text-body-lg text-on-surface-variant">Loading dashboard...</div>;
  }

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (ward.healthScore / 100) * circumference;
  const gaugeColor = ward.healthScore >= 70 ? 'text-secondary' : ward.healthScore >= 40 ? 'text-tertiary' : 'text-error';

  return (
    <div className="flex flex-col w-full gap-margin-desktop">
      <div className="flex flex-col md:flex-row gap-margin-desktop w-full items-stretch">
        <div className="flex-1 bg-surface-container rounded-xl shadow-md p-gutter flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <div className="relative z-10 flex flex-col items-center w-full">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Ward Health Score</h2>
            <select
              className="font-body-md text-body-md text-on-surface-variant mb-6 uppercase tracking-wider bg-transparent border border-outline-variant/40 rounded-full px-3 py-1"
              value={ward.id}
              onChange={(e) => setSelectedWard(stats.wardStats.find((w) => w.id === parseInt(e.target.value)))}
            >
              {stats.wardStats.map((w) => (
                <option key={w.id} value={w.id}>Ward - {w.name}</option>
              ))}
            </select>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-surface-variant" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="8" />
                <circle
                  className={gaugeColor}
                  cx="50" cy="50" fill="none" r="45"
                  stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-display-lg text-display-lg text-on-surface">{ward.healthScore}</span>
                <span className="font-label-md text-label-md text-on-surface-variant">/ 100</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 bg-secondary-container px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-on-secondary-container">insights</span>
              <span className="font-label-md text-label-md text-on-secondary-container">
                {ward.open} open · {ward.resolved} resolved · {ward.totalIssues} total
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-surface-container-low rounded-xl shadow-sm p-gutter flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-error">warning</span>
              Active Risk Alerts
            </h3>
            <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-2 py-1 rounded">
              {stats.riskAlerts.filter((a) => a.risk_level === 'Critical').length} Critical
            </span>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2">
            {stats.riskAlerts.length === 0 && (
              <p className="font-body-md text-body-md text-on-surface-variant">No active high-risk issues right now.</p>
            )}
            {stats.riskAlerts.map((a) => {
              const risk = RISK_COLORS[a.risk_level] || RISK_COLORS.Low;
              return (
                <div key={a.id} className={`bg-surface rounded-lg p-4 shadow-sm border-l-4 ${risk.border}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`font-label-sm text-label-sm ${risk.text} ${risk.bg} px-2 py-0.5 rounded`}>{a.risk_level}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{timeAgo(a.created_at)}</span>
                  </div>
                  <h4 className="font-body-md text-body-md text-on-surface font-semibold mb-1">{a.category}</h4>
                  <p className="font-label-md text-label-md text-on-surface-variant">{a.ward_name}. {a.description || 'Action required.'}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-margin-desktop w-full h-[500px]">
        <div className="flex-[2] bg-surface-container rounded-xl shadow-md overflow-hidden relative">
          <MapContainer center={[22.3072, 73.1812]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {stats.allIssuesForMap.map((issue) => (
              <CircleMarker
                key={issue.id}
                center={[issue.lat, issue.lng]}
                radius={issue.status === 'Verified' ? 6 : 9}
                pathOptions={{
                  color: issue.status === 'Verified' ? RISK_HEX.Low : (RISK_HEX[issue.risk_level] || RISK_HEX.Low),
                  fillColor: issue.status === 'Verified' ? RISK_HEX.Low : (RISK_HEX[issue.risk_level] || RISK_HEX.Low),
                  fillOpacity: 0.75,
                  weight: 2,
                }}
              >
                <Popup>
                  <strong>{issue.category}</strong><br />
                  {issue.ward_name}<br />
                  {issue.status} · {issue.risk_level} risk
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-md p-4 rounded-lg shadow-lg z-[1000]">
            <h4 className="font-label-md text-label-md text-on-surface mb-3">Map Legend</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-error" /><span className="font-label-sm text-label-sm text-on-surface-variant">Critical Issue</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-tertiary" /><span className="font-label-sm text-label-sm text-on-surface-variant">High Risk</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary" /><span className="font-label-sm text-label-sm text-on-surface-variant">Resolved</span></div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-surface-container-low rounded-xl shadow-sm p-gutter flex flex-col h-full">
          <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">update</span>
            Citizen Updates Feed
          </h3>
          <div className="relative flex-1 overflow-y-auto pr-4 space-y-4">
            {stats.recentActivity.length === 0 && (
              <p className="font-body-md text-body-md text-on-surface-variant">No activity yet — reports will appear here.</p>
            )}
            {stats.recentActivity.map((a) => {
              const isVerified = a.status === 'Verified';
              const icon = isVerified ? 'check_circle' : a.assigned_engineer_id ? 'engineering' : 'report';
              const bg = isVerified ? 'bg-secondary' : a.assigned_engineer_id ? 'bg-primary' : 'bg-error';
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-surface ${bg} shrink-0 shadow-sm`}>
                    <span className="material-symbols-outlined text-white text-[20px]">{icon}</span>
                  </div>
                  <div className="flex-1 bg-surface p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-sm text-label-sm text-primary">{a.id}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{timeAgo(a.resolved_at || a.created_at)}</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface">
                      {isVerified
                        ? `Verified by AI — resolution confirmed for ${a.category.toLowerCase()}.`
                        : a.assigned_engineer_id
                        ? `${a.category} in ${a.ward_name} assigned to engineer.`
                        : `New ${a.category.toLowerCase()} reported in ${a.ward_name}.`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
