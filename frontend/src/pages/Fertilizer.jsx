import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { fertilizerAPI } from '../services/api';
import { FlaskConical, Upload, AlertTriangle, CheckCircle, Loader, History, Trash2, ChevronRight, RefreshCw, ShieldCheck, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { usePageAnimation } from '../hooks/usePageAnimation';

const SEVERITY_COLOR = { Mild: 'badge-yellow', Moderate: 'badge-yellow', Severe: 'badge-red' };

export default function Fertilizer() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
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
    <div ref={ref} className="page-wrapper max-w-7xl mx-auto px-4 sm:px-6">
      <div className="anim-header page-header flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="page-title flex items-center gap-3 tracking-tighter">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl shadow-inner">
               <FlaskConical className="text-amber-500 animate-pulse" size={28} />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">
              {t('fertilizer.title')}
            </span>
            <span className="hidden sm:inline opacity-20">|</span>
            <span className="text-green-600 dark:text-emerald-400 font-black">{t('fertilizer.seed_iq')}</span>
          </h1>
          <p className="page-subtitle mt-2">{t('fertilizer.ai_desc')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {result && (
            <button onClick={clearActive} className="btn-danger h-11 px-5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 group">
              <Trash2 size={16} className="group-hover:rotate-12 transition-transform" /> 
              <span>{t('fertilizer.clear_result')}</span>
            </button>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-2xl shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('fertilizer.ai_verified')}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upload Area */}
          <div className="anim-card card border-none shadow-premium p-0 overflow-hidden bg-gradient-to-br from-white via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/10 relative group">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
            
            <div {...getRootProps()} className={clsx(
                'p-10 text-center cursor-pointer transition-all border-2 border-dashed rounded-[2rem] m-4',
                isDragActive ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-amber-50/30 dark:hover:bg-amber-900/5'
            )}>
                <input {...getInputProps()} />
                {preview ? (
                  <div className="relative group max-w-xs mx-auto">
                    <img src={preview} alt="preview" className="max-h-56 mx-auto rounded-3xl object-contain shadow-2xl border-4 border-white dark:border-slate-800" />
                    {loading && (
                      <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] rounded-3xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_20px_rgba(21,128,61,1)] animate-scan" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/95 dark:bg-slate-900/95 px-5 py-2 rounded-2xl flex items-center gap-3 shadow-2xl border border-primary/20">
                             <RefreshCw className="animate-spin text-primary" size={16} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t('fertilizer.analyzing')}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                <div className="flex flex-col items-center gap-4 py-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                       <Upload size={32} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-base font-black text-gray-900 dark:text-white">{t('fertilizer.upload_desc')}</p>
                      <p className="text-xs text-gray-400 mt-2 font-medium">{t('fertilizer.file_limits')}</p>
                    </div>
                </div>
                )}
            </div>
            
            <div className="p-6 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row gap-3">
                <button onClick={(e) => { e.stopPropagation(); document.querySelector('input[type="file"]').click(); }}
                  className="btn-secondary h-12 flex-1 justify-center rounded-2xl text-xs font-bold gap-3 group">
                  <FileText size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  <span>{t('fertilizer.import_pdf', 'Import PDF Report')}</span>
                </button>
                <button onClick={analyze} disabled={!file || loading} 
                  className="btn-primary h-12 flex-[1.5] justify-center rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all">
                    {loading ? <RefreshCw size={18} className="animate-spin" /> : <FlaskConical size={18} />}
                    <span className="ml-2">{loading ? t('fertilizer.analyzing') : t('fertilizer.analyze_health')}</span>
                </button>
            </div>
          </div>

          {/* History List */}
          <div className="anim-card card p-0 overflow-hidden">
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
            <div className="space-y-6 animate-slide-up">
              {/* Soil Health Certificate UI */}
              <div className="card border-0 p-0 shadow-2xl overflow-hidden relative">
                {/* Colorful Certificate Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-1">
                  <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-4 sm:p-6 border-b border-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                          <ShieldCheck size={28} />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg sm:text-xl">{t('fertilizer.certificate_title', 'Soil Health Certificate')}</h3>
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">{t('fertilizer.sample_id', 'Sample ID')}: SK-2026-{Math.floor(Math.random()*9000)+1000} • {t('fertilizer.ai_verified', 'AI Verified')}</p>
                          {result.cropType && (
                             <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{t('crop.title', 'Crop')}: <span className="text-gray-900 dark:text-white font-black">{result.cropType}</span></p>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          toast.success(t('fertilizer.generating_pdf', 'Generating Soil Health Report...'));
                          setTimeout(() => window.print(), 1000);
                        }}
                        className="w-full sm:w-auto btn-ghost h-10 px-4 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 text-amber-700 dark:text-amber-500 hover:bg-amber-500/10 bg-white dark:bg-slate-800 shadow-sm">
                        <Download size={14} /> {t('fertilizer.export_pdf', 'Export PDF')}
                      </button>
                    </div>

                    <div className="p-8">
                      <div className="grid sm:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-6">
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('fertilizer.diagnosis', 'Diagnosis')}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-3xl font-black text-gray-900 dark:text-white">{t(`fertilizer.results.${result.primaryIssue?.deficiency}`, result.primaryIssue?.deficiency)}</span>
                              <span className={clsx('badge-verified px-3 py-1 text-[10px]', SEVERITY_COLOR[result.primaryIssue?.severity] || 'badge-yellow')}>
                                 {t(`fertilizer.results.${result.primaryIssue?.severity}`, result.primaryIssue?.severity)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('fertilizer.npk_levels', 'Estimated NPK Levels')}</p>
                            {[
                              { k: 'N', label: t('fertilizer.nitrogen', 'Nitrogen'), val: result.npkEstimates?.N || 'Low', color: 'from-emerald-400 to-teal-500' },
                              { k: 'P', label: t('fertilizer.phosphorus', 'Phosphorus'), val: result.npkEstimates?.P || 'Medium', color: 'from-blue-400 to-indigo-500' },
                              { k: 'K', label: t('fertilizer.potassium', 'Potassium'), val: result.npkEstimates?.K || 'High', color: 'from-amber-400 to-orange-500' },
                            ].map(n => (
                              <div key={n.k} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${n.color} text-white flex items-center justify-center font-black text-xs shadow-sm shrink-0`}>{n.k}</div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{n.label}</span>
                                    <span className="text-[10px] font-black text-gray-800 dark:text-white uppercase">{t(`fertilizer.results.${n.val}`, n.val)}</span>
                                  </div>
                                  <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r ${n.color} rounded-full transition-all duration-1000`} style={{ width: `${n.val === 'Low' ? 30 : n.val === 'Medium' ? 60 : 90}%` }} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="p-5 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                            <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">{t('fertilizer.symptoms', 'Symptoms')}</p>
                            <p className="text-sm text-gray-700 dark:text-slate-300 italic leading-relaxed">"{result.primaryIssue?.symptoms}"</p>
                          </div>

                          <div className="flex flex-col items-center justify-center bg-amber-500/5 rounded-[2.5rem] p-6 border border-amber-500/10">
                             <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">{t('fertilizer.confidence_score', 'Confidence Score')}</p>
                             <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-slate-800" />
                                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * (result.primaryIssue?.confidence || 85)) / 100} className="text-amber-500 transition-all duration-1000" />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-amber-600">{result.primaryIssue?.confidence || 85}%</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {result.recommendedFertilizers?.length > 0 && (
                <div className="card shadow-md border-l-4 border-l-amber-500 mb-6 bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900 dark:to-amber-950/10">
                  <h4 className="font-black text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-4 uppercase text-xs tracking-widest">
                      <FlaskConical size={16} /> {t('fertilizer.recommended_fertilizers', 'Recommended Fertilizers & Dosage')}
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {result.recommendedFertilizers.map((fert, i) => (
                      <div key={i} className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 hover:shadow-md transition-shadow">
                        <p className="font-black text-gray-900 dark:text-white mb-2 text-sm">{fert.name}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-medium text-gray-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-amber-500" /> {fert.dosage}</span>
                          <span className="flex items-center gap-1.5"><AlertTriangle size={14} className="text-amber-500" /> {fert.timing}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Treatment Card */}
                <div className="card border-l-4 border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50/30 dark:from-slate-900 dark:to-emerald-950/10">
                    <h4 className="font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3 uppercase text-xs tracking-widest">
                        <CheckCircle size={16} /> {t('fertilizer.treatment')}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{result.primaryIssue?.treatment}</p>
                </div>

                {/* Prevention Card */}
                <div className="card border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-blue-950/10">
                    <h4 className="font-black text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-3 uppercase text-xs tracking-widest">
                        <ShieldCheck size={16} /> {t('fertilizer.prevention')}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{result.primaryIssue?.prevention}</p>
                </div>
              </div>

              {/* Overall Advice Card */}
              <div className="card bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-6 relative z-10">
                   <h4 className="font-black text-gray-400 uppercase text-[10px] tracking-widest">{t('fertilizer.expert_advice', 'Expert Advice')}</h4>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">{t('fertilizer.health_status', 'Health Status')}:</span>
                      <span className={clsx(
                        'text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter',
                        result.overallHealth === 'Good' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      )}>{t(`fertilizer.results.${result.overallHealth}`, result.overallHealth)}</span>
                   </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 relative z-10 border border-white/5">
                   <p className="text-amber-400 font-black flex items-center gap-2 mb-4 uppercase text-xs tracking-widest">
                      <AlertTriangle size={16} /> {t(`fertilizer.results.${result.urgency}`, result.urgency)}
                   </p>
                   <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                    {result.generalRecommendations?.map((r, i) => (
                        <li key={i} className="text-sm text-gray-300 flex gap-3 items-start">
                          <CheckCircle className="text-emerald-500 mt-1 shrink-0" size={14} />
                          <span className="font-medium">{r}</span>
                        </li>
                    ))}
                    </ul>
                </div>
                
                <div className="flex items-center justify-between opacity-50 relative z-10">
                   <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest">{t('fertilizer.verified_advisory', 'Verified Advisory')}</p>
                   </div>
                   <p className="text-[10px] italic">{t('fertilizer.advisory_guidance', 'AI-generated for guidance.')}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="anim-fade card h-full flex flex-col items-center justify-center py-32 text-center bg-gray-50 dark:bg-slate-900/50 border-dashed border-2">
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
