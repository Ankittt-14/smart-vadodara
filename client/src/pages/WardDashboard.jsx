import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, IMG_BASE, RISK_COLORS, STATUS_LABELS } from '../api';
import { useAuth } from '../context/AuthContext';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const isoStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (isNaN(diff)) return '';
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function WardDashboard() {
  const navigate = useNavigate();
  const { user, isOfficer } = useAuth();
  const [issues, setIssues] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const [checklist, setChecklist] = useState([false, false, false]);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (user.role === 'ward_officer' && user.wardId) {
      setSelectedWardId(user.wardId);
    }
  }, [user.role, user.wardId]);

  const load = () => {
    const query = selectedWardId !== 'ALL' ? `?wardId=${selectedWardId}` : '';
    api.get(`/api/issues${query}`).then((res) => {
      setIssues(res.data);
      setSelectedId((prev) => (res.data.some((i) => i.id === prev) ? prev : res.data[0]?.id));
    }).catch(() => {});
  };

  useEffect(() => {
    api.get('/api/wards').then((res) => setWards(res.data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [selectedWardId]);

  const selected = issues.find((i) => i.id === selectedId);

  const handleProofFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProofFile(f);
    setProofPreview(URL.createObjectURL(f));
  };

  const markResolved = async () => {
    if (!selected) return;
    setResolving(true);
    setResultMsg(null);
    try {
      const formData = new FormData();
      if (proofFile) formData.append('proof', proofFile);
      const res = await api.patch(`/api/issues/${selected.id}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResultMsg(res.data.aiValidated
        ? 'AI validated the fix — issue marked Verified.'
        : 'Proof uploaded — flagged for manual AI review.');
      setChecklist([false, false, false]);
      setProofFile(null);
      setProofPreview(null);
      load();
    } catch (err) {
      setResultMsg('Failed to submit fix. Please try again.');
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full min-h-[calc(100vh-80px)] -m-margin-desktop">
      <div className="flex flex-col lg:flex-row flex-1 h-full">
        <aside className="w-full lg:w-1/3 border-r border-outline-variant/30 flex flex-col bg-surface overflow-hidden">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center gap-2">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Assigned Issues</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Sorted by Risk Level</p>
            </div>
            <select
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              className="font-label-sm text-label-sm bg-surface border border-outline-variant/40 rounded-lg px-2 py-1 text-on-surface"
            >
              <option value="ALL">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>Ward {w.id} - {w.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {issues.length === 0 && (
              <p className="font-body-md text-body-md text-on-surface-variant p-4 text-center">No issues reported yet.</p>
            )}
            {issues.map((issue) => {
              const risk = RISK_COLORS[issue.risk_level] || RISK_COLORS.Low;
              const active = issue.id === selectedId;
              return (
                <div
                  key={issue.id}
                  onClick={() => { setSelectedId(issue.id); setChecklist([false, false, false]); setResultMsg(null); setProofFile(null); setProofPreview(null); }}
                  className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-colors shadow-sm ${
                    active ? 'bg-primary-container/20 ring-1 ring-primary/30' : 'hover:bg-surface-container-low'
                  }`}
                >
                  <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-surface-container flex items-center justify-center">
                    {issue.image_path ? (
                      <img className="w-full h-full object-cover" src={`${IMG_BASE}${issue.image_path}`} alt="" />
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant">image</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-label-sm text-label-sm uppercase tracking-wider ${risk.text}`}>{issue.risk_level} Risk</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{timeAgo(issue.created_at)}</span>
                    </div>
                    <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface truncate">{issue.category}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant truncate">{issue.ward_name} · {STATUS_LABELS[issue.status] || issue.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-background overflow-y-auto">
          {!selected ? (
            <div className="p-12 text-center font-body-lg text-body-lg text-on-surface-variant">Select an issue to view details.</div>
          ) : (
            <div className="p-margin-desktop lg:p-12 max-w-4xl mx-auto w-full space-y-8">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-label-md text-label-md">
                      <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
                      {STATUS_LABELS[selected.status] || selected.status}
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">ID: {selected.id}</span>
                  </div>
                  <h1 className="font-display-lg text-display-lg text-on-surface">{selected.category}</h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant mt-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {selected.ward_name}, Vadodara
                  </p>
                </div>
                {(() => {
                  const risk = RISK_COLORS[selected.risk_level] || RISK_COLORS.Low;
                  return (
                    <div className={`${risk.bg} border ${risk.border} p-4 rounded-xl flex items-center gap-4 shadow-sm w-full md:w-auto`}>
                      <div className={`w-12 h-12 rounded-full ${risk.bg} flex items-center justify-center`}>
                        <span className={`material-symbols-outlined ${risk.text} text-2xl`}>warning</span>
                      </div>
                      <div>
                        <div className={`font-headline-md text-headline-md ${risk.text}`}>{selected.risk_level} Risk</div>
                        <div className={`font-label-sm text-label-sm ${risk.text}/80 uppercase tracking-wide`}>Score {selected.risk_score}/100</div>
                      </div>
                    </div>
                  );
                })()}
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-md relative bg-surface-container h-80">
                  {selected.image_path ? (
                    <img className="w-full h-full object-cover" src={`${IMG_BASE}${selected.image_path}`} alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-6xl">image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <span className="font-label-sm text-label-sm text-white bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
                      Source: {selected.reporter_type === 'vmc_staff' ? 'VMC Staff Field Survey' : 'Citizen App upload'}
                    </span>
                  </div>
                </div>
                <div className="bg-surface-container-low rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Report Details</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">{selected.description || 'No description provided.'}</p>
                    <div className="font-label-sm text-label-sm text-on-surface-variant">AI Confidence: {Math.round(selected.confidence * 100)}%</div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-outline-variant/30">
                    <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Assigned Engineer</div>
                    <div className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-xs">
                        {(selected.engineer_name || 'Engineer').replace(/^Er\.\s*/, '')[0] || 'E'}
                      </span>
                      {selected.engineer_name || 'Unassigned'}
                    </div>
                  </div>
                </div>
              </div>

              {selected.status === 'Verified' ? (
                <div className="bg-secondary-container text-on-secondary-container rounded-2xl p-8 shadow-sm flex items-center gap-4">
                  <span className="material-symbols-outlined text-3xl">task_alt</span>
                  <div>
                    <h3 className="font-headline-md text-headline-md m-0">Resolved & Verified</h3>
                    <p className="font-body-md text-body-md">
                      This issue was fixed and validated by AI on{' '}
                      {selected.resolved_at
                        ? new Date(selected.resolved_at.replace(' ', 'T') + 'Z').toLocaleString()
                        : ''}
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <section className="bg-surface-container rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-headline-md text-headline-md text-on-surface m-0">Fix & Verify Ward Issue</h2>
                      <p className="font-body-md text-body-md text-on-surface-variant m-0">
                        Upload resolution proof photo and complete inspection checklist to verify & mark resolved.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary font-label-md text-label-md rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Ward Verification Portal
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div
                      className="border-2 border-dashed border-primary/30 rounded-xl bg-[#f0f7ff] p-8 flex flex-col items-center justify-center text-center transition-colors hover:bg-[#e6f3ff] cursor-pointer group relative overflow-hidden"
                      onClick={() => fileRef.current?.click()}
                    >
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleProofFile} />
                      {proofPreview ? (
                        <img src={proofPreview} alt="proof" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                          </div>
                          <h3 className="font-body-lg text-body-lg text-primary mb-2">Upload Proof of Fix</h3>
                          <p className="font-body-md text-body-md text-on-surface-variant mb-4">Take a clear photo of the cleared site to satisfy AI verification.</p>
                          <button type="button" className="px-4 py-2 bg-white border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface shadow-sm">Browse Files</button>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="font-label-md text-label-md text-on-surface">Verification Checklist</div>
                        {['Site completely cleared of debris', 'Repair meets VMC quality standard', 'No immediate road obstruction remains'].map((label, idx) => (
                          <label key={label} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                              checked={checklist[idx]}
                              onChange={() => setChecklist((c) => c.map((v, i) => (i === idx ? !v : v)))}
                            />
                            <span className="font-body-md text-body-md text-on-surface">{label}</span>
                          </label>
                        ))}
                      </div>
                      {resultMsg && (
                        <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl font-body-md text-body-md flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">check_circle</span>
                          <span>{resultMsg}</span>
                        </div>
                      )}
                      <button
                        disabled={resolving || !checklist.every(Boolean)}
                        onClick={() => {
                          markResolved();
                        }}
                        className={`mt-6 w-full py-4 font-semibold text-lg rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          checklist.every(Boolean)
                            ? 'bg-[#004085] hover:bg-[#003366] text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        } disabled:opacity-60`}
                      >
                        <span className="material-symbols-outlined text-2xl">verified</span>
                        <span>{resolving ? 'AI Validating Fix...' : 'Verify & Mark Issue Resolved'}</span>
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
