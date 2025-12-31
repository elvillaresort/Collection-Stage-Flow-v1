
import * as React from 'react';
import {
  ShieldCheck,
  Play,
  Pause,
  FastForward,
  Rewind,
  Mic2,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Sparkles,
  Loader2,
  Search,
  Filter,
  Activity,
  Clock,
  BrainCircuit,
  Ear,
  Maximize2,
  X,
  Volume2,
  Terminal,
  History,
  Info,
  ChevronRight,
  ChevronDown,
  Lock,
  Smartphone,
  Quote,
  Target,
  BarChart3,
  Languages,
  MessageSquareText,
  MessageSquare,
  Bug
} from 'lucide-react';
import { CallRecording, QAAudit, User } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

const { useState, useEffect, useMemo, useRef } = React;

interface QABotHubProps {
  currentUser: User;
  recordings: CallRecording[];
  onUpdateRecording: (recording: CallRecording) => void;
}

const QABotHub: React.FC<QABotHubProps> = ({ currentUser, recordings, onUpdateRecording }) => {
  const [activeSection, setActiveSection] = useState<'agent' | 'bot'>('agent');

  // Agent Audit State
  const [selectedRecId, setSelectedRecId] = useState<string | null>(recordings.length > 0 ? recordings[0].id : null);
  const [activeAudit, setActiveAudit] = useState<QAAudit | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'findings' | 'transcript' | 'coaching'>('findings');

  // Bot Audit State (Mock)
  const [selectedBotLogId, setSelectedBotLogId] = useState<string | null>('BOT-101');
  const BOT_LOGS = useMemo(() => [
    { id: 'BOT-101', timestamp: '10:42 AM', scenario: 'PTP Negotiation', result: 'Success', latency: 420, confidence: 0.98, issues: [], debtorName: 'John Doe' },
    { id: 'BOT-102', timestamp: '10:45 AM', scenario: 'Identity Validation', result: 'Failure', latency: 1200, confidence: 0.65, issues: ['Hallucination', 'High Latency'], debtorName: 'Jane Smith' },
    { id: 'BOT-103', timestamp: '10:48 AM', scenario: 'Payment Plan', result: 'Success', latency: 350, confidence: 0.99, issues: [], debtorName: 'Robert Johnson' },
    { id: 'BOT-104', timestamp: '10:52 AM', scenario: 'Hardship Query', result: 'Warning', latency: 800, confidence: 0.82, issues: ['Circular Logic'], debtorName: 'Emily Davis' },
    { id: 'BOT-105', timestamp: '10:55 AM', scenario: 'PTP Negotiation', result: 'Success', latency: 410, confidence: 0.97, issues: [], debtorName: 'Michael Brown' },
  ], []);

  const SYSTEM_HEALTH = [
    { name: 'LLM Inference Engine', status: 'Healthy', metric: '45ms avg', icon: BrainCircuit, color: 'text-emerald-500' },
    { name: 'Voice Gateway (SIP)', status: 'Warning', metric: '2.4% Pkt Loss', icon: Activity, color: 'text-amber-500' },
    { name: 'Vector Database', status: 'Healthy', metric: '99.9% Uptime', icon: Terminal, color: 'text-emerald-500' },
    { name: 'Speech-to-Text', status: 'Healthy', metric: '95% Accuracy', icon: Ear, color: 'text-emerald-500' },
  ];

  const selectedRec = useMemo(() => recordings.find(r => r.id === selectedRecId), [selectedRecId, recordings]);

  // If recordings list changes and we don't have a selection, pick the latest
  useEffect(() => {
    if (!selectedRecId && recordings.length > 0) {
      setSelectedRecId(recordings[0].id);
    }
  }, [recordings, selectedRecId]);

  const runQABotAudit = async (type: 'agent' | 'bot' = 'agent') => {
    const target = type === 'agent' ? selectedRec : (BOT_LOGS.find(b => b.id === selectedBotLogId) as any);
    if (!target) return;

    setIsAuditing(true);
    setActiveAudit(null);

    const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || '' });

    // Using the same format as before but with the improved prompt
    const prompt = `
      Perform a professional Quality Assurance (QA) audit on a debt recovery call.
      ${type === 'agent' ? `Human Agent: ${target.agentName}` : `VoiceBot ID: ${target.id}`}
      Subject/Debtor: ${target.debtorName || 'N/A'}
      Context: ${type === 'agent' ? 'Human-led negotiation' : `AI-led scenario: ${target.scenario}`}
      
      Generate a comprehensive audit in JSON format:
      {
        "summary": "Deep behavioral summary of the interaction",
        "auditScore": number (0-100),
        "language": "Detected language (e.g., Taglish, English)",
        "sentimentTrend": "Analysis of how sentiment shifted during the call",
        "transcript": [{"speaker": "string", "text": "string", "timestamp": "string"}],
        "compliance": {
          "disclosureMet": boolean,
          "empathyMaintained": boolean,
          "ptpNegotiated": boolean,
          "hostilityHandled": boolean,
          "legalRisk": "LOW" | "MEDIUM" | "HIGH"
        },
        "coaching": [
          {"area": "Specific skill", "recommendation": "Detailed advice", "priority": "CRITICAL" | "HIGH" | "LOW"}
        ],
        "takeaways": ["key takeaway strings"]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt
      });

      const text = response.text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(text);

      setActiveAudit({
        recordingId: target.id,
        summary: result.summary,
        detectedLanguage: result.language,
        transcript: result.transcript,
        complianceChecks: result.compliance,
        keyTakeaways: result.takeaways,
        // We'll store coaching and sentimentTrend in state or extend interface
        coaching: result.coaching,
        sentimentTrend: result.sentimentTrend
      } as any);

      if (type === 'agent') {
        onUpdateRecording({
          ...target,
          status: 'Audited',
          auditScore: result.auditScore,
          sentiment: result.auditScore > 80 ? 'Positive' : (result.auditScore > 60 ? 'Neutral' : 'Critical')
        });
      }
    } catch (err) {
      console.error('QABot Audit Error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleExportAudits = () => {
    const headers = 'Recording ID,Agent,Debtor,Timestamp,Duration,Audit Status,Score,Sentiment\n';
    const rows = recordings.map(r => [r.id, r.agentName, r.debtorName, r.timestamp, r.duration, r.status, r.auditScore || 'N/A', r.sentiment || 'N/A'].join(',')).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pccs_qa_audit_' + Date.now() + '.csv');
    link.click();
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-slate-50 flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden text-left relative">

      {/* Top Navigation Switcher */}
      <div className="flex items-center gap-4 px-1 shrink-0">
        <button
          onClick={() => setActiveSection('agent')}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${activeSection === 'agent' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
        >
          <Headphones size={20} />
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-widest leading-none opacity-70">Human Force</p>
            <p className="text-sm font-black leading-none mt-1">Agent Audit</p>
          </div>
        </button>
        <button
          onClick={() => setActiveSection('bot')}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${activeSection === 'bot' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
        >
          <BrainCircuit size={20} />
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-widest leading-none opacity-70">System \u0026 AI</p>
            <p className="text-sm font-black leading-none mt-1">Voice Bot Audit</p>
          </div>
        </button>
      </div>

      {activeSection === 'agent' ? (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
          <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 overflow-hidden text-left">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Call Vault</h2>
                <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg"><Mic2 size={18} /></div>
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Filter recordings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                {recordings.filter(r => r.debtorName.toLowerCase().includes(searchQuery.toLowerCase())).map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => { setSelectedRecId(rec.id); setActiveAudit(null); }}
                    className={'w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-3 ' + (selectedRecId === rec.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-transparent hover:border-slate-100 text-slate-600')}
                    title={`Select recording ${rec.id}`}
                  >
                    <div className={'w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 ' + (selectedRecId === rec.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400')}>
                      {rec.auditScore ? rec.auditScore + '%' : '??'}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-xs font-black truncate leading-none">{rec.debtorName}</p>
                      <p className={'text-[9px] font-bold uppercase tracking-widest mt-1.5 ' + (selectedRecId === rec.id ? 'text-slate-400' : 'text-slate-400')}>{rec.id}</p>
                    </div>
                    {rec.status === 'Audited' && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </button>
                ))}
                {recordings.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-20 grayscale">
                    <Mic2 size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Vault Empty<br />No recordings found</p>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100">
                <button onClick={handleExportAudits} disabled={recordings.length === 0} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 disabled:opacity-50" title="Export Audit Data">
                  <FileSpreadsheet size={16} /> Export Audit
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-6 overflow-hidden text-left">
            {selectedRec ? (
              <>
                <div className="bg-[#0f172a] rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden text-left shrink-0">
                  <div className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12"><Activity size={240} className="text-blue-500" /></div>
                  <div className="flex justify-between items-start relative z-10 mb-8 text-left">
                    <div className="text-left">
                      <h2 className="text-3xl font-black tracking-tighter">{selectedRec.id}</h2>
                      <p className="text-[10px] font-black text-blue-400 uppercase mt-1">High Fidelity Audit Node</p>
                    </div>
                    <div className="flex items-center gap-4 text-left">
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-500 uppercase leading-none">Agent</p>
                        <p className="text-xs font-black text-white mt-1">{selectedRec.agentName}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Headphones size={20} className="text-blue-400" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-10 flex flex-col md:flex-row items-center gap-8 relative z-10 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-6"><button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/40 active:scale-90" title={isPlaying ? "Pause Recording" : "Play Recording"}>{isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}</button></div>
                    <div className="flex-1 w-full space-y-2">
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-blue-500 transition-all duration-300 w-[45%] ${isPlaying ? 'animate-pulse' : ''}`}></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-slate-500 font-mono"><span>01:52</span><span>{selectedRec.duration}</span></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 overflow-hidden">
                  <div className="xl:col-span-7 flex flex-col gap-6 overflow-hidden text-left">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
                      <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
                        <div className="flex items-center gap-2">
                          {[
                            { id: 'findings', label: 'Findings', icon: Activity },
                            { id: 'transcript', label: 'Transcript', icon: MessageSquareText },
                            { id: 'coaching', label: 'Coaching', icon: Target }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveAnalysisTab(tab.id as any)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeAnalysisTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                              title={`Show ${tab.label}`}
                            >
                              <tab.icon size={14} />
                              <span>{tab.label}</span>
                            </button>
                          ))}
                        </div>
                        <button onClick={() => runQABotAudit('agent')} disabled={isAuditing} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2" title="Run QABot Intelligence Audit">
                          {isAuditing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                          {isAuditing ? 'Analyzing Resonance...' : 'Deploy QABot'}
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin text-left">
                        {activeAudit ? (
                          <>
                            {activeAnalysisTab === 'findings' && (
                              <div className="space-y-8 animate-in slide-in-from-top-4 text-left">
                                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                  <Languages size={20} className="text-blue-600" />
                                  <div>
                                    <p className="text-[10px] font-black text-blue-400 uppercase leading-none">Language</p>
                                    <p className="text-sm font-black text-blue-900 mt-1">{activeAudit.detectedLanguage}</p>
                                  </div>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative text-left">
                                  <Quote className="absolute top-[-10px] right-6 text-slate-200" size={40} />
                                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Auditor Summary</p>
                                  <p className="text-sm font-semibold text-slate-700 leading-relaxed italic">"{activeAudit.summary}"</p>
                                </div>

                                {(activeAudit as any).sentimentTrend && (
                                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-left">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sentiment Arc</p>
                                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{(activeAudit as any).sentimentTrend}</p>
                                  </div>
                                )}

                                <div className="space-y-4 text-left">
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Key Interaction Points</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeAudit.keyTakeaways.map((take, i) => (
                                      <div key={i} className="flex gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-left group hover:border-blue-200 transition-colors">
                                        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[10px] shrink-0">{i + 1}</div>
                                        <p className="text-xs font-bold text-slate-600 leading-relaxed">{take}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {activeAnalysisTab === 'transcript' && (
                              <div className="space-y-4 text-left">
                                {activeAudit.transcript.map((line, idx) => (
                                  <div key={idx} className={'flex gap-4 p-4 rounded-2xl transition-all hover:scale-[1.01] ' + (line.speaker.toLowerCase().includes('agent') || line.speaker.toLowerCase().includes('bot') ? 'bg-blue-50/30' : 'bg-slate-50/50')}>
                                    <div className={'w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 shadow-sm ' + (line.speaker.toLowerCase().includes('agent') || line.speaker.toLowerCase().includes('bot') ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-100')}>
                                      {line.speaker.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                      <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{line.text}"</p>
                                      <p className="text-[8px] font-black text-slate-400 uppercase mt-2">{line.speaker} • {line.timestamp}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {activeAnalysisTab === 'coaching' && (
                              <div className="space-y-4 animate-in fade-in duration-300">
                                {((activeAudit as any).coaching || []).length > 0 ? (
                                  (activeAudit as any).coaching.map((item: any, i: number) => (
                                    <div key={i} className={`p-6 rounded-[2rem] border-2 text-left relative overflow-hidden ${item.priority === 'CRITICAL' ? 'bg-rose-50 border-rose-100' : (item.priority === 'HIGH' ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100')}`}>
                                      <div className="flex items-center justify-between mb-4">
                                        <h5 className="text-sm font-black text-slate-900">{item.area}</h5>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.priority === 'CRITICAL' ? 'bg-rose-500 text-white' : (item.priority === 'HIGH' ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white')}`}>{item.priority}</span>
                                      </div>
                                      <p className="text-xs font-bold text-slate-600 leading-relaxed">{item.recommendation}</p>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-20 text-center opacity-30">
                                    <Target className="mx-auto mb-4" size={48} />
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Coaching data not available</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                            <BrainCircuit size={64} className="mb-6" />
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Analysis Pipeline Idle</h4>
                            <p className="text-xs font-medium text-slate-400 mt-2 italic">Initiate AI Audit to generate transcript and insights.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="xl:col-span-5 flex flex-col gap-6 overflow-y-auto scrollbar-thin text-left">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 flex flex-col text-left">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500" /> Compliance Checklist</h3>
                      <div className="space-y-4 flex-1 text-left">
                        {[
                          { label: 'Legal Disclosure', key: 'disclosureMet' },
                          { label: 'Professionalism', key: 'empathyMaintained' },
                          { label: 'Negotiation Logic', key: 'ptpNegotiated' },
                          { label: 'Hostility Handling', key: 'hostilityHandled' }
                        ].map((item, idx) => {
                          const met = activeAudit?.complianceChecks[item.key as keyof typeof activeAudit.complianceChecks];
                          return (
                            <div key={idx} className={'p-5 rounded-[1.8rem] border-2 transition-all flex items-center justify-between ' + (!activeAudit ? 'border-slate-50 bg-slate-50/30' : (met ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'))}>
                              <div className="flex items-center gap-4 text-left">
                                <div className={'p-2 rounded-xl ' + (!activeAudit ? 'bg-slate-200' : (met ? 'bg-emerald-500 text-white shadow-lg' : 'bg-rose-500 text-white shadow-lg'))}>
                                  {activeAudit ? (met ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />) : <Clock size={16} className="text-slate-400" />}
                                </div>
                                <span className="text-xs font-black text-slate-900">{item.label}</span>
                              </div>
                              {activeAudit && <span className={'text-[10px] font-black uppercase tracking-widest ' + (met ? 'text-emerald-600' : 'text-rose-600')}>{met ? 'Verified' : 'Failure'}</span>}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-10 pt-10 border-t border-slate-100 text-left">
                        <div className="bg-slate-900 p-6 rounded-[2rem] text-white relative overflow-hidden group">
                          <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:scale-110 transition-transform"><Target size={80} /></div>
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Internal Policy</p>
                          <p className="text-[11px] font-bold leading-relaxed text-slate-400 italic">
                            "Failed disclosure requires immediate agent coaching session. Flagging for TL review."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white border border-slate-200 rounded-[3rem] border-dashed text-center">
                <div className="w-32 h-32 bg-slate-50 rounded-[3.5rem] flex items-center justify-center mb-8 rotate-12 transition-transform duration-700 hover:rotate-0 shadow-inner">
                  <Smartphone size={48} className="text-slate-200" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">Audit Station Idle</h2>
                <p className="text-sm font-medium text-slate-400 mt-4 max-w-xs leading-relaxed">Select a recording from the Vault to initialize the high-fidelity QA audit sequence.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // ======================== VOICE BOT & SYSTEM AUDIT ========================
        <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden animate-in slide-in-from-right-4">
          {/* Left Panel: Bot Interaction Logs */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-hidden">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Bot Interactions</h2>
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg"><BrainCircuit size={18} /></div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {BOT_LOGS.map(log => (
                  <button
                    key={log.id}
                    onClick={() => { setSelectedBotLogId(log.id); setActiveAudit(null); }}
                    className={`w-full p-4 rounded-2xl border transition-all text-left group ${selectedBotLogId === log.id ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-200'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${log.result === 'Success' ? 'bg-emerald-500/20 text-emerald-500' : (log.result === 'Failure' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500')}`}>
                        {log.result}
                      </span>
                      <span className="text-[10px] font-mono opacity-50">{log.timestamp}</span>
                    </div>
                    <p className="text-sm font-bold truncate">{log.scenario}</p>
                    <div className="flex justify-between items-end mt-3">
                      <p className="text-[10px] opacity-60 font-mono">ID: {log.id}</p>
                      <div className="flex items-center gap-1 text-[10px] font-black opacity-80">
                        <Activity size={10} /> {log.latency}ms
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Bot Deep Dive & System Health */}
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {/* System Health Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
              {SYSTEM_HEALTH.map((sys, i) => (
                <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                  <sys.icon size={64} className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform" />
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${sys.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{sys.status}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 leading-tight mb-1">{sys.name}</p>
                    <p className={`text-lg font-black ${sys.color}`}>{sys.metric}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Bot Audit Detail */}
            <div className="flex-1 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative text-left">
              {selectedBotLogId ? (
                <div className="w-full h-full flex flex-col">
                  <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-100">
                    <div className="text-left">
                      <h3 className="text-2xl font-black text-slate-900">Bot Intelligence Audit: <span className="text-indigo-600">{selectedBotLogId}</span></h3>
                      <p className="text-sm text-slate-500 mt-1">Scenario Protocol: {BOT_LOGS.find(b => b.id === selectedBotLogId)?.scenario}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {activeAudit?.recordingId === selectedBotLogId ? (
                        <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-3">
                          <CheckCircle2 size={20} />
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-70">Audit Status</p>
                            <p className="text-xs font-black">AI Audited</p>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => runQABotAudit('bot')} disabled={isAuditing} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/30 hover:bg-slate-900 transition-all active:scale-95 flex items-center gap-2" title="Run QABot Deep Audit">
                          {isAuditing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                          {isAuditing ? 'Auditing Neural Map...' : 'Deep Bot Audit'}
                        </button>
                      )}
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400">QA Score</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">{(BOT_LOGS.find(b => b.id === selectedBotLogId)?.confidence! * 100).toFixed(0)}<span className="text-base text-slate-400">%</span></p>
                      </div>
                    </div>
                    <div className="bg-indigo-900 rounded-[2rem] p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-32 bg-indigo-600 rounded-full blur-[80px] opacity-30"></div>
                      <h4 className="text-xs font-black uppercase text-indigo-300 mb-4 relative z-10">Neural Engine Diagnostics</h4>
                      <div className="space-y-4 relative z-10">
                        <div>
                          <p className="text-[10px] opacity-60 uppercase">Intent Classification</p>
                          <div className="w-full bg-white/10 h-2 rounded-full mt-1"><div className="bg-emerald-400 h-full rounded-full w-[94%]"></div></div>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-60 uppercase">Context Retention</p>
                          <div className="w-full bg-white/10 h-2 rounded-full mt-1"><div className="bg-blue-400 h-full rounded-full w-[88%]"></div></div>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-60 uppercase">Sentiment Alignment</p>
                          <div className="w-full bg-white/10 h-2 rounded-full mt-1"><div className="bg-indigo-400 h-full rounded-full w-[91%]"></div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Select a log to view audit</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default QABotHub;
