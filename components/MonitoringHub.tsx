import * as React from 'react';
import { 
  Radar, 
  Monitor, 
  Activity, 
  Zap, 
  ShieldAlert, 
  User, 
  Eye, 
  MousePointer2, 
  Terminal, 
  Lock, 
  X, 
  ChevronRight, 
  ArrowUpRight, 
  ShieldCheck, 
  History, 
  Clock, 
  Signal, 
  Smartphone, 
  Globe,
  Radio,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { User as UserType } from '../types';

const { useState, useEffect, useMemo } = React;

interface MonitoringHubProps {
  systemUsers: UserType[];
  activeUserIds: Set<string>;
}

// Added MirrorPreviewProps interface and moved component outside MonitoringHub to fix key prop error
interface MirrorPreviewProps {
  user: UserType;
  isOnline: boolean;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
}

// Defined MirrorPreview as a standalone component to properly handle React key and standard props
const MirrorPreview: React.FC<MirrorPreviewProps> = ({ user, isOnline, isSelected, onSelect }) => {
  return (
    <button 
      onClick={() => onSelect(user.id)}
      className={`bg-white rounded-[2rem] border-2 transition-all p-6 text-left group overflow-hidden relative ${
        isSelected ? 'border-blue-600 shadow-2xl' : 'border-slate-100 hover:border-blue-200 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4 mb-6 relative z-10">
         <div className="relative">
            <img src={user.avatar} className="w-12 h-12 rounded-2xl object-cover border border-slate-100" alt="" />
            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
         </div>
         <div>
            <h4 className="text-sm font-black text-slate-900 truncate w-32">{user.name}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{user.role.replace(/_/g, ' ')}</p>
         </div>
      </div>

      <div className="bg-slate-950 rounded-xl aspect-video relative overflow-hidden group-hover:scale-105 transition-transform duration-500 border border-white/5">
         <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
         
         {isOnline ? (
           <div className="absolute inset-0 flex flex-col p-2 gap-1 scale-[0.4] origin-top-left">
              <div className="h-4 w-full bg-blue-600/40 rounded"></div>
              <div className="flex gap-1 h-20">
                 <div className="w-10 bg-white/10 rounded"></div>
                 <div className="flex-1 bg-white/5 rounded p-2 flex flex-col gap-1">
                    <div className="h-2 w-1/2 bg-blue-400/20 rounded"></div>
                    <div className="h-1 w-full bg-white/5 rounded"></div>
                    <div className="h-1 w-full bg-white/5 rounded"></div>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                       <div className="h-10 bg-blue-500/20 rounded"></div>
                       <div className="h-10 bg-emerald-500/20 rounded"></div>
                    </div>
                 </div>
              </div>
           </div>
         ) : (
           <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Session Inactive</p>
           </div>
         )}

         <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-[10%] animate-[scan_3s_linear_infinite]"></div>
      </div>

      <div className="mt-4 flex items-center justify-between">
         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Clock size={10} /> 12m Activity
         </span>
         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye size={12} className="text-blue-600" />
            <span className="text-[9px] font-black text-blue-600 uppercase">Observe</span>
         </div>
      </div>
    </button>
  );
};

const MonitoringHub: React.FC<MonitoringHubProps> = ({ systemUsers, activeUserIds }) => {
  const [selectedMonitorId, setSelectedMonitorId] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<string[]>([]);
  const [simulatedMouse, setSimulatedMouse] = useState({ x: 50, y: 50 });

  const activeUsers = useMemo(() => {
    // Only mirror non-admins for privacy/logic reasons
    return systemUsers.filter(u => u.role !== 'ADMIN');
  }, [systemUsers]);

  const selectedUser = useMemo(() => 
    activeUsers.find(u => u.id === selectedMonitorId), 
    [selectedMonitorId, activeUsers]
  );

  // Simulate live actions
  useEffect(() => {
    if (!selectedMonitorId) return;

    const interval = setInterval(() => {
      const actions = [
        "Focused Case L-9021",
        "Opened Communication Hub",
        "Drafting SMS nudge",
        "Filtering Portfolio by DPD",
        "Reviewing Legal Notice",
        "Syncing Field Visit Evidence",
        "Querying OSINT Cluster"
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setTelemetry(prev => [
        `[${new Date().toLocaleTimeString()}] ${randomAction}`,
        ...prev.slice(0, 5)
      ]);

      // Move "ghost mouse"
      setSimulatedMouse({
        x: Math.random() * 100,
        y: Math.random() * 100
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedMonitorId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl border-4 border-slate-800">
        <div className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12"><Radar size={320} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="max-w-2xl">
              <div className="flex items-center gap-4 mb-4">
                 <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-pulse"><Monitor size={24}/></div>
                 <h2 className="text-3xl font-black tracking-tight">Nexus Live Mirror</h2>
              </div>
              <p className="text-slate-400 font-bold leading-relaxed">
                Superadmin Command Center. Observe active recovery sessions in real-time, monitor organizational compliance, and provide surgical intervention when required.
              </p>
           </div>
           <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shrink-0 min-w-[280px]">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 text-center">NOC Cluster Stats</p>
              <div className="space-y-3">
                 <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase">Active Streams</span><span className="text-xs font-black text-emerald-400 uppercase">{activeUserIds.size} Units</span></div>
                 <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase">Observer Mode</span><span className="text-xs font-black text-blue-400 uppercase">AES-MIRROR-V2</span></div>
                 <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase">Mirror Latency</span><span className="text-xs font-black text-blue-400 uppercase">84ms</span></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Mirror Grid */}
        <div className="xl:col-span-8 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Radio size={14} className="text-blue-600" /> Organizational Live Streams
              </h3>
              <div className="flex gap-2">
                 <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 uppercase">Grid: Auto</span>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeUsers.map(user => (
                <MirrorPreview 
                  key={user.id} 
                  user={user} 
                  isOnline={activeUserIds.has(user.id)}
                  isSelected={selectedMonitorId === user.id}
                  onSelect={setSelectedMonitorId}
                />
              ))}
           </div>
        </div>

        {/* Selected Mirror Inspection */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           {selectedUser ? (
             <div className="bg-slate-950 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col h-full sticky top-8 animate-in zoom-in-95 duration-500 border border-white/10">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10"><Monitor size={20} className="text-blue-400" /></div>
                      <div className="text-left">
                         <h3 className="text-sm font-black uppercase tracking-widest">{selectedUser.name}</h3>
                         <p className="text-[9px] font-bold text-slate-500 uppercase">Session: Live Link Mirror</p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedMonitorId(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X size={20}/></button>
                </div>

                {/* High Fidelity Mirrored View Simulation */}
                <div className="flex-1 bg-[#0f172a] rounded-[2rem] border-2 border-blue-600/30 relative overflow-hidden mb-8 group/mirror">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')] opacity-10 pointer-events-none"></div>
                   
                   {/* Mirrored Mouse */}
                   <div 
                    className="absolute z-50 pointer-events-none transition-all duration-1000 ease-in-out"
                    style={{ left: `${simulatedMouse.x}%`, top: `${simulatedMouse.y}%` }}
                   >
                      <MousePointer2 size={16} className="text-blue-400 drop-shadow-lg" />
                      <div className="absolute -bottom-4 -right-4 bg-blue-600/20 rounded-full w-8 h-8 animate-ping"></div>
                   </div>

                   {/* Reconstructed Screen Elements */}
                   <div className="p-6 space-y-6 blur-[1px] group-hover/mirror:blur-none transition-all duration-1000 opacity-60">
                      <div className="h-6 w-full bg-white/10 rounded-lg"></div>
                      <div className="grid grid-cols-4 gap-3">
                         <div className="h-16 bg-white/5 rounded-2xl border border-white/5"></div>
                         <div className="h-16 bg-white/5 rounded-2xl border border-white/5"></div>
                         <div className="h-16 bg-white/5 rounded-2xl border border-white/5"></div>
                         <div className="h-16 bg-white/5 rounded-2xl border border-white/5"></div>
                      </div>
                      <div className="h-48 bg-blue-600/5 rounded-[2rem] border border-blue-500/20 flex items-center justify-center relative">
                         <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                         <Smartphone size={40} className="text-blue-500/20" />
                      </div>
                   </div>

                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                   <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Stream Synchronized</span>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Full Mirror View</button>
                   </div>
                </div>

                <div className="space-y-6 text-left">
                   <div className="space-y-3">
                      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2"><Activity size={12} className="text-blue-400" /> Activity Telemetry</h4>
                      <div className="space-y-2">
                         {telemetry.map((log, i) => (
                           <div key={i} className="flex gap-4 p-3 bg-white/5 border border-white/5 rounded-xl animate-in slide-in-from-right-4">
                              <Terminal size={12} className="text-slate-600 mt-0.5 shrink-0" />
                              <p className="text-[10px] font-mono text-slate-400 leading-tight">{log}</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                      <button className="py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex flex-col items-center gap-2">
                         <Lock size={16} /> Force Lockdown
                      </button>
                      <button className="py-4 bg-blue-600 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-500 transition-all flex flex-col items-center gap-2">
                         <Zap size={16} /> Intervene
                      </button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-12 h-full flex flex-col items-center justify-center text-center opacity-30">
                <Radar size={64} className="mb-6 text-slate-200" />
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Observer Standby</h3>
                <p className="text-sm font-medium mt-2 max-w-xs">Select an active node to establish a Live Mirror link.</p>
             </div>
           )}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(1000%); }
        }
        .animate-spin-slow {
           animation: spin 15s linear infinite;
        }
        @keyframes spin {
           from { transform: rotate(0deg); }
           to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MonitoringHub;