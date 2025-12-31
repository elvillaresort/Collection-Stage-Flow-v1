import * as React from 'react';
import { 
  Search, 
  BookOpen, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Send, 
  X, 
  Maximize2, 
  HelpCircle, 
  Play, 
  Terminal, 
  Lock, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  Bot, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Headphones,
  Fingerprint,
  RotateCcw,
  Volume2,
  Loader2,
  Layout,
  FileText,
  Rocket,
  Gavel,
  Users,
  Settings as SettingsIcon,
  ChevronLeft,
  GraduationCap,
  Scale,
  BrainCircuit,
  Shield,
  Check,
  Briefcase,
  MonitorCheck,
  Command,
  Database,
  StickyNote
} from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { User } from '../types';
import { decodeBase64, decodeAudioData, createPcmBlob } from '../services/audioUtils';

const { useState, useEffect, useRef, useCallback, useMemo } = React;

interface WikiArticle {
  id: string;
  category: 'Getting Started' | 'Core Operations' | 'AI Intelligence' | 'Compliance';
  title: string;
  summary: string;
  content: React.ReactNode;
  icon: any;
  targetTab?: string;
}

const WIKI_ARTICLES: WikiArticle[] = [
  {
    id: 'intro',
    category: 'Getting Started',
    title: 'Platform Overview',
    summary: 'Understanding multi-tenant nodes and secure recovery tracks.',
    icon: Rocket,
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900">The PCCS Infrastructure</h3>
        <p className="text-slate-600 leading-relaxed">
          PCCS (Predictive Cloud Collection System) is built on a "Isolated Node" architecture. Each client campaign operates as a separate logical entity with its own personnel clearance.
        </p>
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] flex items-start gap-4">
          <Info size={24} className="text-blue-600 shrink-0" />
          <div>
            <h4 className="font-black text-blue-900 text-sm">Concept: Cryptographic Isolation</h4>
            <p className="text-xs text-blue-700 leading-relaxed mt-1">Data across nodes is physically isolated. Switching campaigns via the Gateway re-initializes session tokens.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'workspace',
    category: 'Getting Started',
    title: 'The Nexus Workspace',
    summary: 'Using built-in Notes, Docs, and Ledger for high-speed ops.',
    icon: Command,
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900">Your Unified Utility Dock</h3>
        <p className="text-slate-600 leading-relaxed">
          PCCS includes a global <b>Nexus Workspace</b> accessible via the Command icon at the bottom right.
        </p>
        <ul className="space-y-4">
          <li className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
             <StickyNote size={20} className="text-amber-500 shrink-0" />
             <div><p className="text-xs font-black uppercase">Quick Notes</p><p className="text-xs text-slate-500">Capture transient thoughts. Auto-timestamped and persistent.</p></div>
          </li>
          <li className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
             <FileText size={20} className="text-blue-500 shrink-0" />
             <div><p className="text-xs font-black uppercase">PCCS Docs</p><p className="text-xs text-slate-500">Draft settlement letters or formal notices.</p></div>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'sentinel',
    category: 'Compliance',
    title: 'Sentinel AI Protection',
    summary: 'Automated threat detection and data exfiltration monitoring.',
    icon: ShieldCheck,
    content: (
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900">24/7 Behavioral Monitoring</h3>
        <p className="text-slate-600 leading-relaxed">
          The <b>Nexus Sentinel</b> monitors operator action to detect bulk copying or unauthorized screen capture.
        </p>
        <div className="grid grid-cols-2 gap-4">
           <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <Zap size={18} className="text-amber-500 mb-2" />
              <p className="text-[10px] font-black uppercase mb-1">Exfiltration</p>
              <p className="text-[10px] text-slate-500">Triggers if too many dossiers are opened rapidly.</p>
           </div>
           <div className="p-5 bg-white border border-slate-200 rounded-2xl">
              <Lock size={18} className="text-rose-500 mb-2" />
              <p className="text-[10px] font-black uppercase mb-1">Auto-Freeze</p>
              <p className="text-[10px] text-slate-500">Suspends account on critical security violations.</p>
           </div>
        </div>
      </div>
    )
  }
];

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export default function HelpCenter({ setActiveTab, user }: { setActiveTab: (tab: string) => void, user: User }) {
  const [viewMode, setViewMode] = useState<'wiki' | 'aria'>('wiki');
  const [selectedArticleId, setSelectedArticleId] = useState<string>(WIKI_ARTICLES[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAriaActive, setIsAriaActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isDialing, setIsDialing] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedArticle = useMemo(() => 
    WIKI_ARTICLES.find(a => a.id === selectedArticleId) || WIKI_ARTICLES[0]
  , [selectedArticleId]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return WIKI_ARTICLES;
    return WIKI_ARTICLES.filter(a => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const stopAria = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    setIsAriaActive(false);
    setIsDialing(false);
  }, []);

  const startAria = useCallback(async () => {
    setIsDialing(true);
    setViewMode('aria');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      const systemInstruction = `You are Aria, the PCCS Support Concierge.
      TONE: Professional, intelligent. USER: ${user.name} (${user.role})`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction
        },
        callbacks: {
          onopen: () => {
            setIsAriaActive(true);
            setIsDialing(false);
            setChatMessages(prev => [...prev, { 
              role: 'bot', 
              text: "Aria session established. How can I help with PCCS today?", 
              timestamp: new Date().toLocaleTimeString() 
            }]);

            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                if (isVoiceMode) session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setChatMessages(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'bot') {
                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                }
                return [...prev, { role: 'bot', text, timestamp: new Date().toLocaleTimeString() }];
              });
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              sourcesRef.current.add(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }
          },
          onerror: () => stopAria(),
          onclose: () => stopAria()
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (error) {
      setIsDialing(false);
      setIsAriaActive(false);
    }
  }, [isVoiceMode, stopAria, user]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: inputText, timestamp: new Date().toLocaleTimeString() };
    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');

    if (isAriaActive && sessionRef.current) {
       sessionRef.current.send({ parts: [{ text: inputText }] });
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] flex gap-6 animate-in fade-in duration-500 overflow-hidden relative text-left">
      <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0 overflow-hidden">
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <GraduationCap size={24} className="text-blue-600" /> Operational Guide
               </h2>
               <div className="flex bg-slate-200 p-1 rounded-xl">
                  <button onClick={() => setViewMode('wiki')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'wiki' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><BookOpen size={16}/></button>
                  <button onClick={() => setViewMode('aria')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'aria' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><Bot size={16}/></button>
               </div>
            </div>
            <div className="relative">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Search manual..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
            {['Getting Started', 'Core Operations', 'Compliance'].map(cat => {
              const articles = filteredArticles.filter(a => a.category === cat);
              if (articles.length === 0) return null;
              return (
                <div key={cat} className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">{cat}</h4>
                  {articles.map(article => (
                    <button key={article.id} onClick={() => { setSelectedArticleId(article.id); setViewMode('wiki'); }} className={`w-full p-4 rounded-2xl transition-all text-left flex items-start gap-4 ${selectedArticleId === article.id && viewMode === 'wiki' ? 'bg-slate-900 text-white shadow-xl' : 'hover:bg-slate-50'}`}>
                      <div className={`p-2 rounded-xl ${selectedArticleId === article.id && viewMode === 'wiki' ? 'bg-blue-600' : 'bg-slate-100 text-slate-400'}`}><article.icon size={16} /></div>
                      <div className="min-w-0"><h5 className="font-black text-xs truncate">{article.title}</h5><p className="text-[10px] text-slate-500 truncate mt-0.5">{article.summary}</p></div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {viewMode === 'wiki' ? (
           <div className="flex-1 bg-white rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-xl"><selectedArticle.icon size={28} /></div>
                    <div className="text-left"><p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">{selectedArticle.category}</p><h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedArticle.title}</h2></div>
                 </div>
                 {selectedArticle.targetTab && (
                   <button onClick={() => setActiveTab(selectedArticle.targetTab!)} className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl flex items-center gap-2">Module View <ChevronRight size={14} /></button>
                 )}
              </div>
              <div className="flex-1 overflow-y-auto p-12 scrollbar-thin max-w-4xl">{selectedArticle.content}</div>
           </div>
        ) : (
          <div className="flex-1 bg-[#0f172a] rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden relative border border-white/5">
             <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5 relative z-10 shrink-0">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-2xl"><Bot size={28} /></div>
                   <div className="text-left"><h3 className="text-xl font-black text-white tracking-tight leading-none">Aria Assistant</h3><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2"><MonitorCheck size={10} /> Neural Knowledge Link</p></div>
                </div>
                <div className="flex gap-4">
                   <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                      <button onClick={() => setIsVoiceMode(false)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!isVoiceMode ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-white'}`}>Chat</button>
                      <button onClick={() => setIsVoiceMode(true)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isVoiceMode ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>Voice</button>
                   </div>
                   {isAriaActive ? <button onClick={stopAria} className="p-3 bg-rose-600 text-white rounded-2xl shadow-xl"><X size={20}/></button> : <button onClick={startAria} disabled={isDialing} className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl flex items-center gap-2">{isDialing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Initialize</button>}
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth scrollbar-none relative z-10">
                {chatMessages.map((msg, idx) => (
                   <div key={idx} className={`flex gap-6 ${msg.role === 'bot' ? 'text-left' : 'flex-row-reverse text-right'}`}>
                      <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 font-black text-[10px] ${msg.role === 'bot' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{msg.role === 'bot' ? 'ARIA' : 'USER'}</div>
                      <div className={`max-w-[80%] p-6 rounded-[2.5rem] text-sm font-medium leading-relaxed relative ${msg.role === 'bot' ? 'bg-white/10 text-blue-50' : 'bg-blue-600 text-white'}`}>{msg.text}</div>
                   </div>
                ))}
                <div ref={chatEndRef} />
             </div>
             <div className="p-8 md:p-12 bg-black/40 border-t border-white/5 backdrop-blur-md shrink-0">
                {isVoiceMode && isAriaActive ? (
                   <div className="flex flex-col items-center gap-6"><div className="flex items-center gap-1.5 h-16">{Array.from({ length: 20 }).map((_, i) => (<div key={i} className="w-1 rounded-full bg-blue-400 animate-wave" style={{ height: (20 + Math.random() * 80) + '%', animationDelay: `${i * 0.05}s` }} />))}</div><button onClick={stopAria} className="w-16 h-16 bg-rose-600 text-white rounded-[1.5rem] flex items-center justify-center"><MicOff size={28} /></button></div>
                ) : (
                   <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto w-full flex items-end gap-5">
                      <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder={isAriaActive ? "Ask Aria..." : "Initialize session..."} rows={1} disabled={!isAriaActive} className="w-full pl-8 pr-16 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] text-white font-bold text-sm outline-none resize-none disabled:opacity-30" />
                      <button type="submit" disabled={!isAriaActive || !inputText.trim()} className="p-6 bg-blue-600 text-white rounded-[2rem] shadow-xl disabled:opacity-30"><Send size={24} /></button>
                   </form>
                )}
             </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @keyframes wave { 0%, 100% { transform: scaleY(0.4); opacity: 0.3; } 50% { transform: scaleY(1); opacity: 1; } }
        .animate-wave { animation: wave 1.2s infinite ease-in-out; }
      `}</style>
    </div>
  );
}