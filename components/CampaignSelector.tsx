
import React, { useState } from 'react';
import { Target, Users, TrendingUp, ChevronRight, Search, LayoutGrid, List, ShieldCheck, Zap, Globe, Lock } from 'lucide-react';
import { ClientCampaign, User } from '../types';

interface CampaignSelectorProps {
    campaigns: ClientCampaign[];
    user: User;
    onSelect: (campaign: ClientCampaign) => void;
}

const CampaignSelector: React.FC<CampaignSelectorProps> = ({ campaigns, user, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filter campaigns assigned to user (or all for admins)
    const isPrivileged = ['SUPER_ADMIN', 'ADMIN', 'HEAD_OF_OPERATIONS'].includes(user.role);
    const userCampaigns = isPrivileged
        ? campaigns
        : campaigns.filter(c => user.assignedCampaignIds?.includes(c.id));

    const filteredCampaigns = userCampaigns.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 lg:p-20 relative overflow-hidden flex flex-col">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                <div className="text-left">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Target size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] leading-none mb-1">Mission Control</p>
                            <h1 className="text-4xl font-black tracking-tight">Campaign Selection</h1>
                        </div>
                    </div>
                    <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed italic">
                        Welcome, <span className="text-white font-bold">{user.name}</span>.
                        Initialize your operational workspace by selecting an allocated campaign node.
                    </p>
                </div>

                <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Filter nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent pl-12 pr-4 py-3 text-sm font-bold outline-none placeholder:text-slate-600"
                        />
                    </div>
                    <div className="flex gap-1 ml-4 border-l border-white/10 pl-4">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            title="Grid Mode"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            title="List Mode"
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="relative z-10 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                {filteredCampaigns.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredCampaigns.map(campaign => (
                                <button
                                    key={campaign.id}
                                    onClick={() => onSelect(campaign)}
                                    className="bg-white/5 border border-white/10 rounded-[3rem] p-10 text-left group hover:bg-white/10 hover:border-blue-500/50 transition-all shadow-2xl relative overflow-hidden flex flex-col h-full"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-600/5 rounded-bl-[5rem] group-hover:bg-blue-500/10 transition-all"></div>

                                    <div className="flex justify-between items-start mb-10">
                                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center p-3 shadow-xl group-hover:scale-110 transition-transform">
                                            {campaign.logo ? (
                                                <img src={campaign.logo} alt={campaign.name} className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <Globe size={32} className="text-slate-900" />
                                            )}
                                        </div>
                                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            {campaign.status || 'Active'}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-black mb-2 leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight">{campaign.name}</h3>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Node Identifier: {campaign.id}</p>

                                    <div className="grid grid-cols-2 gap-4 mt-auto">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm group-hover:border-white/10 transition-all">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Exposure</p>
                                            <p className="text-lg font-black font-mono">₱{(campaign.totalExposure / 1000000).toFixed(1)}M</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm group-hover:border-white/10 transition-all">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Targets</p>
                                            <p className="text-lg font-black font-mono">{campaign.activeCases}+</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                                            Initialize session
                                        </span>
                                        <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-blue-600 flex items-center justify-center transition-all">
                                            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredCampaigns.map(campaign => (
                                <button
                                    key={campaign.id}
                                    onClick={() => onSelect(campaign)}
                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-8 text-left hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform">
                                        {campaign.logo ? (
                                            <img src={campaign.logo} alt={campaign.name} className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <Globe size={24} className="text-slate-900" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-blue-400 transition-colors">{campaign.name}</h3>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">ID: {campaign.id}</p>
                                    </div>
                                    <div className="hidden lg:grid grid-cols-2 gap-12 text-center px-12 border-x border-white/10">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Exposure</p>
                                            <p className="text-sm font-black font-mono">₱{(campaign.totalExposure / 1000).toFixed(1)}K</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Targets</p>
                                            <p className="text-sm font-black font-mono">{campaign.activeCases}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-right shrink-0">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">{campaign.status || 'Active'}</span>
                                        <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="text-center py-40 bg-white/5 rounded-[4rem] border border-dashed border-white/10">
                        <Lock size={64} className="mx-auto text-slate-700 mb-8" />
                        <h3 className="text-2xl font-black mb-2">Access Restricted</h3>
                        <p className="text-slate-500 font-bold max-w-sm mx-auto uppercase tracking-widest text-[10px] leading-relaxed">
                            No allocated campaigns found for your session credentials.
                            Please contact command control for node assignment.
                        </p>
                    </div>
                )}
            </div>

            <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-600 p-0.5">
                        <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                    </div>
                    <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-tighter">{user.name}</p>
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{user.role}</p>
                    </div>
                </div>
                <div className="flex gap-8">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">TLS 1.3 Secure Session</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Aegis Isolation Active</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CampaignSelector;
