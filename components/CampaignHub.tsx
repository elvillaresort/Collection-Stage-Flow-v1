import * as React from 'react';
import { 
  Building2, 
  ChevronRight, 
  LogOut, 
  Search, 
  ShieldCheck, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Briefcase,
  Users,
  Database,
  Fingerprint,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { User, ClientCampaign, SystemSettings } from '../types';
import PCCSLogo from './PCCSLogo';

interface CampaignHubProps {
  user: User;
  onSelectCampaign: (campaign: ClientCampaign) => void;
  campaigns: ClientCampaign[];
  onLogout: () => void;
  settings: SystemSettings;
  onBack?: () => void;
}

const CampaignHub: React.FC<CampaignHubProps> = ({ user, onSelectCampaign, campaigns, onLogout, settings, onBack }) => {
  const [search, setSearch] = React.useState('');
  const [initializingNode, setInitializingNode] = React.useState<string | null>(null);
  const sym = settings.localization.currencySymbol;

  const filteredCampaigns = React.useMemo(() => {
    return campaigns.filter(c => {
      const isAuthorized = user.role === 'ADMIN' || (user.assignedCampaignIds || []).includes(c.id);
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      return isAuthorized && matchesSearch;
    });
  }, [campaigns, user, search]);

  const handleEntry = async (campaign: ClientCampaign) => {
    setInitializingNode(campaign.id);
    // Secure Handshake Simulation
    await new Promise(r => setTimeout(r, 1800));
    onSelectCampaign(campaign);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter text-slate-900">
      <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all mr-2">
               <ChevronLeft size={20} />
            </button>
          )}
          <PCCSLogo size={48} />
          <div className="text-left">
             <h1 className="text-2xl font-black tracking-tight leading-none text-slate-900">PCCS Secure Gateway</h1>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Master Node Cluster Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 pr-8 border-r border-slate-100">
             <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-slate-100">
                <img src={user.avatar} className="w-full h-full object-cover" alt="" />
             </div>
             <div className="text-left">
                <p className="text-sm font-black text-slate-900">{user.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.role}</p>
                </div>
             </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-rose-600 transition-all font-black text-[11px] uppercase tracking-[0.1em]">
            <LogOut size={18} /> Kill Session
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-12 space-y-12 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
           <div className="text-left max-w-2xl">
              <h2 className="text-5xl font-black tracking-tight text-slate-950 leading-none">Campaign Authorization</h2>
              <p className="mt-6 text-slate-500 text-lg font-medium leading-relaxed italic opacity-80">
                 Select an active multi-tenant environment. Entry creates a cryptographically isolated session dedicated to that specific legal recovery track.
              </p>
           </div>
           <div className="relative w-full md:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Find Hub Node..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-200 rounded-[2.5rem] text-sm font-black shadow-xl outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 transition-all"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
           {filteredCampaigns.map(client => (
             <div 
               key={client.id}
               className={`group bg-white rounded-[3.5rem] border-2 transition-all flex flex-col text-left relative overflow-hidden ${
                 initializingNode === client.id ? 'border-blue-600 shadow-2xl scale-105' : 'border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-2xl hover:-translate-y-2'
               }`}
             >
                {initializingNode === client.id && (
                   <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-300">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                         <Loader2 size={64} className="text-blue-600 animate-spin absolute" />
                         <Fingerprint size={32} className="text-blue-600 animate-pulse" />
                      </div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Bridging Protocol...</p>
                   </div>
                )}

                <div className="p-10 flex flex-col flex-1">
                   <div className="flex justify-between items-start mb-10">
                      <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-4xl border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                         {client.logo}
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                            {client.status}
                         </span>
                         <p className="text-[9px] font-black text-slate-300 mt-3 font-mono">NODE_HASH_{client.id.split('-')[1].toUpperCase()}</p>
                      </div>
                   </div>

                   <div className="flex-1 space-y-3">
                      <h3 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight tracking-tight">{client.name}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Database size={12} className="text-blue-400" /> Isolated Registry Cluster
                      </p>
                   </div>

                   <div className="mt-10 pt-10 border-t border-slate-50 grid grid-cols-2 gap-8 mb-10">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Asset Value</p>
                         <p className="text-2xl font-black text-slate-900 leading-none">{sym}{(client.totalExposure / 1000).toFixed(0)}k</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cases</p>
                         <p className="text-2xl font-black text-slate-900 leading-none">{client.activeCases.toLocaleString()}</p>
                      </div>
                   </div>

                   <button 
                     onClick={() => handleEntry(client)}
                     disabled={initializingNode !== null}
                     className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl group-hover:bg-blue-600 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                   >
                      Secure Entry
                      <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                   </button>
                </div>
             </div>
           ))}

           {user.role === 'ADMIN' && (
             <div className="bg-slate-100/50 border-4 border-dashed border-slate-200 rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100 hover:bg-white hover:border-blue-400 transition-all cursor-default">
                <div className="w-20 h-20 rounded-[2.5rem] bg-white flex items-center justify-center text-slate-300 mb-8 shadow-sm">
                   <Building2 size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Decommissioned Nodes</h3>
                <p className="text-sm text-slate-500 font-medium mt-3 max-w-[240px] leading-relaxed">
                   Enter Governance settings to re-initialize archived client clusters.
                </p>
             </div>
           )}
        </div>
      </main>

      <footer className="p-10 border-t border-slate-200 bg-white">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-10">
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Aegis Connectivity: Optimal</span>
               </div>
               <div className="flex items-center gap-3">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">TLS 1.3 Encryption Active</span>
               </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">PCCS ENTERPRISE SUITE v4.5 • SEAMLESS MULTI-TENANCY</p>
         </div>
      </footer>
    </div>
  );
};

export default CampaignHub;