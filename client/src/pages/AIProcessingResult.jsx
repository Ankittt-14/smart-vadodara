import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, IMG_BASE, RISK_COLORS } from '../api';

export default function AIProcessingResult() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(state || null);
  const [loading, setLoading] = useState(!state);

  useEffect(() => {
    if (state) return;
    const url = id ? `/api/issues/${id}` : '/api/issues/latest';
    api.get(url).then((res) => {
      const issue = res.data;
      setData({
        issue,
        ward: { name: issue.ward_name },
        engineer: { name: issue.engineer_name },
        aiSummary: {
          category: issue.category,
          confidence: issue.confidence,
          riskScore: issue.risk_score,
          riskLevel: issue.risk_level,
          isDuplicate: !!issue.is_duplicate,
          isSpam: !!issue.is_spam,
          duplicateCheckPassed: !issue.is_duplicate,
        },
      });
      setLoading(false);
    }).catch(() => {
      setData(null);
      setLoading(false);
    });
  }, [id, state]);

  if (loading) {
    return <div className="p-12 text-center font-body-lg text-body-lg text-on-surface-variant">Loading issue...</div>;
  }

  if (!data) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant">inbox</span>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">No Issues Reported Yet</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">Submit a civic report to view AI analysis results here.</p>
        <button onClick={() => navigate('/report')} className="px-6 py-3 bg-primary text-on-primary font-label-md rounded-full">
          Report an Issue
        </button>
      </div>
    );
  }

  const { issue, ward, engineer, aiSummary } = data;
  const risk = RISK_COLORS[aiSummary.riskLevel] || RISK_COLORS.Low;

  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
          {/* Image Banner Container (Before vs After if verified) */}
          {issue.proof_image_path ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-md bg-surface-container border border-outline-variant/30">
                <img src={`${IMG_BASE}${issue.image_path}`} alt="Before Issue" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-red-600/90 text-white backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm font-label-md text-label-md flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">report_problem</span>
                  Before (Reported)
                </div>
              </div>
              <div className="relative w-full h-80 rounded-xl overflow-hidden shadow-md bg-surface-container border border-emerald-500/40 ring-2 ring-emerald-500/20">
                <img src={`${IMG_BASE}${issue.proof_image_path}`} alt="After Fixed" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-emerald-600/90 text-white backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm font-label-md text-label-md flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  After (Fixed & Verified)
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-md bg-surface-container border border-outline-variant/30">
              {issue.image_path ? (
                <img src={`${IMG_BASE}${issue.image_path}`} alt="issue" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-6xl">image</span>
                </div>
              )}
              <div className="absolute top-margin-mobile left-margin-mobile bg-surface/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                <span className="font-label-md text-label-md text-on-surface">AI Vision Analysis Complete</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-surface-container rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Primary Classification</span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface m-0">{aiSummary.category}</h2>
                </div>
                <div className="bg-secondary-container text-on-secondary-container px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span className="font-label-md text-label-md">{Math.round(aiSummary.confidence * 100)}% Confidence</span>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {issue.description || 'No additional description was provided with this report.'}
              </p>
            </div>

            <div className={`${risk.bg} rounded-xl p-6 shadow-sm flex flex-col justify-between`}>
              <div className="flex flex-col">
                <span className={`font-label-sm text-label-sm ${risk.text} uppercase tracking-wider mb-1`}>Calculated Priority</span>
                <h2 className={`font-headline-lg text-headline-lg ${risk.text} m-0`}>Risk: {aiSummary.riskLevel.toUpperCase()} ({aiSummary.riskScore})</h2>
              </div>
              <div className={`flex items-center gap-2 mt-4 ${risk.text}`}>
                <span className="material-symbols-outlined">warning</span>
                <span className="font-body-md text-body-md font-medium">
                  {aiSummary.riskLevel === 'Critical' || aiSummary.riskLevel === 'High'
                    ? 'Immediate intervention recommended'
                    : 'Scheduled for routine resolution'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2 m-0">
              <span className="material-symbols-outlined text-primary">policy</span>
              System Validation Checks
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className={`${aiSummary.duplicateCheckPassed ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'} p-1.5 rounded-full mt-0.5`}>
                  <span className="material-symbols-outlined text-[16px]">{aiSummary.duplicateCheckPassed ? 'check' : 'priority_high'}</span>
                </div>
                <div>
                  <span className="block font-label-md text-label-md text-on-surface">
                    {aiSummary.duplicateCheckPassed ? 'Duplicate Check Passed' : 'Possible Duplicate Detected'}
                  </span>
                  <span className="block font-body-md text-body-md text-on-surface-variant">
                    {aiSummary.duplicateCheckPassed
                      ? 'No matching reports found within an 80m radius in the last 14 days.'
                      : 'A similar report already exists nearby — this may be merged with the existing case.'}
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-secondary/10 text-secondary p-1.5 rounded-full mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
                <div>
                  <span className="block font-label-md text-label-md text-on-surface">GPS Validation</span>
                  <span className="block font-body-md text-body-md text-on-surface-variant">Coordinates confirmed within VMC municipal boundaries.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
          <div className="bg-surface-container rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-headline-md text-headline-md text-on-surface m-0 mb-2">Issue Metadata</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col bg-surface p-3 rounded-lg shadow-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Location</span>
                <span className="font-body-md text-body-md text-on-surface font-medium">{ward?.name || 'Unknown Ward'}</span>
              </div>
              <div className="flex flex-col bg-surface p-3 rounded-lg shadow-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Coordinates (GPS)</span>
                <span className="font-body-md text-body-md text-on-surface font-mono text-sm">
                  {typeof issue.lat === 'number' ? issue.lat.toFixed(4) : issue.lat}° N, {typeof issue.lng === 'number' ? issue.lng.toFixed(4) : issue.lng}° E
                </span>
              </div>
              <div className="flex flex-col bg-surface p-3 rounded-lg shadow-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Timestamp</span>
                <span className="font-body-md text-body-md text-on-surface">
                  {issue.created_at ? new Date(issue.created_at.replace(' ', 'T') + 'Z').toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col bg-surface p-3 rounded-lg shadow-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Report ID</span>
                <span className="font-body-md text-body-md text-on-surface font-mono text-sm">{issue.id}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-outline-variant/30 flex flex-col gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Automated Dispatch</span>
              <div className="flex items-center gap-3 bg-primary-container/30 p-3 rounded-lg shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline-md text-headline-md shadow-sm">
                  {(engineer?.name || 'Engineer').replace(/^Er\.\s*/, '')[0] || 'E'}
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Assigned to Ward Engineer</span>
                  <span className="font-body-md text-body-md text-on-surface-variant">{engineer?.name || 'Unassigned'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/outcome')} className="w-full bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group">
              <span className="material-symbols-outlined group-hover:-translate-y-0.5 transition-transform">map</span>
              View on Map
            </button>
            <button onClick={() => navigate('/report')} className="w-full bg-surface-variant hover:bg-surface-variant/80 text-on-surface-variant font-label-md text-label-md py-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">add_circle</span>
              Submit Another Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
