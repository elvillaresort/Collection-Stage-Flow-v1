import * as React from 'react';
import {
    Shield,
    Cpu,
    Database,
    Users,
    Activity,
    Lock,
    Server,
    Globe,
    Terminal,
    BarChart3,
    AlertTriangle,
    Key,
    RefreshCw,
    HardDrive,
    Zap,
    ChevronRight,
    ShieldAlert,
    Flame,
    LayoutGrid,
    FileSearch,
    Settings,
    MoreVertical,
    CheckCircle2,
    XCircle,
    ArrowRight,
    ShieldCheck,
    Search,
    UserPlus,
    Target,
    Plus,
    Edit3,
    Trash2,
    Building2,
    Image as ImageIcon,
    Upload,
    Link as LinkIcon,
    RefreshCw as RefreshCwIcon,
    Rocket,
    X,
    Loader2,
    Clock,
    Play,
    Coffee,
    Calculator
} from 'lucide-react';
import { User, SystemSettings, SystemLog, ClientCampaign, UserRole } from '../types';

/**
 * Helper component for Image Upload (copied from Settings for portability)
 */
const ImageUploader: React.FC<{
    label: string;
    value: string;
    onChange: (url: string) => void;
    dimensions: string;
    description: string;
}> = ({ label, value, onChange, dimensions, description }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-200 text-left">
            <div className="flex justify-between items-start">
                <div className="text-left">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block mb-1">{label}</label>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{description}</p>
                </div>
                <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">{dimensions}</div>
            </div>

            <div className="flex gap-6 items-center">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 group relative">
                    {value ? (
                        <img src={value} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                        <ImageIcon size={24} className="text-slate-200" />
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload size={20} className="text-white" />
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        title={`Upload ${label}`}
                    />
                </div>

                <div className="flex-1 space-y-2">
                    <div className="relative">
                        <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="Or paste asset URL..."
                            className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-mono outline-none focus:border-blue-600"
                            title={`${label} URL`}
                        />
                    </div>
                    <p className="text-[8px] text-slate-400 font-medium leading-relaxed italic">
                        * PNG with transparency recommended for logos.
                    </p>
                </div>
            </div>
        </div>
    );
};

interface AdminPanelProps {
    user: User;
    settings: SystemSettings;
    onUpdateSettings: (settings: SystemSettings) => void;
    systemUsers: User[];
    logs: SystemLog[];
    campaigns: ClientCampaign[];
    onSystemReset: () => void;
    onLogAction: (action: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical') => void;
    onClearLogs: () => void;
    onAddUser: (user: User) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onAddCampaign: (camp: ClientCampaign) => void;
    onUpdateCampaign: (camp: ClientCampaign) => void;
    onDeleteCampaign: (id: string) => void;
}

const ROLES: UserRole[] = [
    'SUPER_ADMIN', 'ADMIN', 'AGENT', 'FIELD_AGENT', 'CAMPAIGN_ADMIN', 'TEAM_LEADER',
    'OPERATIONS_MANAGER', 'HEAD_OF_OPERATIONS', 'TEAM_MANAGER',
    'COMPLIANCE_OFFICER', 'ASSISTANT_TEAM_LEADER'
];

const { useState, useMemo } = React;

const AdminPanel: React.FC<AdminPanelProps> = ({
    user,
    settings,
    onUpdateSettings,
    systemUsers,
    logs,
    campaigns,
    onSystemReset,
    onLogAction,
    onClearLogs,
    onAddUser,
    onUpdateUser,
    onDeleteUser,
    onAddCampaign,
    onUpdateCampaign,
    onDeleteCampaign
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'governance' | 'infrastructure' | 'audit' | 'personnel' | 'campaigns' | 'attendance'>('overview');
    const [isCleaning, setIsCleaning] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<ClientCampaign | null>(null);
    const [newCampaign, setNewCampaign] = useState<Partial<ClientCampaign>>({
        name: '', logo: '', status: 'Active', totalExposure: 0, activeCases: 0
    });
    const [newUser, setNewUser] = useState({
        name: '', employeeId: '', password: '', role: 'AGENT' as UserRole, avatar: ''
    });
    const logsPerPage = 10;

    // Computed data for the dashboard
    const activeSessions = systemUsers.filter(u => u.status === 'online').length;
    const criticalLogs = logs.filter(l => l.severity === 'critical').length;
    const totalLiability = campaigns.reduce((acc, c) => acc + c.totalExposure, 0);

    // Paginated logs
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * logsPerPage;
        return logs.slice(start, start + logsPerPage);
    }, [logs, currentPage]);

    const totalPages = Math.max(1, Math.ceil(logs.length / logsPerPage));

    const filteredUsers = useMemo(() => {
        return systemUsers.filter(u =>
            u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
            u.employeeId.toLowerCase().includes(userSearchQuery.toLowerCase())
        );
    }, [systemUsers, userSearchQuery]);

    const handleProvisionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProvisioning(true);
        await new Promise(r => setTimeout(r, 1500));

        const userToProvision: User = {
            id: `USR-${Date.now()}`,
            name: newUser.name,
            employeeId: newUser.employeeId,
            role: newUser.role,
            avatar: newUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.employeeId}`,
            isActive: true,
            status: 'offline',
            assignedDebtorIds: [],
            assignedCampaignIds: []
        };

        onAddUser(userToProvision);
        setIsProvisioning(false);
        setShowProvisionModal(false);
        setNewUser({ name: '', employeeId: '', password: '', role: 'AGENT', avatar: '' });
        onLogAction('User Provisioned', `New user ${userToProvision.name} authoried with role ${userToProvision.role}`, 'medium');
    };

    const handleCampaignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCampaign.name) return;

        const campaign: ClientCampaign = {
            id: editingCampaign?.id || `client-${Date.now()}`,
            name: newCampaign.name!,
            logo: newCampaign.logo,
            status: newCampaign.status || 'Active',
            totalExposure: newCampaign.totalExposure || 0,
            activeCases: newCampaign.activeCases || 0
        };

        if (editingCampaign) {
            onUpdateCampaign(campaign);
            onLogAction('Campaign Updated', `Operational context ${campaign.name} synched.`, 'medium');
        } else {
            onAddCampaign(campaign);
            onLogAction('Campaign Initialized', `New mission node ${campaign.name} established.`, 'high');
        }
        setShowCampaignModal(false);
        setEditingCampaign(null);
        setNewCampaign({ name: '', logo: '', status: 'Active', totalExposure: 0, activeCases: 0 });
    };

    const toggleUserCampaign = (u: User, campaignId: string) => {
        const currentIds = u.assignedCampaignIds || [];
        const newIds = currentIds.includes(campaignId)
            ? currentIds.filter(id => id !== campaignId)
            : [...currentIds, campaignId];
        onUpdateUser({ ...u, assignedCampaignIds: newIds });
    };

    return (
        <div className="max-w-[1600px] mx-auto p-4 lg:p-10 space-y-8 animate-in fade-in duration-700 text-left bg-slate-50/50 min-h-screen">
            {/* Header Secion */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="text-left">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/20">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Master Command</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Administrative Governance Tower • Role: {user.role}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-3xl">
                    {[
                        { id: 'overview', label: 'Monitor', icon: Activity },
                        { id: 'governance', label: 'Control', icon: Lock },
                        { id: 'personnel', label: 'Personnel', icon: Users },
                        { id: 'attendance', label: 'Attendance', icon: Clock },
                        { id: 'campaigns', label: 'Campaigns', icon: Target },
                        { id: 'infrastructure', label: 'Infra', icon: Server },
                        { id: 'audit', label: 'Ledger', icon: Terminal },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow-md'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Network Throughput', value: '98.4 GB/s', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Active Personnel', value: activeSessions, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            { label: 'System Integrity', value: 'Optimal', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { label: 'Total Exposure', value: `₱${(totalLiability / 1000000).toFixed(1)}M`, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                                    <stat.icon size={28} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        <div className="xl:col-span-8 bg-[#0f172a] p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute right-[-20px] top-[-20px] opacity-5 rotate-12"><Cpu size={300} /></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-10">
                                    <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 text-left">
                                        <Server size={24} className="text-blue-500" /> Infrastructure Matrix
                                    </h2>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">Stable</span>
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/30">v5.0.4 r12</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 text-left">
                                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic text-left">CPU Engine Load</p>
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-4xl font-black">14%</span>
                                            <span className="text-emerald-500 text-xs font-bold mb-1">Low</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full w-[14%]" />
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic text-left">Cluster Latency</p>
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-4xl font-black">12ms</span>
                                            <span className="text-blue-500 text-xs font-bold mb-1">Nominal</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full w-[30%]" />
                                        </div>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic text-left">DB Health Status</p>
                                        <div className="flex items-end gap-2 mb-2">
                                            <span className="text-4xl font-black">100%</span>
                                            <span className="text-indigo-500 text-xs font-bold mb-1">Synced</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                            <div className="bg-indigo-500 h-full w-full" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-600/10 border border-blue-500/30 p-8 rounded-[2.5rem] flex items-center justify-between">
                                    <div className="text-left">
                                        <h4 className="font-black text-lg">Predictive Maintenance Active</h4>
                                        <p className="text-blue-300 text-sm font-medium">Aegis AI is currently monitoring for memory leaks and anomalous payload spikes.</p>
                                    </div>
                                    <button
                                        title="Execute Force Cleanup"
                                        onClick={async () => {
                                            setIsCleaning(true);
                                            await new Promise(r => setTimeout(r, 2000));
                                            setIsCleaning(false);
                                            onLogAction('Memory Cleanup', 'Garbage collection and cache purge executed successfully across all nodes.', 'low');
                                        }}
                                        disabled={isCleaning}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isCleaning ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                                        {isCleaning ? 'Cleaning...' : 'Force Cleanup'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-4 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col h-[520px]">
                            <div className="flex items-center justify-between mb-8 text-left">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">System Anomalies</h3>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${criticalLogs > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                    {criticalLogs} Issues detected
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-none">
                                {logs.slice(0, 10).map((log, i) => (
                                    <div key={i} className={`p-5 rounded-[2rem] border flex items-start gap-4 transition-all hover:bg-slate-50 ${log.severity === 'critical' ? 'bg-rose-50/30 border-rose-100' : 'bg-slate-50/50 border-slate-100'}`}>
                                        <div className={`p-3 rounded-xl ${log.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'} shrink-0`}>
                                            {log.severity === 'critical' ? <ShieldAlert size={16} /> : <FileSearch size={16} />}
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-xs font-black uppercase tracking-tight ${log.severity === 'critical' ? 'text-rose-600' : 'text-slate-900'}`}>{log.action}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">{log.details}</p>
                                            <p className="text-[9px] text-slate-400 mt-2 font-mono">{log.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                title="Flush Ledger"
                                onClick={() => {
                                    if (confirm('Are you sure you want to wipe the ledger? This action is immutable.')) {
                                        onClearLogs();
                                        onLogAction('Ledger Purge', 'System administrator manually flushed the operational ledger.', 'medium');
                                    }
                                }}
                                className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                            >
                                Clear Ledger History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'governance' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl relative overflow-hidden text-left">
                            <div className="absolute right-[-10px] top-[-10px] opacity-10"><Lock size={150} /></div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-3">
                                <Flame size={28} className="text-rose-600" /> Omega Protocol
                            </h3>
                            <p className="text-slate-500 font-bold mb-8 italic text-left">"Emergency state for immediate operational suspension."</p>

                            <div className="space-y-6">
                                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex items-center justify-between">
                                    <div className="text-left">
                                        <h4 className="text-lg font-black tracking-tight">Global System Lockdown</h4>
                                        <p className="text-slate-400 text-xs font-medium">Instantly freeze all agent sessions and API nodes.</p>
                                    </div>
                                    <button
                                        title={settings.recovery.globalLockdown ? 'Release System' : 'Lock System'}
                                        onClick={() => {
                                            const newState = !settings.recovery.globalLockdown;
                                            onUpdateSettings({ ...settings, recovery: { ...settings.recovery, globalLockdown: newState } });
                                            onLogAction('Lockdown Change', `Global system lockdown ${newState ? 'activated' : 'deactivated'} by administrator.`, newState ? 'critical' : 'medium');
                                        }}
                                        className={`px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${settings.recovery.globalLockdown ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'}`}
                                    >
                                        {settings.recovery.globalLockdown ? 'Release Lock' : 'Execute Lockdown'}
                                    </button>
                                </div>

                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex items-center justify-between">
                                    <div className="text-left">
                                        <h4 className="text-lg font-black text-slate-900 tracking-tight">Force System Reset</h4>
                                        <p className="text-slate-500 text-xs font-medium">Re-initialize database states and clear localized cached nodes.</p>
                                    </div>
                                    <button
                                        title="Reset System Core"
                                        onClick={() => {
                                            if (confirm('CRITICAL: This will wipe volatile states and re-initialize the core. Proceed?')) {
                                                onSystemReset();
                                                onLogAction('System Reset', 'Master system reset initiated by administrator.', 'critical');
                                            }
                                        }}
                                        className="px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                    >
                                        Wipe & Rebuild
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-950 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden text-left">
                            <div className="absolute left-[-20px] top-[-20px] opacity-10"><Shield size={200} /></div>
                            <h3 className="text-2xl font-black tracking-tight mb-4 flex items-center gap-3">
                                <Key size={28} className="text-blue-500" /> Access Sovereignty
                            </h3>
                            <p className="text-slate-400 font-bold mb-8 italic uppercase tracking-widest text-[10px] text-left">Security policy override matrix</p>

                            <div className="space-y-4">
                                {[
                                    { id: 'sentinel.enabled', label: 'Sentinel AI Guardian', status: settings.sentinel.enabled ? 'Enabled' : 'Disabled' },
                                    { id: 'compliance.ipWhitelist', label: 'Strict IP Geofencing', status: 'Active (2 Nodes)' },
                                    { id: 'aegis.browserIsolation', label: 'Remote Browser Isolation', status: settings.aegis.browserIsolation ? 'Active' : 'Offline' },
                                    { id: 'compliance.auditLogging', label: 'Immutable Audit Logging', status: 'Mandatory' },
                                ].map((policy, i) => (
                                    <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><CheckCircle2 size={18} /></div>
                                            <p className="text-sm font-black tracking-tight">{policy.label}</p>
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-slate-500 group-hover:text-blue-400 transition-colors">{policy.status}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-4">
                                <p className="text-[10px] font-bold text-slate-500 uppercase flex-1 italic text-left">"Policy changes are indexed in the master blockchain and cannot be erased."</p>
                                <button
                                    title="Export Security Compliance Report"
                                    onClick={async () => {
                                        setIsExporting(true);
                                        await new Promise(r => setTimeout(r, 1500));
                                        alert("Security and Compliance Report (PDF) ready for download.");
                                        setIsExporting(false);
                                        onLogAction('Report Generated', 'Administrative security and compliance report exported.', 'low');
                                    }}
                                    disabled={isExporting}
                                    className="px-6 py-3 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isExporting ? 'Generating...' : 'Export Report'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'infrastructure' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-left">
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8 text-left">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Database size={24} className="text-blue-600" /> Database Stack</h3>
                            <div className="space-y-6 text-left">
                                <div className="flex justify-between items-center text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Primary Engine</p>
                                    <span className="text-xs font-black text-slate-900">PostgreSQL (Supabase)</span>
                                </div>
                                <div className="flex justify-between items-center text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Storage Usage</p>
                                    <span className="text-xs font-black text-slate-900">12.4 GB / 1 TB</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full w-[1.2%]" />
                                </div>
                                <div className="flex justify-between items-center text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Read/Write Ratio</p>
                                    <span className="text-xs font-black text-slate-900">72 / 28</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl space-y-8 text-left">
                            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Globe size={24} className="text-emerald-600" /> Edge Proxies</h3>
                            <div className="space-y-6 text-left">
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-left">
                                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest text-left">PH-NORTH-NODE</p>
                                    <span className="text-xs font-black text-emerald-600">Active</span>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-left">
                                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest text-left">PH-CENTRAL-NODE</p>
                                    <span className="text-xs font-black text-emerald-600">Active</span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-left opacity-50">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-left">SG-OVERLAY-NODE</p>
                                    <span className="text-xs font-black text-slate-400">Idle</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden text-left">
                            <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><HardDrive size={150} /></div>
                            <div className="relative z-10 text-left">
                                <h3 className="text-xl font-black flex items-center gap-3 mb-4">
                                    <RefreshCw size={24} className={isSyncing ? "animate-spin text-white" : "animate-spin-slow text-indigo-300"} /> Binary Synchronization
                                </h3>
                                <p className="text-indigo-100 text-sm font-medium italic mb-8">Synchronizing master core with all 42 remote terminal nodes.</p>
                            </div>
                            <button
                                title="Initiate Binary Sync"
                                onClick={async () => {
                                    setIsSyncing(true);
                                    await new Promise(r => setTimeout(r, 3000));
                                    setIsSyncing(false);
                                    onLogAction('Cluster Sync', 'Successfully synchronized master binary across 42 cluster nodes.', 'medium');
                                }}
                                disabled={isSyncing}
                                className="relative z-10 w-full py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl disabled:opacity-50"
                            >
                                {isSyncing ? 'Syncing...' : 'Initiate Master Sync'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'audit' && (
                <div className="bg-white p-4 lg:p-12 rounded-[4rem] border border-slate-100 shadow-2xl space-y-10 animate-in slide-in-from-bottom-4 duration-500 overflow-hidden text-left">
                    <div className="flex justify-between items-center text-left">
                        <div className="text-left">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Ledger</h2>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 italic text-left">Immutable transaction and command sequence directory</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                title="Refresh Ledger Node"
                                onClick={() => setCurrentPage(1)}
                                className="p-4 bg-slate-100 rounded-2xl text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
                            ><FileSearch size={20} /></button>
                            <button
                                title="Generate Full Audit Package"
                                onClick={async () => {
                                    setIsExporting(true);
                                    await new Promise(r => setTimeout(r, 2000));
                                    alert("Full Audit Package (Legder + Auth States) compressed and ready.");
                                    setIsExporting(false);
                                    onLogAction('Audit Export', `Full operational ledger (${logs.length} entries) exported for regulatory review.`, 'high');
                                }}
                                disabled={isExporting}
                                className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isExporting ? 'Packaging...' : 'Generate Auditor Export'}
                            </button>
                        </div>
                    </div>

                    <div className="border border-slate-100 rounded-[3rem] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Sequence</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Authority</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Command/Action</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Node Origin</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedLogs.map((log, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6 text-xs font-mono text-slate-400">#04{log.id.slice(-4)}-X</td>
                                        <td className="px-8 py-6 font-black text-slate-900 text-sm whitespace-nowrap">{log.userName}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3 text-left">
                                                <span className={`w-2 h-2 rounded-full ${log.severity === 'critical' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                                <span className="text-sm font-bold text-slate-700">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">PCCS-HQ-HUB-01</td>
                                        <td className="px-8 py-6 text-xs text-slate-500 font-medium">{log.timestamp}</td>
                                    </tr>
                                ))}
                                {paginatedLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">No ledger entries detected in the current cluster.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-center pt-8">
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'personnel' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                        <div className="relative w-full md:w-96 text-left">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search personnel by name or hash..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600"
                            />
                        </div>
                        <button onClick={() => setShowProvisionModal(true)} className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-900/20 flex items-center gap-3 active:scale-95 transition-all"><UserPlus size={18} /> Provision Elite Personnel</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredUsers.map(u => (
                            <div key={u.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] group-hover:bg-blue-50 transition-colors"></div>
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <img src={u.avatar} className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white" alt="" />
                                    <div className="flex gap-2">
                                        <button onClick={() => onDeleteUser(u.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm" title="Revoke Access"><Trash2 size={20} /></button>
                                    </div>
                                </div>
                                <h4 className="text-xl font-black text-slate-900 tracking-tight">{u.name}</h4>
                                <span className="text-[10px] font-black text-blue-600 uppercase mt-1 tracking-widest">{u.role.replace(/_/g, ' ')}</span>
                                <p className="text-[10px] text-slate-400 mt-4 uppercase font-mono">HASH: {u.employeeId}</p>

                                <div className="mt-8 pt-8 border-t border-slate-50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Node Allocation Power</p>
                                    <div className="flex flex-wrap gap-2">
                                        {campaigns.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => toggleUserCampaign(u, c.id)}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${u.assignedCampaignIds?.includes(c.id)
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                                    : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 shadow-sm'
                                                    }`}
                                                title={`Allocate ${c.name} context to user`}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'campaigns' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
                    <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="absolute left-[-20px] top-[-20px] opacity-10"><Target size={200} /></div>
                        <div className="relative z-10 text-left">
                            <h2 className="text-3xl font-black tracking-tight flex items-center gap-4">
                                <Target size={36} className="text-blue-400" /> Operational Context Nodes
                            </h2>
                            <p className="text-slate-400 font-bold mt-4 leading-relaxed italic max-w-2xl text-left">
                                Define mission nodes and client-specific data silos. Each node represents an isolated operational environment.
                            </p>
                        </div>
                        <button
                            onClick={() => { setEditingCampaign(null); setNewCampaign({ name: '', logo: '', status: 'Active', totalExposure: 0, activeCases: 0 }); setShowCampaignModal(true); }}
                            className="relative z-10 px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-600/30 flex items-center gap-3 active:scale-95 transition-all"
                        >
                            <Plus size={20} /> Initialize New Node
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {campaigns.map(c => (
                            <div key={c.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-bl-[6rem] group-hover:bg-blue-50 transition-colors"></div>
                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="w-20 h-20 rounded-3xl bg-slate-100 p-3 flex items-center justify-center shadow-inner border border-slate-200">
                                        {c.logo ? <img src={c.logo} className="max-w-full max-h-full object-contain" alt="" /> : <Building2 className="text-slate-400" size={32} />}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingCampaign(c); setNewCampaign(c); setShowCampaignModal(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm" title="Reconfigure Node"><Edit3 size={20} /></button>
                                        <button onClick={() => onDeleteCampaign(c.id)} className="p-3 bg-rose-50 text-rose-400 hover:text-rose-600 rounded-xl transition-all shadow-sm" title="Terminate Node"><Trash2 size={20} /></button>
                                    </div>
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">{c.name}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-mono">NODE IDENTIFIER: {c.id}</p>

                                <div className="grid grid-cols-2 gap-6 mt-10">
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Exposure</p>
                                        <p className="text-xl font-black text-slate-900 font-mono text-left italic">₱{(c.totalExposure / 1000000).toFixed(1)}M</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Targets</p>
                                        <p className="text-xl font-black text-slate-900 font-mono text-left italic">{c.activeCases}</p>
                                    </div>
                                </div>

                                <div className="mt-10 flex justify-between items-center bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${c.status === 'Active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-400 text-white'}`}>
                                        {c.status}
                                    </span>
                                    <div className="flex -space-x-3">
                                        {systemUsers.filter(u => u.assignedCampaignIds?.includes(c.id)).slice(0, 4).map(u => (
                                            <img key={u.id} src={u.avatar} className="w-10 h-10 rounded-full border-4 border-white object-cover shadow-lg" alt="" title={u.name} />
                                        ))}
                                        {systemUsers.filter(u => u.assignedCampaignIds?.includes(c.id)).length > 4 && (
                                            <div className="w-10 h-10 rounded-full bg-slate-900 border-4 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg">
                                                +{systemUsers.filter(u => u.assignedCampaignIds?.includes(c.id)).length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'attendance' && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
                    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-left">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                <Clock size={36} className="text-blue-600" /> Personnel Attendance Ledger
                            </h2>
                            <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Real-time operational availability and rendered hours</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
                                <FileSearch size={16} /> Export Payroll CSV
                            </button>
                            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 flex items-center gap-2">
                                <RefreshCw size={16} /> Sync Cluster
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Currently On Duty', value: systemUsers.filter(u => u.status === 'online').length, icon: Play, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                            { label: 'On Break/Lunch', value: '2', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-50' },
                            { label: 'Avg Rendered Hrs', value: '7.8h', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-50' },
                            { label: 'System Compliance', value: '98%', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-xl font-black text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Personnel</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Current Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Clock In</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Rendered Hours</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Productivity</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {systemUsers.map((u, i) => {
                                    const isOnDuty = u.status === 'online';
                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4 text-left">
                                                    <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover border border-slate-100" alt="" />
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{u.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{u.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isOnDuty ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                    {isOnDuty ? 'On Duty' : 'Offline'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-xs font-mono text-slate-500">
                                                {isOnDuty ? '08:00:24 AM' : '--:--:--'}
                                            </td>
                                            <td className="px-8 py-6 text-xs font-black text-slate-900">
                                                {isOnDuty ? '02:34:12' : '00:00:00'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="w-32 flex items-center gap-3 text-left">
                                                    <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-blue-600 h-full w-[85%]" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-900">85%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">View Logs</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Campaign Provision Modal */}
            {showCampaignModal && (
                <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 text-left">
                            <div className="text-left">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{editingCampaign ? 'Synchronize Mission Node' : 'Initialize Mission Node'}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Environment Specification</p>
                            </div>
                            <button onClick={() => setShowCampaignModal(false)} className="p-4 hover:bg-white rounded-2xl shadow-sm transition-all text-slate-400 hover:text-rose-600" title="Abort Sequence"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCampaignSubmit} className="p-12 space-y-8 text-left">
                            <div className="space-y-6 text-left">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Context Designation (Name)</label>
                                    <input
                                        required
                                        type="text"
                                        title="Campaign Name"
                                        value={newCampaign.name}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                        placeholder="e.g. ALPHA-REMEDIAL-Q4"
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold outline-none focus:border-blue-600 transition-all shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6 text-left">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Liability Threshold (₱)</label>
                                        <input
                                            type="number"
                                            title="Threshold"
                                            value={newCampaign.totalExposure}
                                            onChange={(e) => setNewCampaign({ ...newCampaign, totalExposure: parseFloat(e.target.value) })}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-mono font-bold outline-none focus:border-blue-600 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Target Case Count</label>
                                        <input
                                            type="number"
                                            title="Case Count"
                                            value={newCampaign.activeCases}
                                            onChange={(e) => setNewCampaign({ ...newCampaign, activeCases: parseInt(e.target.value) })}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-mono font-bold outline-none focus:border-blue-600 transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                <ImageUploader
                                    label="Mission Branding Asset"
                                    description="Primary visual for node identification."
                                    dimensions="1024x1024px"
                                    value={newCampaign.logo || ''}
                                    onChange={(url) => setNewCampaign({ ...newCampaign, logo: url })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-4"
                            >
                                {editingCampaign ? <RefreshCwIcon size={20} className="animate-spin-slow" /> : <Rocket size={20} />}
                                {editingCampaign ? 'Commit Synchronized States' : 'Engage Mission Node'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* User Provision Modal */}
            {showProvisionModal && (
                <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 text-left">
                            <div className="text-left">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Provision Elite Personnel</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel Authorization Specification</p>
                            </div>
                            <button onClick={() => setShowProvisionModal(false)} className="p-4 hover:bg-white rounded-2xl shadow-sm transition-all text-slate-400 hover:text-rose-600" title="Abort Sequence"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleProvisionSubmit} className="p-12 space-y-8 text-left">
                            <div className="space-y-6 text-left">
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Legal Designation (Name)</label>
                                    <input
                                        required
                                        type="text"
                                        title="User Name"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold outline-none focus:border-blue-600 transition-all shadow-inner"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6 text-left">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Binary Identifier (Hash)</label>
                                        <input
                                            required
                                            type="text"
                                            title="Hash ID"
                                            value={newUser.employeeId}
                                            onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-mono font-bold outline-none focus:border-blue-600 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Operational Role</label>
                                        <select
                                            title="Role Select"
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                                            className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-bold outline-none focus:border-blue-600 transition-all appearance-none cursor-pointer shadow-inner"
                                        >
                                            {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProvisioning}
                                className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {isProvisioning ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} />}
                                {isProvisioning ? 'Authorizing Neural Pattern...' : 'Grant Sovereign Access'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer Branding */}
            <div className="flex justify-between items-center opacity-30 px-8">
                <div className="flex items-center gap-3">
                    <Zap size={14} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Quantum Secure Access Layer Active</p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Build ID: PCCS-CSF-V5-RELEASE</p>
            </div>

            <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default AdminPanel;
