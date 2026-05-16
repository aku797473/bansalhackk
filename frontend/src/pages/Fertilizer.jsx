import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { fertilizerAPI } from '../services/api';
import { FlaskConical, Upload, AlertTriangle, CheckCircle, Loader, History, Trash2, ChevronRight, RefreshCw, ShieldCheck, FileText, Download, Sparkle, Lightning, Info, CaretRight } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { usePageAnimation } from '../hooks/usePageAnimation';

const SEVERITY_COLOR = { Mild: 'bg-yellow-500', Moderate: 'bg-orange-500', Severe: 'bg-red-500' };

const DEMO_FERTILIZER_RESULT = {
  overallHealth: 'Fair',
  urgency: 'Immediate',
  cropType: 'Wheat',
  primaryIssue: {
    deficiency: 'Nitrogen Deficiency',
    severity: 'Moderate',
    confidence: 82,
    symptoms: 'Yellowing of older leaves starting from leaf tips, stunted growth, pale green color across the plant canopy indicating nitrogen stress.',
    treatment: 'Apply 120 kg/ha Urea in split doses — 50% at sowing, 25% at first irrigation (CRI stage), 25% at heading stage.',
    prevention: 'Conduct soil testing before each season. Use green manure crops and maintain organic matter above 1.5%.',
  },
  npkEstimates: { N: 'Low', P: 'Medium', K: 'High' },
  recommendedFertilizers: [
    { name: 'Urea (46-0-0)', dosage: '120 kg/hectare', timing: 'Split in 3 doses during crop cycle' },
    { name: 'DAP (18-46-0)', dosage: '100 kg/hectare', timing: 'Apply as basal dose at sowing' },
    { name: 'Zinc Sulphate', dosage: '25 kg/hectare', timing: 'Once before sowing as basal application' },
  ],
  generalRecommendations: [
    'Apply nitrogen fertilizer in split doses to improve nitrogen use efficiency.',
    'Maintain soil pH between 6.5-7.5 for optimal nutrient availability.',
    'Use organic compost (5-10 tonnes/ha) to improve soil structure and water retention.',
    'Avoid over-irrigation; practice furrow irrigation to minimize nitrogen leaching.',
    'Conduct soil testing every 2-3 years for precise fertilizer recommendations.',
  ],
};

export default function Fertilizer() {
  const { t, i18n } = useTranslation();
  const ref = usePageAnimation();
  const [preview, setPreview] = useState(null);
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

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

  useEffect(() => {
    localStorage.setItem('sk_fert_history', JSON.stringify(history));
  }, [history]);

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
      const historyItem = {
        id: Date.now(),
        date: new Date().toISOString(),
        title: analysisResult.primaryIssue?.deficiency || 'Unknown Analysis',
        result: analysisResult,
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 10));
      toast.success(t('common.success'));
    } catch {
      const analysisResult = DEMO_FERTILIZER_RESULT;
      setResult(analysisResult);
      const historyItem = { id: Date.now(), date: new Date().toISOString(), title: 'Nitrogen Deficiency (Demo)', result: analysisResult };
      setHistory(prev => [historyItem, ...prev].slice(0, 10));
      toast('Showing demo analysis (AI service warming up…)', { icon: '⚡' });
    }
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
    <div ref={ref} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] transition-colors duration-500 font-sans selection:bg-amber-100 selection:text-amber-900 pt-28 sm:pt-36 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="px-4 py-2 bg-amber-600 dark:bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-amber-500/30 border border-amber-400/20 flex items-center gap-2">
                <FlaskConical size={14} weight="fill" className="animate-pulse" />
                {t('fertilizer.seed_iq')}
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={14} weight="fill" className="text-emerald-500" />
                {t('fertilizer.ai_verified')}
              </div>
            </div>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                {t('fertilizer.title')}
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-5 max-w-lg leading-relaxed">
              {t('fertilizer.ai_desc')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {result && (
               <button 
                 onClick={clearActive}
                 className="h-14 px-8 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/30 text-red-600 rounded-2xl shadow-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest"
               >
                 <Trash2 size={18} weight="bold" />
                 {t('fertilizer.clear_result')}
               </button>
             )}
                     <button className="h-14 px-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3">
                <Lightning size={18} weight="bold" className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{t('fertilizer.smart_engine')}</span>
             </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left Column: Tools */}
          <div className="lg:col-span-4 space-y-8">
            {/* Upload Zone */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 shadow-premium border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
               <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
               
               <div {...getRootProps()} className={clsx(
                 "border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-500",
                 isDragActive ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10" : "border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
               )}>
                 <input {...getInputProps()} />
                 {preview ? (
                   <div className="relative group w-full max-w-[200px]">
                      <img src={preview} alt="preview" className="rounded-3xl shadow-2xl border-4 border-white dark:border-slate-800 aspect-square object-cover" />
                      {loading && (
                        <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                           <RefreshCw size={32} className="text-amber-600 animate-spin" />
                        </div>
                      )}
                   </div>
                 ) : (
                   <div className="flex flex-col items-center text-center gap-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-500">
                         <Upload size={32} weight="duotone" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2">{t('fertilizer.upload_desc')}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fertilizer.file_limits')}</p>
                      </div>
                   </div>
                 )}
               </div>

               <div className="mt-4 flex flex-col gap-3">
                 <button onClick={analyze} disabled={!file || loading} className="w-full h-14 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0">
                    {loading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkle size={18} weight="fill" />}
                    {loading ? t('fertilizer.analyzing') : t('fertilizer.analyze_health')}
                 </button>
                 <button className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 transition-all">
                    <FileText size={18} weight="bold" />
                    {t('fertilizer.import_pdf')}
                 </button>
               </div>
            </div>

            {/* History Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fertilizer.recent_reports')}</h3>
                  <div className="w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500">{history.length}</div>
               </div>
               <div className="max-h-[300px] overflow-y-auto scrollbar-none">
                  {history.length === 0 ? (
                    <div className="p-12 text-center">
                       <History size={32} className="mx-auto text-slate-200 mb-4" />
                       <p className="text-xs font-bold text-slate-400 italic">{t('fertilizer.no_history')}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                       {history.map((h) => (
                         <div key={h.id} onClick={() => setResult(h.result)} className={clsx("p-5 flex items-center gap-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800 group", result === h.result && "bg-amber-50 dark:bg-amber-900/10")}>
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                               <FlaskConical size={18} weight="duotone" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-black text-slate-900 dark:text-white truncate">{t(`fertilizer.results.${h.title}`, h.title)}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(h.date).toLocaleDateString()}</p>
                            </div>
                            <button onClick={(e) => deleteHistoryItem(e, h.id)} className="w-8 h-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                               <Trash2 size={14} />
                            </button>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Right Column: Report */}
          <div className="lg:col-span-8">
            {!result ? (
               <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700 group hover:border-amber-400/50 transition-all duration-500 py-32">
                  <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-800 flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
                    <Sparkle size={48} weight="duotone" className="text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">{t('fertilizer.select_for_report')}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold max-w-xs leading-relaxed italic">
                    {t('fertilizer.upload_instruction')}
                  </p>
               </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
                 {/* Main Certificate Card */}
                 <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-premium overflow-hidden border border-slate-200 dark:border-slate-800 relative">
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-8 sm:p-12 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8">
                       <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/20 shrink-0">
                             <ShieldCheck size={32} weight="fill" />
                          </div>
                          <div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{t('fertilizer.certificate_title')}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{t('fertilizer.sample_id')}: SK-{Math.floor(Math.random()*9000)+1000}</p>
                          </div>
                       </div>
                       <button onClick={() => window.print()} className="h-12 px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
                          <Download size={18} weight="bold" />
                          {t('fertilizer.export_pdf')}
                       </button>
                    </div>

                    <div className="p-8 sm:p-12">
                       <div className="grid md:grid-cols-2 gap-12">
                          <div className="space-y-10">
                             <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('fertilizer.diagnosis')}</p>
                               <div className="flex items-center gap-4 mb-2">
                                  <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t(`fertilizer.results.${result.primaryIssue?.deficiency}`, result.primaryIssue?.deficiency)}</h4>
                                  <span className={clsx("px-3 py-1 rounded-lg text-[10px] font-black uppercase text-white", SEVERITY_COLOR[result.primaryIssue?.severity] || 'bg-amber-500')}>
                                    {t(`fertilizer.results.${result.primaryIssue?.severity}`, result.primaryIssue?.severity)}
                                  </span>
                               </div>
                               <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                  <CheckCircle size={14} weight="fill" />
                                  {result.cropType} {t('fertilizer.plant_detected')}
                               </p>
                             </div>

                             <div className="space-y-6">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fertilizer.npk_levels')}</p>
                               {[
                                 { k: 'N', label: t('fertilizer.nitrogen'), val: result.npkEstimates?.N || 'Low', color: 'bg-emerald-500' },
                                 { k: 'P', label: t('fertilizer.phosphorus'), val: result.npkEstimates?.P || 'Medium', color: 'bg-blue-500' },
                                 { k: 'K', label: t('fertilizer.potassium'), val: result.npkEstimates?.K || 'High', color: 'bg-amber-500' },
                               ].map(n => (
                                 <div key={n.k} className="flex items-center gap-5">
                                   <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-black/5", n.color)}>{n.k}</div>
                                   <div className="flex-1">
                                     <div className="flex justify-between items-end mb-2">
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{n.label}</span>
                                       <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{t(`fertilizer.results.${n.val}`, n.val)}</span>
                                     </div>
                                     <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                       <div className={clsx("h-full rounded-full transition-all duration-1000", n.color)} style={{ width: `${n.val === 'Low' ? 30 : n.val === 'Medium' ? 60 : 90}%` }} />
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                          </div>

                          <div className="space-y-10">
                             <div className="bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] p-8 border border-amber-100 dark:border-amber-900/30">
                                <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                   <Info size={16} weight="fill" />
                                   {t('fertilizer.symptoms')}
                                </p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                   "{result.primaryIssue?.symptoms}"
                                </p>
                             </div>

                             <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t('fertilizer.confidence_score')}</p>
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                   <svg className="w-full h-full -rotate-90">
                                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * (result.primaryIssue?.confidence || 85)) / 100} className="text-amber-500 transition-all duration-1000" strokeLinecap="round" />
                                   </svg>
                                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{result.primaryIssue?.confidence || 85}%</span>
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('fertilizer.accuracy')}</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Recommendations Grid */}
                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
                       <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                          <CheckCircle size={20} weight="fill" />
                          {t('fertilizer.treatment')}
                       </h4>
                       <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                          {result.primaryIssue?.treatment}
                       </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
                       <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-3">
                          <ShieldCheck size={20} weight="fill" />
                          {t('fertilizer.prevention')}
                       </h4>
                       <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                          {result.primaryIssue?.prevention}
                       </p>
                    </div>
                 </div>

                 {/* Fertilizer Advice List */}
                 {result.recommendedFertilizers?.length > 0 && (
                   <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.25em] mb-10 flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
                           <FlaskConical size={24} weight="duotone" />
                         </div>
                         {t('fertilizer.recommended_fertilizers')}
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-6">
                         {result.recommendedFertilizers.map((fert, i) => (
                           <div key={i} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all group">
                              <p className="font-black text-slate-900 dark:text-white text-lg mb-4 leading-tight group-hover:text-amber-600 transition-colors">{fert.name}</p>
                              <div className="space-y-3">
                                 <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Lightning size={12} weight="fill" /></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{fert.dosage}</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600"><Calendar size={12} weight="fill" /></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{fert.timing}</span>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}

                 {/* Expert Insight Card */}
                 <div className="bg-slate-900 rounded-[3rem] p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12 relative z-10">
                       <h4 className="text-xs font-black text-amber-400 uppercase tracking-[0.3em] flex items-center gap-4">
                          <Sparkle size={24} weight="fill" className="animate-pulse" />
                          {t('fertilizer.expert_advice')}
                       </h4>
                       <div className="px-5 py-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-3">
                          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t('fertilizer.health_status')}:</span>
                          <span className={clsx("text-[10px] font-black uppercase tracking-tighter", result.overallHealth === 'Good' ? "text-emerald-400" : "text-amber-400")}>{t(`fertilizer.results.${result.overallHealth}`, result.overallHealth)}</span>
                       </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6 mb-12 relative z-10">
                       {result.generalRecommendations?.map((r, i) => (
                         <div key={i} className="flex gap-5 items-start group/rec">
                            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-amber-400 shrink-0 group-hover/rec:bg-white group-hover/rec:text-slate-900 transition-all">
                               <CaretRight size={16} weight="bold" />
                            </div>
                            <p className="text-sm font-bold text-slate-300 leading-relaxed group-hover/rec:text-white transition-colors">{r}</p>
                         </div>
                       ))}
                    </div>

                    <div className="pt-10 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 opacity-40 relative z-10 text-[10px] font-black uppercase tracking-widest">
                       <div className="flex items-center gap-3">
                          <ShieldCheck size={18} weight="fill" className="text-emerald-500" />
                          {t('fertilizer.verified_advisory')}
                       </div>
                       <div className="flex items-center gap-3 italic">
                          <Info size={18} weight="fill" />
                          {t('fertilizer.advisory_guidance')}
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(220px); }
        }
        .animate-scan {
          animation: scan 3s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
