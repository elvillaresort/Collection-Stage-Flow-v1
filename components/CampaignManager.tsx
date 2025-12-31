
import * as React from 'react';
import { 
  Rocket, 
  Zap, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Play, 
  Pause, 
  X, 
  CheckCircle2, 
  Loader2, 
  Smartphone, 
  Mail, 
  MessageCircle, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Clock, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Signal,
  CheckCheck,
  Ban,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Target,
  LayoutGrid,
  ChevronRight,
  Database,
  Radio,
  FileText,
  DollarSign,
  AlertTriangle,
  History,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Calendar,
  Gavel,
  Tag,
  MousePointer2,
  Trash2,
  PieChart as PieIcon,
  ChevronDown,
  Bot,
  ChevronLeft,
  // Fixed: Added missing icon imports
  Lock,
  CheckCircle
} from 'lucide-react';
import { Campaign, CommunicationType, SystemSettings, CaseStatus, CampaignRule, CampaignFilter } from '../types';

const { useState, useMemo } = React;

const DUMMY_CAMPAIGNS: Campaign[] = [
  {
    id: 'CMP-9901',
    name: 'Early Bucket SMS Nudge',
    type: CommunicationType.SMS,
    strategyId: 'S-001',
    status: 'active',
    totalTargets: 1240,
    processed: 842,
    engagementRate: 14.5,
    recoveredAmount: 450000,
    totalLiability: 1200000,
    startTime: '2023-11-20 09:00',
    lastUpdate: '2 mins ago',
    aiSuccessPrediction: 68
  },
  {
    id: 'CMP-9902',
    name: 'Viber High Intensity (PH)',
    type: CommunicationType.VIBER,
    strategyId: 'S-002',
    status: 'active',
    totalTargets: 500,
    processed: 488,
    engagementRate: 22.1,
    recoveredAmount: 180000,
    totalLiability: 400000,
    startTime: '2023-11-21 10:30',
    lastUpdate: 'Just now',
    aiSuccessPrediction: 84
  },
  {
    id: 'CMP-9903',
    name: 'Pre-Legal Final Notice',
    type: CommunicationType.EMAIL,
    strategyId: 'S-003',
    status: 'paused',
    totalTargets: 85,
    processed: 42,
    engagementRate: 8.2,
    recoveredAmount: 15000,
    totalLiability: 150000,
    startTime: '2023-11-19 14:00',
    lastUpdate: '4 hours ago',
    aiSuccessPrediction: 45
  }
];

const CampaignManager: React.FC<{ settings: SystemSettings }> = ({ settings }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(DUMMY_CAMPAIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  
  // Wizard Creation State
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignFilters, setNewCampaignFilters] = useState<CampaignFilter>({
    minAge: 30,
    maxAge: 60,
    riskLevels: ['Medium', 'High'],
    status: [CaseStatus.PENDING]
  });
  const [newCampaignRules, setNewCampaignRules] = useState<CampaignRule[]>([
    { id: 'r1', triggerEvent: 'on_launch', action: CommunicationType.SMS, templateId: 'SMS_01' },
    { id: 'r2', triggerEvent: 'after_3_days', action: CommunicationType.VIBER, templateId: 'VB_02' }
  ]);

  const sym = settings.localization.currencySymbol;
  const selectedCampaign = useMemo(() => campaigns.find(c => c.id === selectedCampaignId), [selectedCampaignId, campaigns]);

  const handleToggleStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    if (selectedCampaignId === id) setSelectedCampaignId(null);
  };

  const handleCreateCampaign = () => {
    const fresh: Campaign = {
      id: `CMP-${Math.floor(Math.random() * 10000)}`,
      name: newCampaignName || 'Untitled Wave',
      type: CommunicationType.SMS,
      strategyId: 'Custom',
      status: 'active',
      totalTargets: 1248,
      processed: 0,
      engagementRate: 0,
      recoveredAmount: 0,
      totalLiability: 350000,
      startTime: new Date().toLocaleString(),
      lastUpdate: 'Initial Launch',
      filters: newCampaignFilters,
      rules: newCampaignRules,
      aiSuccessPrediction: 72
    };
    setCampaigns([fresh, ...campaigns]);
    setShowWizard(false);
    setWizardStep(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 text-left">
      
      {/* HEADER: MISSION CONTROL */}
      <div className="bg-slate-900 p-6 md:p-10 lg:p-12 rounded-[2rem] sm:rounded-[3rem] lg:rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl border-4 border-slate-800">
        <div className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12 hidden md:block"><Rocket size={320} /></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 lg:gap-10 text-left">
           <div className="max-w-2xl">
              <div className="flex items-center gap-4 sm:gap-5 mb-4">
                 <div className="p-3 sm:p-4 bg-blue-600 rounded-2xl sm:rounded-3xl shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse shrink-0"><Rocket size={20} className="sm:w-7 sm:h-7" /></div>
                 <div>
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tight leading-none">Campaign Mission Control</h2>
                    <p className="text-blue-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-2">Recovery Orchestration Node</p>
                 </div>
              </div>
              <p className="text-slate-400 font-bold leading-relaxed text-sm sm:text-lg max-w-xl italic line-clamp-3 md:line-clamp-none">
                "Recovering assets through algorithmic delivery and automated tracks."
              </p>
           </div>
           <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/10 shrink-0 w-full lg:w-auto lg:min-w-[320px]">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                 <p className="text-[8px] sm:text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Cluster Yield</p>
                 <div className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                    <span className="text-[8px] sm:text-[10px] font-black">+12.4%</span>
                 </div>
              </div>
              <div className="space-y-3 sm:space-y-4 text-left">
                 <div className="flex justify-between items-center"><span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase">Live Clusters</span><span className="text-lg sm:text-xl font-black text-white">{campaigns.filter(c => c.status === 'active').length}</span></div>
                 <div className="flex justify-between items-center"><span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase">Recovery Yield</span><span className="text-lg sm:text-xl font-black text-emerald-400">{sym}1.2M</span></div>
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[64%]" /></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        
        {/* LEFT: Active Campaigns Grid */}
        <div className="xl:col-span-8 space-y-6 sm:space-y-8">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
              <div className="text-left">
                 <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Signal size={18} className="text-blue-600 sm:w-5 sm:h-5" /> Streams
                 </h3>
                 <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monitoring {campaigns.length} waves</p>
              </div>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                 <div className="relative flex-1 sm:flex-none sm:w-64 lg:w-80">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search waves..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl sm:rounded-[1.5rem] text-[11px] sm:text-xs font-bold outline-none shadow-sm focus:ring-4 focus:ring-blue-500/10" 
                    />
                 </div>
                 <button onClick={() => setShowWizard(true)} className="px-5 sm:px-8 py-2.5 sm:py-3 bg-slate-900 text-white rounded-xl sm:rounded-[1.5rem] text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 sm:gap-3 active:scale-95 transition-all shrink-0">
                    <Plus size={16} /> <span className="hidden xs:inline">Provision</span>
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {campaigns.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(camp => (
                <div 
                  key={camp.id} 
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className={`bg-white rounded-[1.8rem] sm:rounded-[2.5rem] lg:rounded-[3rem] border-2 transition-all p-5 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 group cursor-pointer relative overflow-hidden text-left ${
                    selectedCampaignId === camp.id ? 'border-blue-600 shadow-2xl ring-4 sm:ring-8 ring-blue-500/5' : 'border-slate-100 hover:border-blue-200 shadow-sm'
                  } ${camp.status === 'paused' ? 'grayscale opacity-70' : ''}`}
                >
                   <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                         <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg transition-all shrink-0 ${
                            camp.status === 'active' ? 'bg-blue-600 text-white shadow-blue-500/20 group-hover:scale-110' : 'bg-slate-100 text-slate-400'
                         }`}>
                            {camp.type === CommunicationType.SMS ? <Smartphone size={20} className="sm:w-6 sm:h-6" /> : camp.type === CommunicationType.VIBER ? <MessageCircle size={20} className="sm:w-6 sm:h-6" /> : <Mail size={20} className="sm:w-6 sm:h-6" />}
                         </div>
                         <div className="min-w-0">
                            <h4 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors truncate">{camp.name}</h4>
                            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 sm:mt-2">{camp.type}</p>
                         </div>
                      </div>
                      <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                         <button onClick={() => handleToggleStatus(camp.id)} className="p-1.5 sm:p-2.5 bg-slate-50 rounded-lg sm:rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                            {camp.status === 'active' ? <Pause size={16}/> : <Play size={16}/>}
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 relative z-10">
                      <div>
                         <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Throughput</p>
                         <div className="flex items-end gap-1.5 sm:gap-2">
                            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{((camp.processed / camp.totalTargets) * 100).toFixed(0)}%</p>
                            <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase pb-0.5 whitespace-nowrap">{camp.processed} Cases</span>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Recovery</p>
                         <p className="text-xl sm:text-2xl font-black text-emerald-500 leading-none truncate">{sym}{(camp.recoveredAmount / 1000).toFixed(1)}k</p>
                      </div>
                   </div>

                   <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden relative z-10">
                      <div 
                        className={`h-full transition-all duration-1000 ${camp.status === 'active' ? 'bg-blue-600' : 'bg-slate-300'}`} 
                        style={{ width: `${(camp.processed / camp.totalTargets) * 100}%` }}
                      ></div>
                   </div>

                   <div className="pt-3 sm:pt-4 border-t border-slate-50 flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-1.5">
                         <Sparkles size={10} className="text-amber-500" />
                         <span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase">AI: {camp.aiSuccessPrediction}%</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                         <Clock size={10} />
                         <span className="text-[8px] sm:text-[9px] font-black uppercase">{camp.lastUpdate}</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* RIGHT: Selected Campaign Insights */}
        <div className="xl:col-span-4 space-y-6 lg:space-y-8 text-left">
           {selectedCampaign ? (
              <div className="bg-white rounded-[2rem] sm:rounded-[3.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
                 <div className="p-6 sm:p-8 lg:p-10 bg-slate-950 text-white relative overflow-hidden shrink-0">
                    <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12"><Activity size={120} className="sm:w-[180px] sm:h-[180px]" /></div>
                    <div className="relative z-10 text-left">
                       <div className="flex items-center justify-between mb-6 sm:mb-8">
                          <div className="flex items-center gap-3 sm:gap-4">
                             <div className="p-2 sm:p-3 bg-blue-600 rounded-xl sm:rounded-2xl shadow-xl"><BarChart3 size={16} className="sm:w-5 sm:h-5" /></div>
                             <h4 className="text-sm sm:text-xl font-black uppercase tracking-tight">Workbench</h4>
                          </div>
                          <button onClick={() => setSelectedCampaignId(null)} className="lg:hidden p-2 text-white/50 hover:text-white transition-colors">
                             <X size={20} />
                          </button>
                       </div>
                       <h3 className="text-2xl sm:text-3xl font-black tracking-tighter leading-tight truncate">{selectedCampaign.name}</h3>
                       <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em] mt-1">{selectedCampaign.id}</p>
                    </div>
                 </div>

                 <div className="p-6 sm:p-8 lg:p-10 flex-1 overflow-y-auto space-y-8 sm:space-y-12 scrollbar-thin text-left">
                    <section className="space-y-4 sm:space-y-6">
                       <h5 className="text-[10px] sm:text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2 sm:gap-3">
                          <PieIcon size={14} className="sm:w-4 sm:h-4" /> Recovery Funnel
                       </h5>
                       <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="p-4 sm:p-6 bg-slate-50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100">
                             <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase mb-2 leading-none">Managed</p>
                             <p className="text-base sm:text-2xl font-black text-slate-900 leading-none truncate">{sym}{selectedCampaign.totalLiability.toLocaleString()}</p>
                          </div>
                          <div className="p-4 sm:p-6 bg-emerald-50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-emerald-100">
                             <p className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase mb-2 leading-none">Yield</p>
                             <p className="text-base sm:text-2xl font-black text-emerald-700 leading-none truncate">{sym}{selectedCampaign.recoveredAmount.toLocaleString()}</p>
                          </div>
                       </div>
                    </section>

                    <section className="space-y-6 sm:space-y-8">
                       <div className="flex items-center justify-between">
                          <h5 className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 sm:gap-3">
                             <Zap size={14} className="text-amber-500 sm:w-4 sm:h-4"/> Sequence
                          </h5>
                       </div>
                       <div className="relative pl-6 sm:pl-8 space-y-8 sm:space-y-10 text-left">
                          <div className="absolute left-3 sm:left-4 top-1 bottom-1 w-px bg-slate-100"></div>
                          {[
                             { day: 'T+0', action: 'Initial Wave', channel: 'SMS', status: 'Complete' },
                             { day: 'T+3', action: 'Digital Nudge', channel: 'Viber', status: 'In Progress' },
                             { day: 'T+7', action: 'Settlement', channel: 'AI Voice', status: 'Pending' }
                          ].map((step, i) => (
                             <div key={i} className="relative group animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i*100}ms` }}>
                                <div className={`absolute -left-[15px] sm:-left-[20px] top-1 w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full border-2 bg-white transition-all ${
                                   step.status === 'Complete' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                                }`}></div>
                                <div className="flex items-start gap-4 sm:gap-5">
                                   <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400 shrink-0">
                                      <FileText size={14} className="sm:w-4 sm:h-4" />
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-[11px] sm:text-xs font-black text-slate-900 leading-tight">{step.action}</p>
                                      <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase mt-1 leading-none">{step.day} • {step.channel}</p>
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                    </section>

                    <section className="pt-4 sm:pt-6 border-t border-slate-100">
                       <div className="bg-indigo-600 p-6 sm:p-8 rounded-[1.8rem] sm:rounded-[3rem] text-white relative overflow-hidden shadow-xl text-left">
                          <div className="absolute right-[-10px] top-[-10px] opacity-10 rotate-12"><Sparkles size={120} className="sm:w-[180px] sm:h-[180px]" /></div>
                          <div className="relative z-10">
                             <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                <Bot size={16} className="text-indigo-200 sm:w-5 sm:h-5" />
                                <h6 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Predictive Intel</h6>
                             </div>
                             <h5 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">Optimization Success: {selectedCampaign.aiSuccessPrediction}%</h5>
                             <p className="text-indigo-100 text-[10px] sm:text-xs font-medium leading-relaxed mt-3 sm:mt-4 italic opacity-80 line-clamp-3">
                                "The cluster is responding best to evening VIBER sessions. Shift remaining SMS budget."
                             </p>
                             <button className="w-full mt-6 sm:mt-8 py-3 sm:py-4 bg-white text-indigo-700 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Apply</button>
                          </div>
                       </div>
                    </section>
                 </div>

                 <div className="p-6 sm:p-8 lg:p-10 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2 sm:gap-3 shrink-0">
                    <button className="w-full py-3 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-black shadow-lg active:scale-95">Download Audit Trail</button>
                 </div>
              </div>
           ) : (
              <div className="bg-white p-10 sm:p-12 rounded-[2rem] sm:rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center opacity-40 grayscale group h-64 lg:h-[600px] transition-all">
                 <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] flex items-center justify-center mb-6 lg:mb-10 rotate-12 group-hover:rotate-0 transition-transform duration-700 shadow-inner">
                    <Target size={32} className="text-slate-200 sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
                 </div>
                 <h4 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">Workbench Idle</h4>
                 <p className="text-[10px] sm:text-sm font-medium mt-2 lg:mt-4 max-w-xs text-slate-400 italic">
                   Select a launched stream to inspect.
                 </p>
              </div>
           )}
        </div>
      </div>

      {/* PROVISIONING WIZARD - Responsive Overlay */}
      {showWizard && (
         <div className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500 overflow-hidden">
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] sm:rounded-[3.5rem] lg:rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col border border-white/20 h-[92vh] sm:h-[85vh]">
               {/* Wizard Header */}
               <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0 text-left">
                  <div className="flex items-center gap-4 sm:gap-6">
                     <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/30 shrink-0">
                        <Rocket size={20} className="sm:w-8 sm:h-8" />
                     </div>
                     <div className="min-w-0">
                        <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight truncate">Provision Wave</h3>
                        <p className="text-[7px] sm:text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-2">Recovery Cluster v5.0.2</p>
                     </div>
                  </div>
                  <button onClick={() => setShowWizard(false)} className="p-2 sm:p-4 bg-white rounded-lg sm:rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all shrink-0">
                     <X size={20} className="text-slate-400 sm:w-7 sm:h-7" />
                  </button>
               </div>

               {/* Wizard Steps Indicator */}
               <div className="px-6 sm:px-12 py-4 sm:py-6 border-b border-slate-100 flex gap-4 sm:gap-8 bg-white shrink-0 overflow-x-auto scrollbar-none">
                  {[
                     { step: 1, label: 'Segment', icon: Users },
                     { step: 2, label: 'Orchestrate', icon: Zap },
                     { step: 3, label: 'Legal', icon: ShieldCheck }
                  ].map(ph => (
                     <div key={ph.step} className={`flex items-center gap-2 sm:gap-4 transition-all shrink-0 ${wizardStep === ph.step ? 'text-blue-600' : wizardStep > ph.step ? 'text-emerald-500' : 'text-slate-300'}`}>
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border transition-all ${
                           wizardStep === ph.step ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 
                           wizardStep > ph.step ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 border-slate-100'
                        }`}>
                           {wizardStep > ph.step ? <CheckCheck size={12} className="sm:w-4 sm:h-4" /> : <ph.icon size={12} className="sm:w-4 sm:h-4" />}
                        </div>
                        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{ph.label}</span>
                     </div>
                  ))}
               </div>

               {/* Wizard Content Area */}
               <div className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-12 scrollbar-thin text-left bg-slate-50/20">
                  
                  {wizardStep === 1 && (
                    <div className="max-w-3xl mx-auto space-y-8 lg:space-y-10 animate-in slide-in-from-right-4 duration-500">
                       <div className="space-y-2 lg:space-y-3">
                          <label className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Wave Identity</label>
                          <input 
                            type="text" 
                            placeholder="NCR High-Liability Wave" 
                            value={newCampaignName}
                            onChange={(e) => setNewCampaignName(e.target.value)}
                            className="w-full px-6 py-4 sm:px-8 sm:py-5 bg-white border border-slate-200 rounded-xl sm:rounded-[1.8rem] text-slate-900 font-bold outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all text-sm sm:text-xl shadow-inner"
                          />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-4 sm:pt-6 border-t border-slate-100">
                          <div className="space-y-4 lg:space-y-6">
                             <h4 className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Users size={14} className="text-blue-600" /> Filters
                             </h4>
                             <div className="space-y-3 sm:space-y-4">
                                <div className="space-y-1.5 sm:space-y-2 text-left">
                                   <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase leading-none">Aging (DPD)</p>
                                   <div className="flex items-center gap-2 sm:gap-3">
                                      <input type="number" placeholder="Min" className="w-1/2 p-3 sm:p-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold" />
                                      <span className="text-slate-300">-</span>
                                      <input type="number" placeholder="Max" className="w-1/2 p-3 sm:p-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold" />
                                   </div>
                                </div>
                                <div className="space-y-1.5 sm:space-y-2 text-left">
                                   <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase leading-none">Min Balance</p>
                                   <div className="relative">
                                      <DollarSign className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                      <input type="number" placeholder="Amount..." className="w-full pl-8 sm:pl-10 pr-4 py-3 sm:py-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold" />
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-4 lg:space-y-6">
                             <h4 className="text-[10px] sm:text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <ShieldAlert size={14} className="text-rose-600" /> Risk Profiles
                             </h4>
                             <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                {['Low', 'Medium', 'High', 'Critical'].map(level => (
                                  <button key={level} className="p-3 sm:p-4 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all hover:border-blue-500 hover:text-blue-600 active:scale-95">
                                     {level}
                                  </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="max-w-3xl mx-auto space-y-8 lg:space-y-10 animate-in slide-in-from-right-4 duration-500">
                       <div className="flex items-center justify-between gap-4">
                          <h4 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Sequencing</h4>
                          <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-blue-100 active:scale-95 shrink-0">
                             <Sparkles size={10} className="sm:w-3 sm:h-3"/> <span className="hidden xs:inline">AI Suggest</span><span className="xs:hidden">AI</span>
                          </button>
                       </div>

                       <div className="space-y-3 sm:space-y-4">
                          {[1, 2].map((rule, idx) => (
                             <div key={idx} className="p-4 sm:p-6 lg:p-8 bg-white border border-slate-100 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                                   <div className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0">
                                      <Zap size={18} className="sm:w-6 sm:h-6" />
                                   </div>
                                   <div className="text-left min-w-0">
                                      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Step 0{idx + 1}</p>
                                      <div className="flex items-center gap-2 sm:gap-4 truncate">
                                         <p className="text-sm sm:text-lg font-black text-slate-900">T+{idx * 3}d</p>
                                         <ArrowRight size={10} className="text-slate-300 shrink-0" />
                                         <p className="text-sm sm:text-lg font-black text-blue-600 truncate">SMS Blast</p>
                                      </div>
                                   </div>
                                </div>
                                <button className="p-2 sm:p-3 bg-slate-50 text-slate-300 rounded-lg sm:rounded-xl hover:text-rose-500 transition-all shrink-0 active:scale-90"><X size={16} className="sm:w-5 sm:h-5" /></button>
                             </div>
                          ))}
                          <button className="w-full py-4 sm:py-6 border-4 border-dashed border-slate-100 rounded-[1.5rem] sm:rounded-[2.5rem] text-slate-400 hover:border-blue-200 hover:text-blue-600 transition-all flex items-center justify-center gap-2 sm:gap-3 group active:scale-98">
                             <Plus size={20} className="sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-500" />
                             <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest">Append Automated Action</span>
                          </button>
                       </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="max-w-3xl mx-auto space-y-8 lg:space-y-10 animate-in slide-in-from-right-4 duration-500">
                       <div className="flex items-center gap-4 sm:gap-6 text-left">
                          <div className="p-3 sm:p-4 bg-emerald-50 rounded-xl sm:rounded-2xl text-emerald-600 shadow-inner shrink-0"><ShieldCheck size={24} className="sm:w-8 sm:h-8" /></div>
                          <div>
                             <h4 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">Compliance Audit</h4>
                             <p className="text-[10px] sm:text-sm text-slate-500 font-medium">Wave parameters validation.</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                          {[
                             { label: 'FDCPA Compliance', icon: Gavel },
                             { label: 'Contact Guard', icon: Clock },
                             { label: 'Data Encryption', icon: Lock },
                             { label: 'Auto-Audit Log', icon: History }
                          ].map((check, i) => {
                             // Fixed: Capitalized variable alias for JSX component
                             const Icon = check.icon;
                             return (
                               <div key={i} className="p-4 sm:p-6 bg-white border border-slate-200 rounded-xl sm:rounded-[2rem] flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                     <div className="p-2 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all text-slate-400 shrink-0">
                                        <Icon size={14} />
                                     </div>
                                     <span className="text-[10px] sm:text-xs font-black text-slate-900 truncate">{check.label}</span>
                                  </div>
                                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 sm:w-5 sm:h-5" />
                               </div>
                             );
                          })}
                       </div>

                       <div className="p-6 sm:p-8 lg:p-10 bg-slate-900 rounded-[1.8rem] sm:rounded-[3rem] text-white flex flex-col gap-4 sm:gap-6 relative overflow-hidden text-left">
                          <div className="absolute top-0 right-0 p-6 opacity-5 hidden sm:block"><ShieldAlert size={100} className="lg:w-[140px] lg:h-[140px]" /></div>
                          <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                             <Tag size={16} className="text-blue-400 sm:w-5 sm:h-5" />
                             <h5 className="font-black text-sm sm:text-lg">Escalation Rules</h5>
                          </div>
                          <p className="text-[11px] sm:text-sm text-slate-400 font-bold leading-relaxed relative z-10 italic">
                             "Transfer cases if no engagement within 14 days."
                          </p>
                          <div className="flex gap-2 sm:gap-4 relative z-10">
                             <button className="px-4 sm:px-6 py-2 bg-white/10 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase hover:bg-white/20 transition-all active:scale-95">Enable Handover</button>
                             <button className="px-4 sm:px-6 py-2 bg-white/10 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] font-black uppercase hover:bg-white/20 transition-all active:scale-95">Setup Legal</button>
                          </div>
                       </div>
                    </div>
                  )}

               </div>

               {/* Wizard Footer Navigation */}
               <div className="p-6 sm:p-10 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center shrink-0 gap-6 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-4 text-left w-full sm:w-auto">
                     <div>
                        <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Targets</p>
                        <p className="text-lg sm:text-xl font-black text-slate-900 leading-none">1,248 Accounts</p>
                     </div>
                  </div>
                  <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
                     {wizardStep > 1 && (
                       <button 
                        onClick={() => setWizardStep(prev => prev - 1)}
                        className="flex-1 sm:flex-none px-6 sm:px-10 py-3.5 sm:py-5 bg-white border border-slate-200 text-slate-600 rounded-xl sm:rounded-[1.8rem] font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95 flex items-center justify-center gap-2"
                       >
                          <ChevronLeft size={16} className="sm:w-5 sm:h-5" /> <span className="xs:inline">Back</span>
                       </button>
                     )}
                     <button 
                       onClick={() => {
                          if (wizardStep < 3) setWizardStep(prev => prev + 1);
                          else handleCreateCampaign();
                       }}
                       className="flex-[2] sm:flex-none px-8 sm:px-12 py-3.5 sm:py-5 bg-blue-600 text-white rounded-xl sm:rounded-[1.8rem] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 flex items-center justify-center gap-2 sm:gap-4"
                     >
                        <span>{wizardStep === 3 ? 'Ignite Wave' : 'Next Phase'}</span>
                        {wizardStep < 3 && <ArrowRight size={16} className="sm:w-5 sm:h-5" />}
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default CampaignManager;
