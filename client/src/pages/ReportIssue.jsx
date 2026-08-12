import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const PROCESSING_STEPS = [
  'Analyzing visual evidence...',
  'Detecting issue category...',
  'Geo-tagging location...',
  'Assigning to Ward Officer...',
];

export default function ReportIssue() {
  const navigate = useNavigate();
  const { isOfficer } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [reporterType, setReporterType] = useState(() => (isOfficer ? 'vmc_staff' : 'citizen'));
  const [submitting, setSubmitting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const captureLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      // Fallback: random point within Vadodara for demo environments without geolocation
      const lat = (22.3072 + (Math.random() * 0.1 - 0.05)).toFixed(4);
      const lng = (73.1812 + (Math.random() * 0.1 - 0.05)).toFixed(4);
      setCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        const lat = (22.3072 + (Math.random() * 0.1 - 0.05)).toFixed(4);
        const lng = (73.1812 + (Math.random() * 0.1 - 0.05)).toFixed(4);
        setCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
        setLocating(false);
      },
      { timeout: 5000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!coords) {
      setError('Please capture a location before submitting.');
      return;
    }
    setSubmitting(true);
    setStepIndex(0);

    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, PROCESSING_STEPS.length - 1));
    }, 700);

    try {
      const formData = new FormData();
      if (file) formData.append('image', file);
      formData.append('description', description);
      formData.append('lat', coords.lat);
      formData.append('lng', coords.lng);
      formData.append('reporterType', reporterType);

      const [res] = await Promise.all([
        api.post('/api/issues', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
        new Promise((resolve) => setTimeout(resolve, 2800)), // keep the AI animation visible long enough to read
      ]);

      clearInterval(stepTimer);
      navigate(`/processing/${res.data.issue.id}`, { state: res.data });
    } catch (err) {
      clearInterval(stepTimer);
      setSubmitting(false);
      setError(err.response?.data?.error || 'Something went wrong submitting your report.');
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      <div className="max-w-4xl w-full mx-auto pb-margin-desktop relative z-10">
        <div className="mb-12 relative flex justify-between items-end">
          <div>
            <p className="font-label-md text-label-md text-primary tracking-widest uppercase mb-2">Civic Engagement</p>
            <h1 className="font-display-lg text-display-lg text-on-surface">Report a Civic Issue</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mt-4">
              Provide details about the civic issue. Our AI system will automatically classify the problem, assign it to the correct ward, and prioritize resolution.
            </p>
          </div>
          <div className="hidden lg:flex relative w-32 h-32 rounded-full bg-surface-container items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
          </div>
        </div>

        <form className="space-y-8 relative" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-8 flex flex-col gap-8">
              <section className="bg-surface-container rounded-xl p-8 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shadow-sm">1</div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Visual Evidence</h2>
                </div>

                {!preview ? (
                  <div
                    className="relative w-full h-64 bg-[#f0f7ff] rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" type="file" onChange={handleFile} />
                    <div className="text-primary mb-4 transition-transform group-hover:-translate-y-2 duration-300">
                      <span className="material-symbols-outlined text-5xl">add_photo_alternate</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Drag & drop media here</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">or click to browse from device</p>
                    <div className="mt-4 flex gap-2">
                      <span className="px-3 py-1 bg-surface rounded-full font-label-sm text-label-sm text-on-surface-variant shadow-sm border border-outline-variant/20">JPEG</span>
                      <span className="px-3 py-1 bg-surface rounded-full font-label-sm text-label-sm text-on-surface-variant shadow-sm border border-outline-variant/20">PNG</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-sm group">
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setFile(null); setPreview(null); }}
                      className="absolute top-3 right-3 bg-on-surface/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                )}
              </section>

              <section className="bg-surface-container rounded-xl p-8 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shadow-sm">2</div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Additional Details</h2>
                </div>
                <div className="relative">
                  <textarea
                    className="w-full bg-surface border-none rounded-lg p-4 font-body-lg text-body-lg text-on-surface placeholder-on-surface-variant/50 focus:ring-2 focus:ring-primary shadow-sm resize-none"
                    placeholder="Describe the issue... (e.g., Deep pothole on Main St, causing traffic delays)"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div className="absolute bottom-4 right-4 text-on-surface-variant font-label-sm text-label-sm hidden sm:flex items-center">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">auto_awesome</span>
                    AI will analyze description
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <span className="font-label-md text-label-md text-on-surface-variant">Reporting as:</span>
                  <div className="flex gap-2">
                    {['citizen', 'vmc_staff'].map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setReporterType(t)}
                        className={`px-4 py-2 rounded-full font-label-md text-label-md transition-colors ${
                          reporterType === t ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant'
                        }`}
                      >
                        {t === 'citizen' ? 'Citizen' : 'VMC Staff'}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="md:col-span-4 flex flex-col gap-8">
              <section className="bg-surface-container rounded-xl p-8 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md shadow-sm">3</div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Location</h2>
                </div>
                <div
                  className="relative w-full h-48 rounded-lg overflow-hidden shadow-sm mb-6 group cursor-pointer bg-gradient-to-br from-primary/80 to-secondary/80"
                  onClick={captureLocation}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex flex-col justify-end p-4">
                    <p className="font-label-md text-label-md text-on-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">my_location</span>
                      <span>
                        {locating ? 'Acquiring GPS...' : coords ? `${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E` : 'Awaiting Location...'}
                      </span>
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-sm">
                    <button type="button" className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-full shadow-md flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">gps_fixed</span>
                      Capture Live Location
                    </button>
                  </div>
                </div>
                <div className="bg-primary-container/30 rounded-lg p-4 mt-auto">
                  <p className="font-body-md text-body-md text-on-surface flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-1 shrink-0">info</span>
                    <span>AI will automatically detect the specific category and assign it to the correct ward based on location and visual data after submission.</span>
                  </p>
                </div>
              </section>
            </div>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body-md text-body-md">{error}</div>
          )}

          <div className="flex justify-end pt-8">
            <button
              className="group relative px-8 py-4 bg-primary text-on-primary font-headline-md text-headline-md rounded-xl shadow-lg overflow-hidden flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              type="submit"
              disabled={submitting}
            >
              <span className="relative z-10 flex items-center gap-2">
                Process with AI
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </span>
            </button>
          </div>
        </form>
      </div>

      {submitting && (
        <div className="fixed inset-0 z-50 bg-surface/90 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="relative w-64 h-64 mb-8">
            <svg className="absolute inset-0 w-full h-full animate-[spin_4s_linear_infinite]" viewBox="0 0 100 100">
              <circle className="text-outline-variant/30" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="1" />
              <circle className="text-primary" cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeDasharray="70 200" strokeLinecap="round" strokeWidth="3" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-primary animate-pulse">memory</span>
            </div>
            <div className="absolute inset-0 border-[1px] border-primary/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-4">AI Processing</h2>
          <div className="h-8 text-center">
            <span className="font-headline-md text-headline-md text-primary">{PROCESSING_STEPS[stepIndex]}</span>
          </div>
        </div>
      )}
    </div>
  );
}
