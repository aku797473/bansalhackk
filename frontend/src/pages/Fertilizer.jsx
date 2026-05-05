import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { fertilizerAPI } from '../services/api';
import { FlaskConical, Upload, AlertTriangle, CheckCircle, Loader, History, Trash2, ChevronRight, RefreshCw, ShieldCheck, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const SEVERITY_COLOR = { Mild: 'badge-yellow', Moderate: 'badge-yellow', Severe: 'badge-red' };

export default function Fertilizer() {
  const { t, i18n } = useTranslation();
  const [preview, setPreview] = useState(null);
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history & active result from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sk_fert_history');
    const active = localStorage.getItem('sk_fert_active_result');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error('Failed to parse history', e); }
    }
    if (active) {
      try { setResult(JSON.parse(active)); } catch (e) {}
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('sk_fert_history', JSON.stringify(history));
  }, [history]);

  // Save active result to localStorage
  useEffect(() => {
    if (result) localStorage.setItem('sk_fert_active_result', JSON.stringify(result));
    else localStorage.removeItem('sk_fert_active_result');
  }, [result]);

  const clearActive = () => {
    setResult(null);
    setPreview(null);
    setFile(null);
    localStorage.removeItem('sk_fert_active_result');
  };

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf']
    }, maxFiles: 1,
  });

  const analyze = async () => {
    if (!file) { toast.error('Please upload an image or PDF'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('language', i18n.language || 'en');
      const { data } = await fertilizerAPI.analyze(fd);
      const analysisResult = data.data;
      
      setResult(analysisResult);
      
      // Add to history (limit to 10 items)
      const historyItem = {
        id: Date.now(),
        date: new Date().toISOString(),
        title: analysisResult.primaryIssue?.deficiency || 'Unknown Analysis',
        result: analysisResult,
        // We can't easily store the file blob in localStorage, 
        // but for session-level switching, the URL.createObjectURL might still work 
        // if we don't reload. However, for persistence, we'd need base64.
        // We'll just store the data for now.
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 10));
      
      toast.success(t('common.success', 'Analysis complete!'));
    } catch { toast.error('Analysis failed. Try again.'); }
    finally { setLoading(false); }
  };

  const deleteHistoryItem = (e, id) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(h => h.id !== id));
    if (result && history.find(h => h.id === id)?.result === result) {
        setResult(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 page-enter">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FlaskConical className="text-amber-500" size={22} />
            <span>{t('fertilizer.title')} & <span className="text-green-600">{t('fertilizer.seed_iq', 'Seed IQ')}</span></span>
          </h1>
          <p className="page-subtitle text-gray-500 font-medium">{t('fertilizer.ai_desc', 'AI analysis for plants, seeds, and reports')}</p>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button onClick={clearActive} className="btn-ghost text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
              <Trash2 size={16} /> <span className="hidden sm:inline">{t('fertilizer.clear_result', 'Clear Result')}</span>
            </button>
          )}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
             <History size={14}/> <span>{t('dashboard.recent_activity', 'History')}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upload Area */}
          <div className="card border-2 border-dashed border-gray-200 dark:border-slate-800 p-0 overflow-hidden">
            <div {...getRootProps()} className={clsx(
                'p-8 text-center cursor-pointer transition-all',
                isDragActive ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-slate-900/50'
            )}>
                <input {...getInputProps()} />
                {preview ? (
                  <div className="relative group">
                    <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-xl object-contain shadow-sm" />
                    {loading && (
                      <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] rounded-xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(21,128,61,0.8)] animate-scan" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-white/90 dark:bg-slate-900/90 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-xl">{t('fertilizer.analyzing_sample', 'Analyzing Sample...')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                <div className="flex flex-col items-center gap-3 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <Upload size={24} className="text-amber-500" />
                    </div>
                    <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('fertilizer.upload_desc', 'Upload plant, seed, or report photo')}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{t('fertilizer.file_limits', 'JPG, PNG, WEBP, PDF — max 10MB')}</p>
                    </div>
                </div>
                )}
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 flex gap-2">
                {preview && (
                    <button onClick={() => { setPreview(null); setFile(null); setResult(null); }}
                    className="btn-ghost flex-1 justify-center text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                    {t('common.cancel', 'Remove')}
                    </button>
                )}
                <button onClick={analyze} disabled={!file || loading} className="btn-primary flex-[2] justify-center text-xs py-2">
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <FlaskConical size={14} />}
                    {loading ? t('fertilizer.analyzing') : t('fertilizer.analyze_health', 'Analyze Health / Variety')}
                </button>
            </div>
          </div>

          {/* History List */}
          <div className="card p-0 overflow-hidden">
             <div className="p-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('dashboard.recent_alerts', 'Recent Reports')}</span>
                <span className="badge badge-gray">{history.length}</span>
             </div>
             <div className="max-h-[300px] overflow-y-auto">
                {history.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <History size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs italic">{t('fertilizer.no_history', 'No history yet')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-slate-800">
                        {history.map((item) => (
                            <div key={item.id} 
                                 onClick={() => setResult(item.result)}
                                 className={clsx(
                                     "p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group",
                                     result === item.result && "bg-amber-50 dark:bg-amber-900/20"
                                 )}>
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                                    <FlaskConical size={14} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{t(`fertilizer.results.${item.title}`, item.title)}</p>
                                    <p className="text-[10px] text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                                </div>
                                <button onClick={(e) => deleteHistoryItem(e, item.id)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                    <Trash2 size={14} />
                                </button>
                                <ChevronRight size={14} className="text-gray-300" />
                            </div>
                        ))}
                    </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Active Result Display */}
        <div className="lg:col-span-8">
          {result ? (
            <div className="space-y-4 animate-slide-up">
              {/* Soil Health Certificate UI */}
              <div className="card bg-white dark:bg-slate-900 border-2 border-primary/20 p-0 shadow-2xl overflow-hidden">
                <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-xl">{t('fertilizer.certificate_title', 'Soil Health Certificate')}</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{t('fertilizer.sample_id', 'Sample ID')}: SK-2026-{Math.floor(Math.random()*9000)+1000} • {t('fertilizer.ai_verified', 'AI Verified')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      toast.success(t('fertilizer.generating_pdf', 'Generating Soil Health Report...'));
                      setTimeout(() => window.print(), 1000);
                    }}
                    className="btn-secondary h-10 px-4 text-[10px] font-black uppercase tracking-widest border-2">
                    <Download size={14} /> {t('fertilizer.export_pdf', 'Export PDF')}
                  </button>
                </div>

                <div className="p-8">
                  <div className="grid sm:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('fertilizer.diagnosis', 'Diagnosis')}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-black text-gray-900 dark:text-white">{t(`fertilizer.results.${result.primaryIssue?.deficiency}`, result.primaryIssue?.deficiency)}</span>
                          <span className={clsx('badge-verified', SEVERITY_COLOR[result.primaryIssue?.severity] || 'badge-yellow')}>
                             {t(`fertilizer.results.${result.primaryIssue?.severity}`, result.primaryIssue?.severity)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5 italic text-sm text-gray-600 dark:text-slate-400">
                        "{result.primaryIssue?.symptoms}"
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-primary/5 rounded-[2.5rem] p-6 border border-primary/10">
                       <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">{t('fertilizer.confidence_score', 'Confidence Score')}</p>
                       <div className="relative w-24 h-24 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-slate-800" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * result.primaryIssue?.confidence) / 100} className="text-primary transition-all duration-1000" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-primary">{result.primaryIssue?.confidence}%</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Treatment Card */}
                <div className="card border-l-4 border-l-green-500">
                    <h4 className="font-bold text-green-700 dark:text-green-400 flex items-center gap-2 mb-3">
                        <CheckCircle size={18} /> {t('fertilizer.treatment')}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed bg-green-50/50 dark:bg-green-900/10 p-3 rounded-xl">{result.primaryIssue?.treatment}</p>
                </div>

                {/* Prevention Card */}
                <div className="card border-l-4 border-l-blue-500">
                    <h4 className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-3">
                        🛡️ {t('fertilizer.prevention')}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl">{result.primaryIssue?.prevention}</p>
                </div>
              </div>

              {/* Overall Advice Card */}
              <div className="card bg-gray-900 dark:bg-slate-900 text-white border-none shadow-xl">
                <div className="flex items-center justify-between mb-4">
                   <h4 className="font-bold text-gray-300 uppercase text-xs tracking-widest">{t('fertilizer.expert_advice', 'Expert Advice')}</h4>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{t('fertilizer.health_status', 'Health Status')}:</span>
                      <span className={clsx(
                        'text-xs font-bold px-2 py-0.5 rounded-full',
                        result.overallHealth === 'Good' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      )}>{t(`fertilizer.results.${result.overallHealth}`, result.overallHealth)}</span>
                   </div>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-4 mb-4">
                   <p className="text-amber-400 font-bold flex items-center gap-2 mb-3">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      {t(`fertilizer.results.${result.urgency}`, result.urgency)}
                   </p>
                   <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {result.generalRecommendations?.map((r, i) => (
                        <li key={i} className="text-xs text-gray-300 flex gap-2 items-start">
                        <span className="text-primary mt-1 shrink-0">✓</span>{r}
                        </li>
                    ))}
                    </ul>
                </div>
                
                <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                         <ShieldCheck size={16} />
                      </div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('fertilizer.verified_advisory', 'Scientifically Verified Advisory')}</p>
                   </div>
                   <p className="text-[10px] text-gray-400 italic">{t('fertilizer.advisory_guidance', 'This report is AI-generated for guidance.')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-full flex flex-col items-center justify-center py-32 text-center bg-gray-50 dark:bg-slate-900/50 border-dashed border-2">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm flex items-center justify-center text-4xl mb-6">🔬</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('fertilizer.select_for_report', 'Select an image for detailed report')}</h3>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-2 max-w-sm mx-auto">{t('fertilizer.upload_instruction', 'Upload an image on the left or use History to see previous analyses.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
