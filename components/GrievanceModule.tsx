import * as React from 'react';
import { 
  Scale, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  BrainCircuit, 
  Sparkles, 
  Loader2, 
  X, 
  History, 
  User, 
  Activity, 
  ArrowRight,
  MessageSquare,
  Bot,
  Send,
  ThumbsUp,
  Ban,
  Quote, 
  Zap,
  Hammer,
  FileText,
  PhoneCall,
  Play,
  ImageIcon,
  Download,
  AlertCircle,
  FileSearch,
  ExternalLink,
  ChevronDown,
  Layout,
  Cpu,
  ShieldCheck,
  MoreVertical,
  Paperclip,
  Save,
  Printer,
  RefreshCw,
  ChevronLeft
} from 'lucide-react';
import { Complaint, ComplaintStatus, ComplaintCategory, Activity as ActivityType, CallRecording } from '../types';
import { analyzeComplaint, draftComplaintResolution, generateIncidentReport, ComplaintAnalysis } from '../services/geminiService';

const { useState, useMemo, useEffect } = React;

interface GrievanceModuleProps {
  activities: ActivityType[];
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  callRecordings?: CallRecording[]; 
}

const GrievanceModule: React.FC<GrievanceModuleProps> = ({ activities, complaints, setComplaints, callRecordings = [] }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'investigation' | 'ai-analysis' | 'report'>('investigation');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ComplaintAnalysis | null>(null);
  const [incidentReport, setIncidentReport] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);

  const selectedTicket = useMemo(() => 
    complaints.find(c => c.id === selectedTicketId)
  , [selectedTicketId, complaints]);

  const filteredComplaints = useMemo(() => 
    complaints.filter(c => 
      c.debtorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  , [searchQuery, complaints]);

  const relevantActivities = useMemo(() => {
    if (!selectedTicket) return [];
    return activities.filter(a => a.debtorId === selectedTicket.debtorId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedTicket, activities]);

  const relevantRecordings = useMemo(() => {
    if (!selectedTicket) return [];
    return callRecordings.filter(r => r.debtorName === selectedTicket.debtorName);
  }, [selectedTicket, callRecordings]);

  const handleAIAnalyze = async () => {
    if (!selectedTicket) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeComplaint(selectedTicket, relevantActivities);
      setAnalysisResult(result);
      if (result) {
        setComplaints(prev => prev.map(c => c.id === selectedTicket.id ? { 
          ...c, 
          severity: result.severity,
          category: result.category as ComplaintCategory 
        } : c));
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsAnalyzing(false); 
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTicket) return;
    setIsGeneratingReport(true);
    setActiveTab('report');
    try {
      const report = await generateIncidentReport(selectedTicket, relevantActivities, relevantRecordings);
      setIncidentReport(report);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsGeneratingReport(false); 
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 overflow-hidden text-left">
      
      {/* Sidebar: Queue */}
      <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0 overflow-hidden">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg"><Scale size={18} /></div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Grievance Desk</h2>
             </div>
             <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest">{complaints.length} Active</span>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Case ID or Debtor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-2xl border-none focus:ring-4 focus:ring-blue-500/10 text-xs font-black outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {filteredComplaints.map(tkt => (
              <button
                key={tkt.id}
                onClick={() => { setSelectedTicketId(tkt.id); setAnalysisResult(null); setIncidentReport(null); setActiveTab('investigation'); }}
                className={`w-full p-5 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-3 group ${
                  selectedTicketId === tkt.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-transparent hover:border-slate-100 text-slate-600'
                }`}
              >
                <div className="flex justify-between items-start">
                   <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                     tkt.status === ComplaintStatus.NEW ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                   }`}>
                      {tkt.status}
                   </div>
                   <div className={`w-2 h-2 rounded-full ${tkt.severity > 70 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                </div>
                <div>
                   <p className="text-xs font-black truncate leading-none">{tkt.debtorName}</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-tighter">{tkt.id} • {tkt.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Console Area */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {selectedTicket ? (
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            
            {/* Ticket HUD */}
            <div className="bg-[#0f172a] rounded-[3.5rem] p-8 text-white relative overflow-hidden shadow-2xl border-b-8 border-blue-600 shrink-0">
               <div className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12"><ShieldAlert size={280} /></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-left">
                  <div className="flex items-center gap-8">
                     <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl">
                        <FileSearch size={28} />
                     </div>
                     <div>
                        <div className="flex items-center gap-3">
                           <h2 className="text-3xl font-black tracking-tight">{selectedTicket.id}</h2>
                           <span className="px-3 py-1 bg-rose-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest">Severity {selectedTicket.severity}%</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.3em]">{selectedTicket.category}</p>
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <button 
                       onClick={handleGenerateReport}
                       disabled={isGeneratingReport}
                       className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-2"
                     >
                        {isGeneratingReport ? <Loader2 size={16} className="animate-spin" /> : <BrainCircuit size={16} />} 
                        Generate AI Incident Report
                     </button>
                     <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                        {(['investigation', 'ai-analysis', 'report'] as const).map((t) => (
                           <button 
                             key={t}
                             onClick={() => setActiveTab(t)}
                             className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                           >
                              {t === 'ai-analysis' ? 'Analysis' : t}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 overflow-hidden relative">
              
              {activeTab === 'investigation' && (
                <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                   {/* Timeline */}
                   <div className="lg:col-span-8 bg-white rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                      <div className="p-8 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between shrink-0">
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                            <History size={18} className="text-blue-600" /> Evidence Timeline
                         </h3>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Full Record</span>
                      </div>

                      <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-thin bg-slate-50/30 text-left">
                         <div className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm relative">
                            <Quote className="absolute top-[-15px] right-8 text-slate-100" size={48} />
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Allegation</p>
                            <p className="text-lg font-medium text-slate-700 leading-relaxed italic">"{selectedTicket.description}"</p>
                         </div>

                         <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Collection History</h4>
                            <div className="space-y-4">
                               {relevantActivities.map((act, i) => (
                                 <div key={act.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col gap-5 group animate-in fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="flex justify-between items-start">
                                       <div className="flex items-center gap-4">
                                          <div className="p-2 bg-slate-100 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                             {act.type === 'Voice Call' ? <PhoneCall size={20}/> : <MessageSquare size={20}/>}
                                          </div>
                                          <div>
                                             <p className="text-xs font-black text-slate-900 uppercase">{act.type} • <span className="text-blue-600">{act.outcome}</span></p>
                                             <p className="text-[10px] font-bold text-slate-400 mt-1">{act.agent} • {act.date}</p>
                                          </div>
                                       </div>
                                       {act.visualProof && <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded-lg border border-emerald-100 uppercase">Evidence Attached</span>}
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">"{act.notes}"</p>
                                    {act.visualProof && (
                                       <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 relative">
                                          <img src={act.visualProof} className="w-full h-full object-cover opacity-80" alt="" />
                                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white"><ExternalLink size={20}/></button>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Right: Vault */}
                   <div className="lg:col-span-4 flex flex-col gap-6">
                      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col h-1/2 overflow-hidden text-left">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Cpu size={16} className="text-blue-600" /> Interaction Vault
                         </h3>
                         <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {relevantRecordings.map(rec => (
                              <div key={rec.id} className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col gap-4 group hover:border-blue-200 transition-all">
                                 <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                          <Play size={18} fill="currentColor" />
                                       </div>
                                       <div>
                                          <p className="text-[10px] font-black text-slate-900 truncate w-32">{rec.id}</p>
                                          <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{rec.agentName} • {rec.duration}</p>
                                       </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${rec.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                       {rec.sentiment}
                                    </span>
                                 </div>
                                 <button onClick={() => setPlayingRecording(rec.id)} className="w-full py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">
                                    {playingRecording === rec.id ? 'Session Active' : 'Analyze Stream'}
                                 </button>
                              </div>
                            ))}
                         </div>
                      </div>

                      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col h-1/2 overflow-hidden text-left">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Paperclip size={16} className="text-blue-600" /> Evidence Manifest
                         </h3>
                         <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                            {relevantActivities.filter(a => a.visualProof).map((a, idx) => (
                               <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:bg-white transition-all">
                                  <div className="flex items-center gap-3">
                                     <ImageIcon size={16} className="text-slate-400" />
                                     <p className="text-[10px] font-black text-slate-900 truncate w-24">FIELD_PROOF_{idx+1}.JPG</p>
                                  </div>
                                  <button className="p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100"><Download size={14}/></button>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'ai-analysis' && (
                <div className="h-full flex flex-col lg:flex-row gap-6 animate-in zoom-in-95 duration-500">
                   <div className="flex-1 bg-[#0f172a] rounded-[4rem] p-12 text-white relative overflow-hidden flex flex-col text-left">
                      <div className="absolute top-[-40px] right-[-40px] opacity-10 rotate-12"><Zap size={400} /></div>
                      <div className="relative z-10 flex flex-col h-full">
                         <div className="flex items-center justify-between mb-12">
                            <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                               <Sparkles size={24} className="text-blue-400" /> Redressal Analysis
                            </h3>
                            <button onClick={handleAIAnalyze} disabled={isAnalyzing} className="px-8 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                               {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} Sync
                            </button>
                         </div>

                         {analysisResult ? (
                           <div className="space-y-10 animate-in fade-in duration-700">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sentiment</span>
                                    <p className="text-2xl font-black text-blue-400">{analysisResult.sentiment}</p>
                                 </div>
                                 <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compliance</span>
                                    <p className="text-2xl font-black text-rose-500">{analysisResult.severity}/100</p>
                                 </div>
                              </div>
                              <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem]">
                                 <h4 className="text-[10px] font-black text-blue-400 uppercase mb-4">Synthesis</h4>
                                 <p className="text-lg font-medium text-slate-300 leading-relaxed italic">"{analysisResult.rootCause}"</p>
                              </div>
                           </div>
                         ) : (
                           <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                              <Bot size={80} className="animate-bounce" />
                              <p className="text-xs font-black uppercase tracking-[0.4em] mt-4">Node Idle</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'report' && (
                <div className="h-full flex flex-col lg:flex-row gap-6 animate-in slide-in-from-right-4 duration-500 text-left">
                   <div className="flex-1 bg-white rounded-[4rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                      <div className="p-8 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between shrink-0">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg"><FileText size={24} /></div>
                            <div>
                               <h3 className="text-lg font-black text-slate-900 leading-tight">Incident Report</h3>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Internal governance document</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all border border-slate-200"><Printer size={18}/></button>
                            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-black transition-all">
                               <Save size={16} /> Archive to Case
                            </button>
                         </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-12 bg-slate-50/30 scrollbar-thin">
                         {isGeneratingReport ? (
                            <div className="h-full flex flex-col items-center justify-center gap-8">
                               <div className="relative w-24 h-24">
                                  <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                                  <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                     <Cpu size={32} className="text-blue-600 animate-pulse" />
                                  </div>
                               </div>
                               <p className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Synthesizing Field Evidence...</p>
                            </div>
                         ) : incidentReport ? (
                            <div className="max-w-4xl mx-auto bg-white p-12 md:p-16 rounded-[3.5rem] shadow-2xl border border-slate-100 group">
                               <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                  <Scale size={240} />
                               </div>
                               <div className="space-y-8 font-mono text-[13px] leading-relaxed text-slate-700 whitespace-pre-wrap relative z-10">
                                  {incidentReport}
                               </div>
                               <div className="mt-16 pt-10 border-t border-slate-100 flex justify-between items-center opacity-40">
                                  <p className="text-[9px] font-black uppercase">PCCS INFRASTRUCTURE NODE: IR-GENERATOR-V4</p>
                                  <ShieldCheck size={24} className="text-emerald-500" />
                               </div>
                            </div>
                         ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale">
                               <Hammer size={64} className="mb-6" />
                               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Workbench Empty</h3>
                               <p className="text-sm font-medium mt-2 max-w-xs text-center">Generate a formal report to populate this area.</p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white border-4 border-dashed border-slate-100 rounded-[4rem] text-center group">
             <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <Scale size={56} className="text-slate-200" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tactical Redressal Suite</h2>
             <p className="text-sm text-slate-400 mt-2 max-w-sm font-medium italic leading-relaxed">
                Select an active grievance from the queue to initialize the investigation cluster. All relevant collection evidence will be automatically gathered and displayed.
             </p>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default GrievanceModule;