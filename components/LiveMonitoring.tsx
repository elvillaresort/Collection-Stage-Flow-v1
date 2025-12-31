import React, { useState, useEffect, useMemo } from 'react';
import {
    Radar, Eye, Users, Activity, Phone, MessageSquare, Clock, TrendingUp, TrendingDown,
    Circle, Monitor, Maximize2, X, Play, Pause, Volume2, VolumeX, RefreshCw, Filter,
    Search, AlertCircle, CheckCircle2, PhoneCall, Mail, Smartphone, User, MapPin,
    BarChart3, Zap, Target, Award, AlertTriangle, Info, Settings, Grid, List
} from 'lucide-react';
import { User as UserType, SystemSettings, Activity as ActivityType, Debtor } from '../types';

interface AgentSession {
    id: string;
    agentId: string;
    agentName: string;
    avatar: string;
    status: 'active' | 'idle' | 'break' | 'offline';
    currentActivity: string;
    currentDebtor?: {
        name: string;
        loanId: string;
        amountDue: number;
    };
    sessionStart: string;
    lastAction: string;
    metrics: {
        callsMade: number;
        smsSent: number;
        emailsSent: number;
        ptpSecured: number;
        paymentsCollected: number;
        totalRecovered: number;
    };
    screenPreview?: string; // Simulated screen preview
    location?: string;
}

interface LiveMonitoringProps {
    user: UserType;
    settings: SystemSettings;
    systemUsers: UserType[];
    portfolio: Debtor[];
    activities: ActivityType[];
}

const DUMMY_SESSIONS: AgentSession[] = [
    {
        id: 'SES-001',
        agentId: 'USR-003',
        agentName: 'Maria Santos',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        status: 'active',
        currentActivity: 'On call with debtor',
        currentDebtor: {
            name: 'Juan Dela Cruz',
            loanId: 'LN-2024-001',
            amountDue: 45000
        },
        sessionStart: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        lastAction: '2 seconds ago',
        metrics: {
            callsMade: 24,
            smsSent: 18,
            emailsSent: 5,
            ptpSecured: 8,
            paymentsCollected: 3,
            totalRecovered: 125000
        },
        screenPreview: 'account-profile',
        location: 'Manila Office'
    },
    {
        id: 'SES-002',
        agentId: 'USR-004',
        agentName: 'Pedro Reyes',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
        status: 'active',
        currentActivity: 'Sending SMS',
        currentDebtor: {
            name: 'Ana Garcia',
            loanId: 'LN-2024-002',
            amountDue: 32000
        },
        sessionStart: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
        lastAction: '15 seconds ago',
        metrics: {
            callsMade: 19,
            smsSent: 32,
            emailsSent: 8,
            ptpSecured: 6,
            paymentsCollected: 2,
            totalRecovered: 89000
        },
        screenPreview: 'messaging-hub',
        location: 'Quezon City Office'
    },
    {
        id: 'SES-003',
        agentId: 'USR-005',
        agentName: 'Lisa Fernandez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
        status: 'idle',
        currentActivity: 'Reviewing accounts',
        sessionStart: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        lastAction: '5 minutes ago',
        metrics: {
            callsMade: 31,
            smsSent: 25,
            emailsSent: 12,
            ptpSecured: 11,
            paymentsCollected: 5,
            totalRecovered: 178000
        },
        screenPreview: 'portfolio-list',
        location: 'Makati Office'
    },
    {
        id: 'SES-004',
        agentId: 'USR-006',
        agentName: 'Carlos Mendoza',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
        status: 'break',
        currentActivity: 'On break',
        sessionStart: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        lastAction: '12 minutes ago',
        metrics: {
            callsMade: 12,
            smsSent: 9,
            emailsSent: 3,
            ptpSecured: 4,
            paymentsCollected: 1,
            totalRecovered: 42000
        },
        location: 'Cebu Office'
    }
];

const LiveMonitoring: React.FC<LiveMonitoringProps> = ({ user, settings, systemUsers, portfolio, activities }) => {
    const [sessions, setSessions] = useState<AgentSession[]>(DUMMY_SESSIONS);
    const [selectedSession, setSelectedSession] = useState<AgentSession | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'idle' | 'break'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [showScreenView, setShowScreenView] = useState(false);

    const sym = settings.localization.currencySymbol;

    // Simulate real-time updates
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            setSessions(prev => prev.map(session => ({
                ...session,
                lastAction: `${Math.floor(Math.random() * 60)} seconds ago`,
                metrics: {
                    ...session.metrics,
                    callsMade: session.status === 'active' ? session.metrics.callsMade + (Math.random() > 0.7 ? 1 : 0) : session.metrics.callsMade,
                    smsSent: session.status === 'active' ? session.metrics.smsSent + (Math.random() > 0.8 ? 1 : 0) : session.metrics.smsSent
                }
            })));
        }, 5000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    const filteredSessions = useMemo(() => {
        return sessions.filter(s => {
            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
            const matchesSearch = s.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.currentActivity.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [sessions, statusFilter, searchQuery]);

    const stats = useMemo(() => {
        const active = sessions.filter(s => s.status === 'active');
        return {
            totalAgents: sessions.length,
            activeAgents: active.length,
            totalCalls: sessions.reduce((sum, s) => sum + s.metrics.callsMade, 0),
            totalRecovered: sessions.reduce((sum, s) => sum + s.metrics.totalRecovered, 0),
            avgPTP: sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.metrics.ptpSecured, 0) / sessions.length : 0
        };
    }, [sessions]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500';
            case 'idle': return 'bg-amber-500';
            case 'break': return 'bg-blue-500';
            case 'offline': return 'bg-slate-400';
            default: return 'bg-slate-400';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'idle': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'break': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'offline': return 'bg-slate-50 text-slate-600 border-slate-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getScreenPreview = (preview?: string) => {
        // Simulated screen previews
        const previews: Record<string, { title: string; color: string }> = {
            'account-profile': { title: 'Account Profile View', color: 'from-blue-500 to-purple-500' },
            'messaging-hub': { title: 'Messaging Hub', color: 'from-emerald-500 to-teal-500' },
            'portfolio-list': { title: 'Portfolio List', color: 'from-amber-500 to-orange-500' },
            'dashboard': { title: 'Dashboard', color: 'from-rose-500 to-pink-500' }
        };

        return previews[preview || 'dashboard'] || previews.dashboard;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Radar size={28} className="text-blue-600" />
                        Live Agent Monitoring
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 text-sm">
                        Real-time agent activity tracking and screen monitoring
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2 ${autoRefresh ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                    >
                        {autoRefresh ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                        Auto Refresh
                    </button>
                    <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                                }`}
                        >
                            <Grid size={14} className="inline mr-2" />
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                                }`}
                        >
                            <List size={14} className="inline mr-2" />
                            List
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total Agents', value: stats.totalAgents, icon: Users, color: 'slate', trend: null },
                    { label: 'Active Now', value: stats.activeAgents, icon: Activity, color: 'emerald', trend: '+2' },
                    { label: 'Total Calls', value: stats.totalCalls, icon: Phone, color: 'blue', trend: '+12' },
                    { label: 'Recovered Today', value: `${sym}${(stats.totalRecovered / 1000).toFixed(0)}k`, icon: TrendingUp, color: 'purple', trend: '+8%' },
                    { label: 'Avg PTP Rate', value: `${stats.avgPTP.toFixed(1)}`, icon: Target, color: 'amber', trend: '+1.2' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                        <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                            {stat.trend && (
                                <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                                    <TrendingUp size={12} />
                                    {stat.trend}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search agents or activities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <select
                        title="Filter by status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="idle">Idle</option>
                        <option value="break">On Break</option>
                    </select>
                </div>
            </div>

            {/* Agent Sessions */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredSessions.map(session => {
                    const screenPreview = getScreenPreview(session.screenPreview);
                    return (
                        <div
                            key={session.id}
                            className="bg-white rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
                        >
                            {/* Agent Header */}
                            <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img src={session.avatar} alt={session.agentName} className="w-14 h-14 rounded-2xl border-2 border-white shadow-lg" />
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(session.status)} rounded-full border-2 border-white`}></div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">{session.agentName}</h3>
                                            <p className="text-xs text-slate-500 font-bold">{session.location}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(session.status)}`}>
                                        {session.status}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                                        <Activity size={14} className="text-blue-600" />
                                        {session.currentActivity}
                                    </div>
                                    {session.currentDebtor && (
                                        <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                                            <p className="text-xs font-black text-blue-900">{session.currentDebtor.name}</p>
                                            <p className="text-[10px] text-blue-600 font-bold mt-1">
                                                {session.currentDebtor.loanId} • {sym}{session.currentDebtor.amountDue.toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Screen Preview */}
                            <div
                                onClick={() => { setSelectedSession(session); setShowScreenView(true); }}
                                className="relative h-48 bg-gradient-to-br cursor-pointer group/screen overflow-hidden"
                                style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${screenPreview.color} opacity-90`}></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-white">
                                        <Monitor size={48} className="mx-auto mb-3 opacity-80" />
                                        <p className="text-sm font-black">{screenPreview.title}</p>
                                        <p className="text-xs font-medium opacity-80 mt-1">Last update: {session.lastAction}</p>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-slate-900/0 group-hover/screen:bg-slate-900/20 transition-all flex items-center justify-center opacity-0 group-hover/screen:opacity-100">
                                    <div className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl">
                                        <Maximize2 size={24} className="text-slate-900" />
                                    </div>
                                </div>
                            </div>

                            {/* Metrics */}
                            <div className="p-6 grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl w-fit mx-auto mb-2">
                                        <Phone size={16} />
                                    </div>
                                    <p className="text-xl font-black text-slate-900">{session.metrics.callsMade}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calls</p>
                                </div>
                                <div className="text-center">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl w-fit mx-auto mb-2">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <p className="text-xl font-black text-slate-900">{session.metrics.ptpSecured}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">PTPs</p>
                                </div>
                                <div className="text-center">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl w-fit mx-auto mb-2">
                                        <TrendingUp size={16} />
                                    </div>
                                    <p className="text-xl font-black text-slate-900">{sym}{(session.metrics.totalRecovered / 1000).toFixed(0)}k</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recovered</p>
                                </div>
                            </div>

                            {/* Session Info */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                                <span className="flex items-center gap-2">
                                    <Clock size={12} />
                                    Session: {new Date(session.sessionStart).toLocaleTimeString()}
                                </span>
                                <button
                                    onClick={() => { setSelectedSession(session); setShowScreenView(true); }}
                                    className="px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1"
                                >
                                    <Eye size={10} />
                                    View Screen
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Screen View Modal */}
            {showScreenView && selectedSession && (
                <div className="fixed inset-0 z-[5000] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-7xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[95vh]">
                        <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={selectedSession.avatar} alt={selectedSession.agentName} className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg" />
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(selectedSession.status)} rounded-full border-2 border-white`}></div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">{selectedSession.agentName}</h3>
                                    <p className="text-sm text-slate-500 font-bold mt-1">{selectedSession.currentActivity}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-500">Live View</span>
                                <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
                                <button title="Close" onClick={() => setShowScreenView(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-hidden bg-slate-900 p-8">
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-4 border-slate-700 shadow-2xl flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Monitor size={96} className="mx-auto mb-6 opacity-50" />
                                    <h4 className="text-3xl font-black mb-3">Live Screen Monitoring</h4>
                                    <p className="text-lg font-medium opacity-80 mb-6">
                                        Viewing: {getScreenPreview(selectedSession.screenPreview).title}
                                    </p>
                                    <div className="p-6 bg-blue-500/20 backdrop-blur-sm rounded-3xl border border-blue-400/30 max-w-2xl mx-auto">
                                        <Info size={24} className="mx-auto mb-3" />
                                        <p className="text-sm font-medium leading-relaxed">
                                            Real-time screen sharing requires WebRTC implementation. This is a simulated preview showing
                                            the agent's current module: <span className="font-black">{getScreenPreview(selectedSession.screenPreview).title}</span>
                                        </p>
                                    </div>
                                    <div className="mt-8 flex items-center justify-center gap-4">
                                        <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                            <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Last Action</p>
                                            <p className="text-sm font-black">{selectedSession.lastAction}</p>
                                        </div>
                                        <div className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                                            <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-1">Session Duration</p>
                                            <p className="text-sm font-black">
                                                {Math.floor((Date.now() - new Date(selectedSession.sessionStart).getTime()) / (1000 * 60 * 60))}h {Math.floor(((Date.now() - new Date(selectedSession.sessionStart).getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-200 grid grid-cols-4 gap-4 shrink-0">
                            <div className="text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Calls Made</p>
                                <p className="text-2xl font-black text-slate-900">{selectedSession.metrics.callsMade}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">SMS Sent</p>
                                <p className="text-2xl font-black text-slate-900">{selectedSession.metrics.smsSent}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">PTPs Secured</p>
                                <p className="text-2xl font-black text-emerald-600">{selectedSession.metrics.ptpSecured}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Recovered</p>
                                <p className="text-2xl font-black text-purple-600">{sym}{(selectedSession.metrics.totalRecovered / 1000).toFixed(0)}k</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveMonitoring;
