import * as React from 'react';
import { 
  GraduationCap, 
  Gamepad2, 
  BookOpen, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  BrainCircuit, 
  ShieldCheck, 
  Smartphone, 
  Loader2, 
  Terminal, 
  Lock, 
  X, 
  History, 
  ChevronRight, 
  Info,
  MessageSquare,
  Bot,
  Send,
  Sparkles,
  Flame,
  Award,
  Volume2,
  UserCheck,
  Activity
} from 'lucide-react';
import { User } from '../types';
import { getSimulationResponse } from '../services/geminiService';

const { useState, useEffect, useRef } = React;

interface TrainingGroundProps {
  user: User;
  onCertificationComplete: () => void;
  isSuperadmin: boolean;
}

const TrainingGround: React.FC<TrainingGroundProps> = ({ user, onCertificationComplete, isSuperadmin }) => {
  const [activeTab, setActiveTab] = useState<'academy' | 'simulator' | 'nesting'>('academy');
  const [trainingStep, setTrainingStep] = useState(user.trainingStep || 1);
  
  // Simulator State
  const [simMessages, setSimMessages] = useState<{ role: string, text: string, sentiment?: string, coaching?: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [simStats, setSimStats] = useState({ compliance: 100, empathy: 100, negotiation: 0 });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simMessages]);

  const handleSimSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isAiResponding) return;

    const userText = inputValue;
    setInputValue('');
    setSimMessages(prev => [...prev, { role: 'AGENT', text: userText }]);
    setIsAiResponding(true);

    try {
      const history = simMessages.map(m => ({ role: m.role, text: m.text }));
      const aiResult = await getSimulationResponse(userText, history);
      
      if (aiResult) {
        setSimMessages(prev => [...prev, { 
          role: 'DEBTOR', 
          text: aiResult.response, 
          sentiment: aiResult.sentiment,
          coaching: aiResult.coachingTip
        }]);

        setSimStats(prev => ({
          compliance: aiResult.isComplianceViolationDetected ? Math.max(0, prev.compliance - 20) : prev.compliance,
          empathy: aiResult.sentiment === 'Angry' ? Math.max(0, prev.empathy - 5) : Math.min(100, prev.empathy + 5),
          negotiation: aiResult.response.toLowerCase().includes('ok') ? Math.min(100, prev.negotiation + 25) : prev.negotiation
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiResponding(false);
    }
  };

  const completePhase = () => {
    if (trainingStep < 3) {
      setTrainingStep(prev => prev + 1);
    } else {
      onCertificationComplete();
    }
  };

  const stepStyles = {
    Active: 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]',
    Complete: 'bg-emerald-500/10 border-emerald-500/50 opacity-60',
    Locked: 'bg-slate-900 border-white/5 opacity-40'
  };

  const iconStyles = {
    Active: 'bg-blue-600 text-white',
    Complete: 'bg-slate-800 text-slate-500',
    Locked: 'bg-slate-800 text-slate-500'
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-inter text-white relative overflow-hidden text-left">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1.5px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      
      <header className="h-20 bg-slate-900 border-b border-white/5 flex items-center justify-between px-10 shrink-0 relative z-10">
        <div className="flex items-center gap-6">
           <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <GraduationCap size={24} />
           </div>
           <div>
              <h1 className="text-xl font-black tracking-tight leading-none text-white">Nexus Academy</h1>
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1.5">Certification Protocol v2.4</p>
           </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {(['academy', 'simulator', 'nesting'] as const).map(t => (
                <button 
                  key={t}
                  onClick={() => setActiveTab(t)} 
                  className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
           </div>

           {isSuperadmin && (
             <button 
               onClick={onCertificationComplete}
               className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-700 transition-all border border-rose-500/50"
             >
                <Flame size={14} /> Force Certification
             </button>
           )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-10 flex flex-col gap-10 overflow-hidden relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
           {[
             { step: 1, label: 'Knowledge Hub', icon: BookOpen, status: trainingStep > 1 ? 'Complete' : (trainingStep === 1 ? 'Active' : 'Locked') },
             { step: 2, label: 'Stress Simulation', icon: Gamepad2, status: trainingStep > 2 ? 'Complete' : (trainingStep === 2 ? 'Active' : 'Locked') },
             { step: 3, label: 'Final Assessment', icon: Award, status: trainingStep === 3 ? 'Active' : 'Locked' }
           ].map(ph => (
             <div key={ph.step} className={`p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between ${stepStyles[ph.status as keyof typeof stepStyles]}`}>
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconStyles[ph.status as keyof typeof iconStyles]}`}>
                      <ph.icon size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phase 0{ph.step}</p>
                      <h4 className="text-sm font-black tracking-tight">{ph.label}</h4>
                   </div>
                </div>
                {ph.status === 'Complete' && <CheckCircle2 size={24} className="text-emerald-500" />}
             </div>
           ))}
        </div>

        <div className="flex-1 flex gap-8 overflow-hidden">
           <div className="flex-1 flex flex-col gap-6 overflow-hidden">
              {activeTab === 'academy' && (
                <div className="flex-1 bg-slate-900/50 rounded-[3.5rem] border border-white/5 p-12 overflow-y-auto scrollbar-none animate-in fade-in duration-500">
                   <div className="max-w-3xl space-y-10">
                      <div className="space-y-4">
                         <h2 className="text-4xl font-black tracking-tighter">Module 01: Fair Practice Code</h2>
                         <p className="text-slate-400 text-lg font-medium leading-relaxed italic">
                            Understanding the legal parameters of debt recovery (BSP Circular 454).
                         </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {[
                           { title: 'Contact Hours', text: 'Authorization restricted to 8:00 AM - 9:00 PM local time.', icon: Lock },
                           { title: 'Privacy Integrity', text: 'Never disclose debt details to neighbors or unauthorized parties.', icon: ShieldCheck },
                           { title: 'Truthful Disclosure', text: 'Always identify as a PCCS rep and provide employee ID.', icon: UserCheck },
                           { title: 'Zero Harassment', text: 'Profanity or threats are grounds for immediate termination.', icon: Flame }
                         ].map((item, i) => (
                           <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-4 hover:bg-white/10 transition-all">
                              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                                 <item.icon size={24} />
                              </div>
                              <h4 className="text-lg font-black">{item.title}</h4>
                              <p className="text-sm text-slate-400 leading-relaxed font-medium">{item.text}</p>
                           </div>
                         ))}
                      </div>

                      <button 
                        onClick={completePhase}
                        className="px-12 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-700 transition-all flex items-center gap-3"
                      >
                         Advance to Simulator <ArrowRight size={18} />
                      </button>
                   </div>
                </div>
              )}

              {activeTab === 'simulator' && (
                <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden animate-in zoom-in-95">
                   <div className="flex-1 bg-slate-900 rounded-[3rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl">
                      <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                         <div className="flex items-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_#f43f5e]"></div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-white">Live Stress Test</h4>
                         </div>
                         <button onClick={() => setSimMessages([])} className="p-2 hover:bg-white/10 rounded-xl text-slate-500"><X size={18}/></button>
                      </div>

                      <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-none">
                         {simMessages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-6">
                               <Bot size={64} className="animate-bounce" />
                               <p className="text-xs font-black uppercase tracking-[0.3em]">Initialize conversation to start</p>
                            </div>
                         )}

                         {simMessages.map((msg, idx) => (
                           <div key={idx} className={`flex gap-6 animate-in slide-in-from-bottom-4 ${msg.role === 'AGENT' ? 'flex-row-reverse text-right' : 'text-left'}`}>
                              <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center shrink-0 font-black text-[10px] ${msg.role === 'AGENT' ? 'bg-blue-600' : 'bg-slate-800'}`}>
                                 {msg.role === 'AGENT' ? 'YOU' : 'AI'}
                              </div>
                              <div className="max-w-[75%] space-y-3">
                                 <div className={`p-6 rounded-[2.5rem] text-sm font-medium leading-relaxed relative ${msg.role === 'AGENT' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 border border-white/10 rounded-tl-none'}`}>
                                    {msg.text}
                                    {msg.sentiment && <div className="absolute -bottom-3 left-6 px-2 py-0.5 bg-rose-600 text-white text-[8px] font-black rounded uppercase">SENTIMENT: {msg.sentiment}</div>}
                                 </div>
                                 {msg.coaching && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
                                       <Sparkles size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                       <p className="text-[10px] font-bold text-emerald-400 italic">AI Whisper: "{msg.coaching}"</p>
                                    </div>
                                 )}
                              </div>
                           </div>
                         ))}
                         <div ref={chatEndRef} />
                      </div>

                      <div className="p-8 bg-black/40 border-t border-white/5 backdrop-blur-md">
                         <form onSubmit={handleSimSend} className="max-w-3xl mx-auto flex items-end gap-4">
                            <textarea 
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSimSend(e))}
                              placeholder="Draft response..."
                              rows={1}
                              className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-white font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 resize-none"
                            />
                            <button disabled={isAiResponding} className="p-5 bg-blue-600 text-white rounded-[1.8rem] transition-all hover:bg-blue-700 disabled:opacity-30">
                               {isAiResponding ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                            </button>
                         </form>
                      </div>
                   </div>

                   <div className="w-full lg:w-80 space-y-6 shrink-0">
                      <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-8 space-y-8 shadow-xl">
                         <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} className="text-blue-400" /> Neural Vitals
                         </h4>
                         <div className="space-y-6">
                            {[
                              { label: 'Compliance', value: simStats.compliance, color: 'blue' },
                              { label: 'Empathy', value: simStats.empathy, color: 'purple' },
                              { label: 'Negotiation', value: simStats.negotiation, color: 'emerald' }
                            ].map((stat, i) => (
                              <div key={i} className="space-y-2">
                                 <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                    <span className="text-slate-400">{stat.label}</span>
                                    <span className="text-white">{stat.value}%</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${stat.value}%`, backgroundColor: stat.color === 'emerald' ? '#10b981' : stat.color === 'purple' ? '#a855f7' : '#3b82f6' }}></div>
                                 </div>
                              </div>
                            ))}
                         </div>
                         <button 
                            onClick={completePhase}
                            disabled={simStats.compliance < 80}
                            className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase shadow-2xl disabled:opacity-20 transition-all"
                         >
                            Lock Nesting Phase
                         </button>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'nesting' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-20 bg-slate-900 border border-white/5 rounded-[4rem] animate-in zoom-in-95">
                   <div className="w-40 h-40 bg-blue-600 text-white rounded-[3.5rem] flex items-center justify-center mb-10 shadow-[0_0_80px_rgba(59,130,246,0.3)] border-4 border-white/20">
                      <Award size={80} />
                   </div>
                   <h2 className="text-4xl font-black text-white leading-tight max-w-2xl">Final Nesting Assessment</h2>
                   <p className="text-slate-400 text-lg font-medium mt-6 max-w-lg leading-relaxed italic">
                      Handle 5 real-world "Shadow Mode" cases to finalize your certification.
                   </p>
                   <button 
                      onClick={onCertificationComplete}
                      className="mt-12 px-12 py-6 bg-white text-slate-950 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-50 transition-all"
                   >
                      Launch Final Exam
                   </button>
                </div>
              )}
           </div>
        </div>
      </main>

      <footer className="p-8 border-t border-white/5 bg-slate-900 shrink-0 relative z-10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-10">
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Training Cluster Active</span>
               </div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">PCCS ACADEMY • PRE-LIVE AUTH</p>
         </div>
      </footer>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        @keyframes wave { 0%, 100% { transform: scaleY(0.4); opacity: 0.3; } 50% { transform: scaleY(1); opacity: 1; } }
        .animate-wave { animation: wave 1.2s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default TrainingGround;