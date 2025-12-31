
import React, { useState, useRef, useMemo } from 'react';
import { 
  Layers, 
  Wand2, 
  Loader2, 
  Zap, 
  ChevronRight, 
  Plus, 
  Save, 
  Activity, 
  Kanban, 
  LayoutTemplate, 
  Copy, 
  Target, 
  X, 
  Sparkles, 
  Bot, 
  TrendingUp, 
  Smartphone, 
  MessageCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Gavel, 
  ShieldAlert, 
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
  Info
} from 'lucide-react';
import { DUMMY_STRATEGIES } from '../constants';
import { Strategy, CommunicationType, StrategyStep } from '../types';
import { optimizeStrategy } from '../services/geminiService';
import { GoogleGenAI, Type } from '@google/genai';

const BUCKETS = ['0+', '30+', '60+', '90+', '120+'];

const STAGES = [
  { id: 'pre', label: 'Preventive', range: '0-5 DPD', color: 'emerald', icon: ShieldAlert },
  { id: 'soft', label: 'Soft Nudge', range: '6-30 DPD', color: 'blue', icon: MessageSquare },
  { id: 'hard', label: 'Hard Recovery', range: '31-90 DPD', color: 'amber', icon: Zap },
  { id: 'legal', label: 'Legal Track', range: '90+ DPD', color: 'rose', icon: Gavel }
];

const getChannelIcon = (type: CommunicationType) => {
  switch (type) {
    case CommunicationType.SMS: return <Smartphone size={16} />;
    case CommunicationType.WHATSAPP: return <MessageCircle size={16} />;
    case CommunicationType.EMAIL: return <Mail size={16} />;
    case CommunicationType.VOICE: return <Phone size={16} />;
    case CommunicationType.FIELD_VISIT: return <MapPin size={16} />;
    default: return <Smartphone size={16} />;
  }
};

const StrategyEngine: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>(DUMMY_STRATEGIES);
  const [activeBucket, setActiveBucket] = useState('30+');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(strategies[0]);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isBlueprinting, setIsBlueprinting] = useState(false);
  const [aiOptimization, setAiOptimization] = useState<any>(null);

  const filteredStrategies = useMemo(() => strategies.filter(s => s.bucket === activeBucket), [strategies, activeBucket]);

  const handleBlueprintAI = async (goal: string) => {
    setIsBlueprinting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Create a detailed debt collection strategy for the ${activeBucket} bucket. Goal: ${goal}. The strategy is for the Philippines market. Use multi-channel steps (SMS, WhatsApp, VoiceBot, Viber, Email). Focus on Taglish tone and high GCash payment integration.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayOffset: { type: Type.NUMBER },
                    channel: { type: Type.STRING },
                    templateName: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text);
      const newStrategy: Strategy = {
        id: "strat-ai-" + Date.now(),
        name: "AI: " + result.name,
        description: result.description,
        bucket: activeBucket,
        status: 'Draft',
        lastModified: new Date().toISOString().split('T')[0],
        steps: result.steps.map((s: any, idx: number) => ({
          id: "step-" + idx + "-" + Date.now(),
          dayOffset: s.dayOffset,
          channel: s.channel as CommunicationType,
          templateId: s.templateName,
          isMandatory: true
        }))
      };

      setStrategies([newStrategy].concat(strategies));
      setSelectedStrategy(newStrategy);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBlueprinting(false);
    }
  };

  const handleOptimize = async () => {
    if (!selectedStrategy) return;
    setIsOptimizing(true);
    setAiOptimization(null);
    setActiveStepId(null); // Switch focus to optimization result
    try {
      const result = await optimizeStrategy(selectedStrategy);
      setAiOptimization(result);
    } catch (err) {
      console.error("Optimization failed:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const toggleStrategyStatus = () => {
    if (!selectedStrategy) return;
    const newStatus: 'Active' | 'Draft' | 'Paused' = selectedStrategy.status === 'Active' ? 'Paused' : 'Active';
    const updatedStrat = { ...selectedStrategy, status: newStatus };
    setSelectedStrategy(updatedStrat);
    setStrategies(prev => prev.map(s => s.id === selectedStrategy.id ? updatedStrat : s));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-[-40px] top-[-40px] opacity-[0.03] rotate-12">
          <Layers size={280} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10 text-left">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Strategy DNA Workbench</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Orchestrating recovery sequences for the Philippines market.</p>
          </div>
          <div className="flex gap-3">
             <button 
                disabled={isBlueprinting}
                onClick={() => handleBlueprintAI("Maximize payment commitment for early bucket")}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
             >
                {isBlueprinting ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                {isBlueprinting ? 'Designing Blueprint...' : 'AI Strategy Generator'}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
          {STAGES.map((stage) => (
            <div key={stage.id} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-3 group hover:border-blue-200 transition-all cursor-default text-left">
               <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-${stage.color}-50 text-${stage.color}-600`}>
                    <stage.icon size={18} />
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stage.range}</span>
               </div>
               <div>
                  <p className="text-sm font-black text-slate-900">{stage.label}</p>
                  <div className="flex items-center gap-2 mt-2">
                     <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full w-[60%] group-hover:w-[75%] transition-all duration-700 bg-${stage.color}-500`}></div>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[700px]">
        
        {/* LEFT: Strategy Inventory */}
        <div className="xl:col-span-3 flex flex-col gap-4 overflow-hidden text-left">
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-6 px-1">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DNA Inventory</h3>
                 <div className="flex gap-1.5">
                    {BUCKETS.map(b => (
                      <button 
                        key={b} 
                        onClick={() => { setActiveBucket(b); setAiOptimization(null); }}
                        className={`w-10 h-8 rounded-lg text-[9px] font-black transition-all ${activeBucket === b ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      >
                        {b}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none">
                 {filteredStrategies.map(strat => (
                   <button 
                    key={strat.id}
                    onClick={() => { setSelectedStrategy(strat); setAiOptimization(null); setActiveStepId(null); }}
                    className={`w-full p-5 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-3 group ${selectedStrategy?.id === strat.id ? 'bg-white border-blue-600 shadow-2xl shadow-blue-500/10' : 'bg-slate-50/50 border-transparent hover:border-slate-200'}`}
                   >
                      <div className="flex justify-between items-start">
                         <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${strat.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                           {strat.status}
                         </div>
                         <ChevronRight size={14} className={`transition-transform ${selectedStrategy?.id === strat.id ? 'translate-x-1 text-blue-600' : 'text-slate-300'}`} />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{strat.name}</h4>
                      <div className="flex -space-x-1.5 mt-1">
                        {strat.steps.slice(0, 4).map((s, i) => (
                          <div key={i} className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                            {getChannelIcon(s.channel)}
                          </div>
                        ))}
                      </div>
                   </button>
                 ))}
                 <button className="w-full p-5 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2 group">
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">New Strategy</span>
                 </button>
              </div>
           </div>
        </div>

        {/* CENTER: Visual Blueprint */}
        <div className="xl:col-span-6 flex flex-col overflow-hidden text-left">
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden relative">
              {selectedStrategy ? (
                <>
                  <div className="p-8 border-b border-slate-100 bg-slate-50/20 flex justify-between items-center shrink-0">
                     <div>
                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Blueprint Editor</p>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedStrategy.name}</h2>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={toggleStrategyStatus} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedStrategy.status === 'Active' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                           {selectedStrategy.status === 'Active' ? 'Pause DNA' : 'Activate DNA'}
                        </button>
                        <button className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg"><Save size={18} /></button>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-10 relative scrollbar-none">
                     <div className="absolute left-1/2 top-10 bottom-10 w-px bg-slate-100"></div>
                     
                     <div className="space-y-12 relative z-10">
                        {selectedStrategy.steps.map((step) => (
                          <div key={step.id} className="flex items-center gap-8 relative group">
                             <div className="w-1/2 text-right">
                                <div className="inline-flex flex-col items-end pr-8 relative">
                                   <p className="text-2xl font-black text-slate-900 leading-none">Day {step.dayOffset}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automatic Execution</p>
                                   <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                                </div>
                             </div>

                             <div className="w-1/2">
                                <button 
                                  onClick={() => { setActiveStepId(step.id); setAiOptimization(null); }}
                                  className={`w-full p-5 rounded-[2rem] border-2 transition-all text-left flex items-center gap-4 group/card ${activeStepId === step.id ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/20' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}
                                >
                                   <div className={`p-3 rounded-2xl transition-colors ${activeStepId === step.id ? 'bg-white/20' : 'bg-slate-50 text-slate-600'}`}>
                                      {getChannelIcon(step.channel)}
                                   </div>
                                   <div className="min-w-0 flex-1">
                                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${activeStepId === step.id ? 'text-blue-100' : 'text-slate-400'}`}>{step.channel}</p>
                                      <p className="text-sm font-black truncate">{step.templateId}</p>
                                   </div>
                                   <ChevronRight size={16} className={activeStepId === step.id ? 'text-white' : 'text-slate-200'} />
                                </button>
                             </div>
                          </div>
                        ))}

                        <div className="flex justify-center">
                           <button className="flex flex-col items-center gap-2 group">
                              <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-blue-300 group-hover:text-blue-600 transition-all">
                                 <Plus size={24} />
                              </div>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">Append Action</span>
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
                     <div className="flex items-center gap-6">
                        <div className="text-left">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Roll Rate Protection</p>
                           <p className="text-xl font-black text-emerald-400 tracking-tighter">Score: 84.2/100</p>
                        </div>
                        <div className="h-10 w-px bg-white/10"></div>
                        <div className="text-left">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Cases</p>
                           <p className="text-xl font-black text-white tracking-tighter">1,248 Accounts</p>
                        </div>
                     </div>
                     <button className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95">
                        <Activity size={16} /> Strategy Simulation
                     </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-40 grayscale">
                   <Kanban size={64} className="mb-6" />
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select Strategy Sequence</h3>
                   <p className="text-sm font-medium mt-2">Initialize the workbench by picking a strategy from your inventory.</p>
                </div>
              )}
           </div>
        </div>

        {/* RIGHT: Inspector & Optimization Panel */}
        <div className="xl:col-span-3 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-none text-left">
           {aiOptimization ? (
             <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-blue-500/20 space-y-8 animate-in zoom-in-95 duration-500 relative overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] opacity-10 rotate-12"><Sparkles size={180} className="text-blue-400" /></div>
                
                <div className="flex items-center justify-between relative z-10">
                   <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                      <Bot size={14} /> Optimization Protocol
                   </h3>
                   <button onClick={() => setAiOptimization(null)} className="p-1 hover:bg-white/10 rounded-lg text-slate-500 transition-colors"><X size={16}/></button>
                </div>

                <div className="text-center space-y-2 relative z-10">
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                      <TrendingUp size={16} />
                      <span className="text-2xl font-black">+{aiOptimization.improvement_percent}%</span>
                   </div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projected Lift in Commitment</p>
                </div>

                <div className="space-y-6 relative z-10">
                   <section className="space-y-3">
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2"><Sparkles size={12} /> Suggested Improvements</p>
                      <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                         <p className="text-xs font-bold text-slate-200 leading-relaxed italic">"{aiOptimization.suggestion}"</p>
                      </div>
                   </section>

                   <section className="space-y-3">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><Info size={12} /> Core Reasoning</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{aiOptimization.reasoning}</p>
                   </section>
                </div>

                <button 
                  onClick={() => {
                    alert("Applying optimized parameters to strategy engine...");
                    setAiOptimization(null);
                  }}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-500 transition-all active:scale-95 relative z-10"
                >
                   Commit DNA Optimization
                </button>
             </div>
           ) : activeStepId ? (
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step Inspector</h3>
                   <button onClick={() => setActiveStepId(null)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><X size={16}/></button>
                </div>

                <section className="space-y-4">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <LayoutTemplate size={14} /> Content Payload
                   </p>
                   <div className="p-5 bg-slate-900 rounded-[2rem] text-slate-300 font-mono text-[10px] leading-relaxed relative group overflow-hidden">
                      <p className="relative z-10 leading-relaxed">
                        "Hello [NAME], si [AGENT] ito mula sa PCCS. May balance pa po kayo na $[AMOUNT] for loan [LOAN_ID]. Para iwas legal issue, pay today via GCash: [LINK]. Salamat po."
                      </p>
                      <button className="absolute bottom-2 right-2 p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-white"><Copy size={12}/></button>
                   </div>
                </section>

                <section className="space-y-4">
                   <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Target size={14} /> Efficiency Prediction
                   </p>
                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-1">
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Open Rate</span>
                         <p className="text-xl font-black text-slate-900">92%</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-1">
                         <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CTR (PTP)</span>
                         <p className="text-xl font-black text-slate-900">14%</p>
                      </div>
                   </div>
                </section>
                
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                   Update Action DNA
                </button>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20"><Sparkles size={20} /></div>
                      <h3 className="font-black text-lg tracking-tight">Strategic Intel</h3>
                   </div>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                     Select any step in the sequence to inspect its delivery payload and predicted performance.
                   </p>
                   <div className="pt-6 border-t border-slate-100 space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <span>Global Health</span>
                         <span className="text-emerald-500">OPTIMAL</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[88%]"></div>
                      </div>
                   </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
                      <Bot size={140} />
                   </div>
                   <div className="relative z-10 space-y-6">
                      <h4 className="font-black text-lg tracking-tight">Nexus AI Pilot</h4>
                      <p className="text-xs text-indigo-100 font-medium leading-relaxed italic bg-white/10 p-5 rounded-2xl border border-white/10">
                         "The <b>High Intensity Recovery</b> strategy currently shows 90+ DPD accounts respond best to early morning Viber sequences. Re-calibrate?"
                      </p>
                      <button 
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                        className="w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                         {isOptimizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                         {isOptimizing ? 'Analyzing DNA...' : 'Optimize Strategy DNA'}
                      </button>
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default StrategyEngine;
