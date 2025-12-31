import React, { useState, useMemo } from 'react';
import {
    Zap, Plus, Play, Pause, Edit3, Trash2, Copy, Save, X, ChevronRight, ChevronDown,
    MessageSquare, Phone, Mail, Clock, Calendar, DollarSign, AlertTriangle, CheckCircle2,
    Settings, Users, Target, TrendingUp, BarChart3, Filter, Search, Eye, Loader2,
    ArrowRight, ArrowDown, Smartphone, Send, FileText, Scale, Gavel, MapPin, Bot,
    RefreshCw, Activity, Layers, GitBranch, Workflow, Sparkles, Shield, Info
} from 'lucide-react';
import { SystemSettings, CommunicationType, User } from '../types';
import StrategyBuilderModal from './StrategyBuilderModal';

interface CollectionStrategy {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'paused' | 'draft';
    targetSegment: string;
    stages: CollectionStage[];
    performance: {
        totalCases: number;
        successRate: number;
        avgRecovery: number;
        avgDuration: number;
    };
    createdBy: string;
    lastModified: string;
}

interface CollectionStage {
    id: string;
    name: string;
    dayRange: { min: number; max: number };
    actions: CollectionAction[];
    successCriteria: string;
    escalationTrigger: string;
}

interface CollectionAction {
    id: string;
    type: CommunicationType;
    timing: 'immediate' | 'scheduled' | 'delayed';
    delay?: number; // hours
    template: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    automate: boolean;
}

interface CollectionFlowsProps {
    user: User;
    settings: SystemSettings;
}

const DUMMY_STRATEGIES: CollectionStrategy[] = [
    {
        id: 'STR-001',
        name: 'Early Stage Soft Touch',
        description: 'Gentle reminder strategy for 1-30 DPD accounts with good payment history',
        status: 'active',
        targetSegment: 'Bucket 1 (1-30 DPD)',
        stages: [
            {
                id: 'stage-1',
                name: 'Courtesy Reminder',
                dayRange: { min: 1, max: 7 },
                actions: [
                    { id: 'a1', type: CommunicationType.SMS, timing: 'immediate', template: 'Friendly payment reminder', priority: 'low', automate: true },
                    { id: 'a2', type: CommunicationType.EMAIL, timing: 'delayed', delay: 24, template: 'Payment due notice', priority: 'low', automate: true }
                ],
                successCriteria: 'Payment received within 7 days',
                escalationTrigger: 'No response after 7 days'
            },
            {
                id: 'stage-2',
                name: 'Follow-up Contact',
                dayRange: { min: 8, max: 15 },
                actions: [
                    { id: 'a3', type: CommunicationType.VOICE, timing: 'scheduled', template: 'Courtesy call script', priority: 'medium', automate: false },
                    { id: 'a4', type: CommunicationType.WHATSAPP, timing: 'immediate', template: 'Payment arrangement offer', priority: 'medium', automate: true }
                ],
                successCriteria: 'Promise to Pay (PTP) secured',
                escalationTrigger: 'No contact after 3 attempts'
            }
        ],
        performance: {
            totalCases: 1240,
            successRate: 78.5,
            avgRecovery: 85000,
            avgDuration: 12
        },
        createdBy: 'Admin',
        lastModified: '2024-12-20'
    },
    {
        id: 'STR-002',
        name: 'Aggressive Recovery - High Risk',
        description: 'Intensive multi-channel strategy for 90+ DPD high-value accounts',
        status: 'active',
        targetSegment: 'Bucket 3+ (90+ DPD)',
        stages: [
            {
                id: 'stage-1',
                name: 'Intensive Contact',
                dayRange: { min: 90, max: 120 },
                actions: [
                    { id: 'a1', type: CommunicationType.VOICE, timing: 'immediate', template: 'Urgent payment demand', priority: 'critical', automate: false },
                    { id: 'a2', type: CommunicationType.SMS, timing: 'immediate', template: 'Legal action warning', priority: 'critical', automate: true },
                    { id: 'a3', type: CommunicationType.EMAIL, timing: 'delayed', delay: 2, template: 'Formal demand letter', priority: 'critical', automate: true }
                ],
                successCriteria: 'Full payment or settlement agreement',
                escalationTrigger: 'No payment after 30 days'
            },
            {
                id: 'stage-2',
                name: 'Legal Escalation',
                dayRange: { min: 121, max: 150 },
                actions: [
                    { id: 'a4', type: CommunicationType.DEMAND_LETTER, timing: 'immediate', template: 'Attorney demand letter', priority: 'critical', automate: false },
                    { id: 'a5', type: CommunicationType.FIELD_VISIT, timing: 'scheduled', template: 'Field verification', priority: 'critical', automate: false }
                ],
                successCriteria: 'Legal settlement or payment plan',
                escalationTrigger: 'File for legal action'
            }
        ],
        performance: {
            totalCases: 385,
            successRate: 45.2,
            avgRecovery: 125000,
            avgDuration: 45
        },
        createdBy: 'Campaign Manager',
        lastModified: '2024-12-18'
    },
    {
        id: 'STR-003',
        name: 'AI-Optimized Hybrid Flow',
        description: 'Machine learning-driven strategy with dynamic channel selection',
        status: 'draft',
        targetSegment: 'All Buckets (AI Segmented)',
        stages: [
            {
                id: 'stage-1',
                name: 'AI Channel Selection',
                dayRange: { min: 1, max: 60 },
                actions: [
                    { id: 'a1', type: CommunicationType.SMS, timing: 'immediate', template: 'AI-generated personalized message', priority: 'medium', automate: true },
                    { id: 'a2', type: CommunicationType.VOICE, timing: 'scheduled', template: 'AI voice bot engagement', priority: 'medium', automate: true }
                ],
                successCriteria: 'AI confidence score > 70%',
                escalationTrigger: 'AI recommendation'
            }
        ],
        performance: {
            totalCases: 0,
            successRate: 0,
            avgRecovery: 0,
            avgDuration: 0
        },
        createdBy: 'System',
        lastModified: '2024-12-27'
    }
];

interface MessageTemplate {
    id: string;
    name: string;
    channel: CommunicationType;
    content: string;
    variables: string[]; // e.g., ['borrowerName', 'amountDue', 'dueDate']
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvalDate?: string;
    clientId?: string;
    language: 'en' | 'fil';
}

const DUMMY_TEMPLATES: MessageTemplate[] = [
    {
        id: 'TPL-001',
        name: 'Friendly Payment Reminder',
        channel: CommunicationType.SMS,
        content: 'Hi {{borrowerName}}, this is a friendly reminder that your payment of {{amountDue}} is due on {{dueDate}}. Please settle at your earliest convenience. Thank you!',
        variables: ['borrowerName', 'amountDue', 'dueDate'],
        approvalStatus: 'approved',
        approvedBy: 'Client ABC Corp',
        approvalDate: '2024-12-15',
        clientId: 'CLIENT-001',
        language: 'en'
    },
    {
        id: 'TPL-002',
        name: 'Urgent Payment Demand',
        channel: CommunicationType.SMS,
        content: 'URGENT: {{borrowerName}}, your account is {{overdueDays}} days overdue. Amount due: {{amountDue}}. Please contact us immediately at {{contactNumber}} to avoid legal action.',
        variables: ['borrowerName', 'overdueDays', 'amountDue', 'contactNumber'],
        approvalStatus: 'approved',
        approvedBy: 'Client XYZ Bank',
        approvalDate: '2024-12-10',
        clientId: 'CLIENT-002',
        language: 'en'
    },
    {
        id: 'TPL-003',
        name: 'Courtesy Call Script',
        channel: CommunicationType.VOICE,
        content: 'Good day {{borrowerName}}, this is {{agentName}} from {{companyName}}. I\'m calling regarding your account ending in {{lastFourDigits}}. We noticed a payment of {{amountDue}} is currently overdue. May I know when you can settle this amount?',
        variables: ['borrowerName', 'agentName', 'companyName', 'lastFourDigits', 'amountDue'],
        approvalStatus: 'approved',
        approvedBy: 'Client ABC Corp',
        approvalDate: '2024-12-18',
        clientId: 'CLIENT-001',
        language: 'en'
    },
    {
        id: 'TPL-004',
        name: 'Payment Arrangement Offer (Filipino)',
        channel: CommunicationType.WHATSAPP,
        content: 'Magandang araw {{borrowerName}}! Nais naming mag-alok ng flexible payment arrangement para sa inyong utang na {{amountDue}}. Maaari kayong magbayad ng {{installmentAmount}} monthly sa loob ng {{months}} buwan. Interesado po ba kayo?',
        variables: ['borrowerName', 'amountDue', 'installmentAmount', 'months'],
        approvalStatus: 'pending',
        language: 'fil'
    }
];

const CollectionFlows: React.FC<CollectionFlowsProps> = ({ user, settings }) => {
    const [strategies, setStrategies] = useState<CollectionStrategy[]>(DUMMY_STRATEGIES);
    const [templates, setTemplates] = useState<MessageTemplate[]>(DUMMY_TEMPLATES);
    const [selectedStrategy, setSelectedStrategy] = useState<CollectionStrategy | null>(null);
    const [showStrategyModal, setShowStrategyModal] = useState(false);
    const [showStageModal, setShowStageModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<CollectionStrategy | null>(null);
    const [expandedStages, setExpandedStages] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
    const [builderStep, setBuilderStep] = useState<1 | 2 | 3>(1);

    // Strategy Builder Form
    const [strategyForm, setStrategyForm] = useState({
        name: '',
        description: '',
        targetSegment: '',
        stages: [] as CollectionStage[]
    });

    // Stage Builder Form
    const [stageForm, setStageForm] = useState({
        name: '',
        dayMin: 1,
        dayMax: 30,
        successCriteria: '',
        escalationTrigger: '',
        actions: [] as CollectionAction[]
    });

    // Template Builder Form
    const [templateForm, setTemplateForm] = useState({
        name: '',
        channel: CommunicationType.SMS,
        content: '',
        language: 'en' as 'en' | 'fil',
        clientId: ''
    });


    const sym = settings.localization.currencySymbol;

    const filteredStrategies = useMemo(() => {
        return strategies.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [strategies, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        const active = strategies.filter(s => s.status === 'active');
        return {
            totalStrategies: strategies.length,
            activeStrategies: active.length,
            totalCases: active.reduce((sum, s) => sum + s.performance.totalCases, 0),
            avgSuccessRate: active.length > 0 ? active.reduce((sum, s) => sum + s.performance.successRate, 0) / active.length : 0
        };
    }, [strategies]);

    const toggleStage = (stageId: string) => {
        setExpandedStages(prev =>
            prev.includes(stageId) ? prev.filter(id => id !== stageId) : [...prev, stageId]
        );
    };

    const toggleStrategyStatus = (id: string) => {
        setStrategies(prev => prev.map(s =>
            s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s
        ));
    };

    const duplicateStrategy = (strategy: CollectionStrategy) => {
        const newStrategy: CollectionStrategy = {
            ...strategy,
            id: `STR-${Date.now()}`,
            name: `${strategy.name} (Copy)`,
            status: 'draft',
            performance: { totalCases: 0, successRate: 0, avgRecovery: 0, avgDuration: 0 },
            lastModified: new Date().toISOString().split('T')[0]
        };
        setStrategies(prev => [newStrategy, ...prev]);
        alert('Strategy duplicated successfully');
    };

    const deleteStrategy = (id: string) => {
        if (confirm('Are you sure you want to delete this strategy?')) {
            setStrategies(prev => prev.filter(s => s.id !== id));
            alert('Strategy deleted');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'paused': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'draft': return 'bg-slate-50 text-slate-600 border-slate-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getActionIcon = (type: CommunicationType) => {
        switch (type) {
            case CommunicationType.SMS: return Smartphone;
            case CommunicationType.VOICE: return Phone;
            case CommunicationType.EMAIL: return Mail;
            case CommunicationType.WHATSAPP: return MessageSquare;
            case CommunicationType.FIELD_VISIT: return MapPin;
            case CommunicationType.DEMAND_LETTER: return FileText;
            default: return Send;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-rose-600 bg-rose-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'medium': return 'text-amber-600 bg-amber-50';
            case 'low': return 'text-blue-600 bg-blue-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    const handleAddTemplate = (template: any) => {
        setTemplates(prev => [template, ...prev]);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Zap size={28} className="text-blue-600" />
                        Collection Flows & Strategies
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 text-sm">
                        Automated multi-stage recovery workflows with intelligent escalation
                    </p>
                </div>
                <button
                    onClick={() => { setEditingStrategy(null); setShowStrategyModal(true); }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> Create Strategy
                </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Strategies', value: stats.totalStrategies, icon: Layers, color: 'slate' },
                    { label: 'Active Flows', value: stats.activeStrategies, icon: Activity, color: 'emerald' },
                    { label: 'Cases Managed', value: stats.totalCases.toLocaleString(), icon: Users, color: 'blue' },
                    { label: 'Avg Success Rate', value: `${stats.avgSuccessRate.toFixed(1)}%`, icon: TrendingUp, color: 'purple' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                        <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
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
                            placeholder="Search strategies..."
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
                        <option value="paused">Paused</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* Strategies List */}
            <div className="space-y-6">
                {filteredStrategies.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                        <Workflow size={64} className="text-slate-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No Strategies Found</h3>
                        <p className="text-slate-500 font-medium">Create your first collection flow to get started</p>
                    </div>
                ) : (
                    filteredStrategies.map(strategy => (
                        <div key={strategy.id} className="bg-white rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden">
                            {/* Strategy Header */}
                            <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                                                <Workflow size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-2xl font-black text-slate-900">{strategy.name}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(strategy.status)}`}>
                                                        {strategy.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 font-medium mb-3">{strategy.description}</p>
                                                <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                                                    <span className="flex items-center gap-2">
                                                        <Target size={14} /> {strategy.targetSegment}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Users size={14} /> {strategy.performance.totalCases} cases
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Calendar size={14} /> Modified: {strategy.lastModified}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Performance Metrics */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Success Rate</p>
                                                <p className="text-xl font-black text-emerald-600">{strategy.performance.successRate}%</p>
                                            </div>
                                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Recovery</p>
                                                <p className="text-xl font-black text-blue-600">{sym}{(strategy.performance.avgRecovery / 1000).toFixed(0)}k</p>
                                            </div>
                                            <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Duration</p>
                                                <p className="text-xl font-black text-purple-600">{strategy.performance.avgDuration}d</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex md:flex-col gap-2">
                                        <button
                                            title={strategy.status === 'active' ? 'Pause' : 'Activate'}
                                            onClick={() => toggleStrategyStatus(strategy.id)}
                                            className={`p-3 rounded-xl transition-all ${strategy.status === 'active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                        >
                                            {strategy.status === 'active' ? <Pause size={20} /> : <Play size={20} />}
                                        </button>
                                        <button
                                            title="Edit strategy"
                                            onClick={() => { setEditingStrategy(strategy); setShowStrategyModal(true); }}
                                            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                                        >
                                            <Edit3 size={20} />
                                        </button>
                                        <button
                                            title="Duplicate strategy"
                                            onClick={() => duplicateStrategy(strategy)}
                                            className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all"
                                        >
                                            <Copy size={20} />
                                        </button>
                                        <button
                                            title="Delete strategy"
                                            onClick={() => deleteStrategy(strategy.id)}
                                            className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stages */}
                            <div className="p-8 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <GitBranch size={14} /> Collection Stages ({strategy.stages.length})
                                </h4>
                                {strategy.stages.map((stage, index) => (
                                    <div key={stage.id} className="border border-slate-200 rounded-3xl overflow-hidden">
                                        <div
                                            onClick={() => toggleStage(stage.id)}
                                            className="p-6 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h5 className="text-lg font-black text-slate-900">{stage.name}</h5>
                                                    <p className="text-xs text-slate-500 font-bold mt-1">
                                                        Days {stage.dayRange.min}-{stage.dayRange.max} • {stage.actions.length} actions
                                                    </p>
                                                </div>
                                            </div>
                                            {expandedStages.includes(stage.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        </div>

                                        {expandedStages.includes(stage.id) && (
                                            <div className="p-6 bg-white border-t border-slate-200 space-y-6">
                                                {/* Actions */}
                                                <div>
                                                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Actions</h6>
                                                    <div className="space-y-3">
                                                        {stage.actions.map((action) => {
                                                            const ActionIcon = getActionIcon(action.type);
                                                            return (
                                                                <div key={action.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`p-2 rounded-xl ${getPriorityColor(action.priority)}`}>
                                                                            <ActionIcon size={18} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-black text-slate-900">{action.type}</p>
                                                                            <p className="text-xs text-slate-500 font-medium mt-1">{action.template}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        {action.automate && (
                                                                            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                                <Bot size={10} /> Auto
                                                                            </span>
                                                                        )}
                                                                        <span className="text-xs font-bold text-slate-400">
                                                                            {action.timing === 'delayed' ? `+${action.delay}h` : action.timing}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Criteria */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CheckCircle2 size={16} className="text-emerald-600" />
                                                            <p className="text-[9px] font-black text-emerald-900 uppercase tracking-widest">Success Criteria</p>
                                                        </div>
                                                        <p className="text-xs text-emerald-700 font-medium">{stage.successCriteria}</p>
                                                    </div>
                                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <AlertTriangle size={16} className="text-amber-600" />
                                                            <p className="text-[9px] font-black text-amber-900 uppercase tracking-widest">Escalation Trigger</p>
                                                        </div>
                                                        <p className="text-xs text-amber-700 font-medium">{stage.escalationTrigger}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Strategy Builder Modal */}
            <StrategyBuilderModal
                show={showStrategyModal}
                onClose={() => setShowStrategyModal(false)}
                templates={templates}
                onAddTemplate={handleAddTemplate}
                editingStrategy={editingStrategy}
            />
        </div>
    );
};

export default CollectionFlows;
