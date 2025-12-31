import React, { useState, useEffect } from 'react';
import {
    Shuffle, Settings, TrendingUp, AlertTriangle, Clock, Users, Target,
    ChevronRight, Check, X, Loader2, Sparkles, Bot, Play, BarChart3,
    Calendar, DollarSign, Activity, Zap, RefreshCw, Filter, Info
} from 'lucide-react';
import { Debtor, User, SystemSettings, CaseStatus } from '../types';

interface SmartReshuffleProps {
    portfolio: Debtor[];
    systemUsers: User[];
    settings: SystemSettings;
    onReshuffleComplete: (assignments: { debtorId: string; agentId: string }[]) => void;
    onClose: () => void;
}

interface ReshuffleConfig {
    enabled: boolean;
    priority: number;
    threshold?: number;
    value?: string;
}

interface ReshuffleCriteria {
    stagnantDays: ReshuffleConfig;
    neverTouched: ReshuffleConfig;
    brokenPTP: ReshuffleConfig;
    highValue: ReshuffleConfig;
    overdueDays: ReshuffleConfig;
    riskScore: ReshuffleConfig;
    lastContactDays: ReshuffleConfig;
}

interface AgentPerformance {
    agentId: string;
    agentName: string;
    currentLoad: number;
    successRate: number;
    avgResponseTime: number;
    specialization: string[];
    capacity: number;
}

const SmartReshuffle: React.FC<SmartReshuffleProps> = ({
    portfolio,
    systemUsers,
    settings,
    onReshuffleComplete,
    onClose
}) => {
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    // Reshuffle Criteria Configuration
    const [criteria, setCriteria] = useState<ReshuffleCriteria>({
        stagnantDays: { enabled: true, priority: 1, threshold: 30 },
        neverTouched: { enabled: true, priority: 2 },
        brokenPTP: { enabled: true, priority: 3 },
        highValue: { enabled: true, priority: 4, threshold: 50000 },
        overdueDays: { enabled: true, priority: 5, threshold: 90 },
        riskScore: { enabled: true, priority: 6, value: 'Critical' },
        lastContactDays: { enabled: true, priority: 7, threshold: 15 }
    });

    // Advanced Options
    const [balanceWorkload, setBalanceWorkload] = useState(true);
    const [respectSpecialization, setRespectSpecialization] = useState(true);
    const [preserveRelationships, setPreserveRelationships] = useState(false);
    const [autoExecute, setAutoExecute] = useState(false);

    // Results
    const [affectedAccounts, setAffectedAccounts] = useState<Debtor[]>([]);
    const [proposedAssignments, setProposedAssignments] = useState<{ debtorId: string; agentId: string; reason: string; oldAgentId?: string }[]>([]);
    const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);

    // Calculate agent performance metrics
    useEffect(() => {
        const agents = systemUsers.filter(u => u.role === 'AGENT' || u.role === 'FIELD_AGENT');
        const performance: AgentPerformance[] = agents.map(agent => {
            const assignedDebtors = portfolio.filter(d => d.assignedAgentId === agent.id);
            const successfulCases = assignedDebtors.filter(d => d.status === CaseStatus.SETTLED || d.status === CaseStatus.PROMISE_TO_PAY).length;

            return {
                agentId: agent.id,
                agentName: agent.name,
                currentLoad: assignedDebtors.length,
                successRate: assignedDebtors.length > 0 ? (successfulCases / assignedDebtors.length) * 100 : 0,
                avgResponseTime: Math.random() * 24, // Simulated - would come from actual data
                specialization: ['High-Value', 'Legal'], // Simulated - would come from agent profile
                capacity: 50 // Simulated - would be configurable per agent
            };
        });

        setAgentPerformance(performance);
    }, [portfolio, systemUsers]);

    // Analyze accounts based on criteria
    const analyzeAccounts = () => {
        const affected: Debtor[] = [];
        const today = new Date();

        portfolio.forEach(debtor => {
            let shouldReshuffle = false;
            let reasons: string[] = [];

            // Check each criterion
            if (criteria.stagnantDays.enabled && debtor.lastContactDate) {
                const daysSinceContact = Math.floor((today.getTime() - new Date(debtor.lastContactDate).getTime()) / (1000 * 60 * 60 * 24));
                if (daysSinceContact >= (criteria.stagnantDays.threshold || 30)) {
                    shouldReshuffle = true;
                    reasons.push(`Stagnant for ${daysSinceContact} days`);
                }
            }

            if (criteria.neverTouched.enabled && !debtor.lastContactDate) {
                shouldReshuffle = true;
                reasons.push('Never contacted');
            }

            if (criteria.brokenPTP.enabled && debtor.status === CaseStatus.BROKEN_PROMISE) {
                shouldReshuffle = true;
                reasons.push('Broken Promise to Pay');
            }

            if (criteria.highValue.enabled && debtor.amountDue >= (criteria.highValue.threshold || 50000)) {
                shouldReshuffle = true;
                reasons.push(`High value: ${settings.localization.currencySymbol}${debtor.amountDue.toLocaleString()}`);
            }

            if (criteria.overdueDays.enabled && debtor.overdueDays >= (criteria.overdueDays.threshold || 90)) {
                shouldReshuffle = true;
                reasons.push(`${debtor.overdueDays} days overdue`);
            }

            if (criteria.riskScore.enabled && debtor.riskScore === criteria.riskScore.value) {
                shouldReshuffle = true;
                reasons.push(`${debtor.riskScore} risk`);
            }

            if (shouldReshuffle) {
                affected.push(debtor);
            }
        });

        setAffectedAccounts(affected);
        return affected;
    };

    // Generate smart assignments using AI-like logic
    const generateAssignments = () => {
        const assignments: { debtorId: string; agentId: string; reason: string; oldAgentId?: string }[] = [];
        const affected = affectedAccounts.length > 0 ? affectedAccounts : analyzeAccounts();

        // Sort agents by performance and availability
        const availableAgents = [...agentPerformance].sort((a, b) => {
            if (balanceWorkload) {
                // Prioritize agents with lower workload
                return a.currentLoad - b.currentLoad;
            }
            // Prioritize agents with higher success rate
            return b.successRate - a.successRate;
        });

        affected.forEach(debtor => {
            let bestAgent: AgentPerformance | null = null;
            let assignmentReason = '';

            // Find best agent based on criteria
            for (const agent of availableAgents) {
                // Skip if agent is at capacity
                if (balanceWorkload && agent.currentLoad >= agent.capacity) continue;

                // Skip if preserving relationships and debtor already has this agent
                if (preserveRelationships && debtor.assignedAgentId === agent.agentId) {
                    bestAgent = agent;
                    assignmentReason = 'Relationship preserved';
                    break;
                }

                // Check specialization match
                if (respectSpecialization) {
                    if (debtor.amountDue > 100000 && agent.specialization.includes('High-Value')) {
                        bestAgent = agent;
                        assignmentReason = 'High-value specialist match';
                        break;
                    }
                    if (debtor.status === CaseStatus.LEGAL && agent.specialization.includes('Legal')) {
                        bestAgent = agent;
                        assignmentReason = 'Legal specialist match';
                        break;
                    }
                }

                // Default: assign to agent with best success rate and capacity
                if (!bestAgent || agent.successRate > bestAgent.successRate) {
                    bestAgent = agent;
                    assignmentReason = `Best performer (${agent.successRate.toFixed(0)}% success rate)`;
                }
            }

            if (bestAgent) {
                assignments.push({
                    debtorId: debtor.id,
                    agentId: bestAgent.agentId,
                    reason: assignmentReason,
                    oldAgentId: debtor.assignedAgentId
                });

                // Update agent load for next iteration
                const agentIndex = availableAgents.findIndex(a => a.agentId === bestAgent!.agentId);
                if (agentIndex !== -1) {
                    availableAgents[agentIndex].currentLoad++;
                }
            }
        });

        setProposedAssignments(assignments);
        return assignments;
    };

    const executeReshuffle = async () => {
        setIsProcessing(true);
        setProgress(0);

        // Simulate processing with progress
        const totalSteps = proposedAssignments.length;
        for (let i = 0; i < totalSteps; i++) {
            await new Promise(resolve => setTimeout(resolve, 50));
            setProgress(((i + 1) / totalSteps) * 100);
        }

        // Execute the reshuffle
        onReshuffleComplete(proposedAssignments.map(a => ({ debtorId: a.debtorId, agentId: a.agentId })));

        setIsProcessing(false);
        setProgress(100);
    };

    const handleNext = () => {
        if (step === 1) {
            analyzeAccounts();
            setStep(2);
        } else if (step === 2) {
            generateAssignments();
            setStep(3);
        } else if (step === 3) {
            if (autoExecute) {
                executeReshuffle();
            } else {
                setStep(4);
            }
        }
    };

    const updateCriteria = (key: keyof ReshuffleCriteria, updates: Partial<ReshuffleConfig>) => {
        setCriteria(prev => ({
            ...prev,
            [key]: { ...prev[key], ...updates }
        }));
    };

    const sym = settings.localization.currencySymbol;

    return (
        <div className="fixed inset-0 z-[3000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="bg-white w-full max-w-7xl h-[90vh] rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col border border-white/20">

                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <Shuffle size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Smart Reshuffle Engine</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">AI-Powered Account Reallocation • Anti-Stagnation Protocol</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/50 rounded-2xl transition-all active:scale-90"
                        title="Close Modal"
                    >
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-8 py-6 border-b border-slate-100 bg-white flex gap-4 overflow-x-auto scrollbar-none shrink-0">
                    {[
                        { s: 1, l: 'Configure Criteria', i: Settings },
                        { s: 2, l: 'Analyze Accounts', i: BarChart3 },
                        { s: 3, l: 'Review Assignments', i: Users },
                        { s: 4, l: 'Execute Reshuffle', i: Zap }
                    ].map(ph => (
                        <div key={ph.s} className={`flex items-center gap-4 transition-all ${step === ph.s ? 'text-blue-600' : step > ph.s ? 'text-emerald-500' : 'text-slate-300'}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${step === ph.s ? 'bg-blue-600 text-white border-blue-600 shadow-lg' :
                                step > ph.s ? 'bg-emerald-500 text-white border-emerald-500' :
                                    'bg-slate-50 border-slate-200 text-slate-300'
                                }`}>
                                {step > ph.s ? <Check size={24} /> : <ph.i size={24} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{ph.l}</span>
                                <span className="text-[9px] font-bold uppercase opacity-50 tracking-wider mt-0.5">Step {ph.s}</span>
                            </div>
                            {ph.s < 4 && <ChevronRight size={16} className="ml-2 opacity-20" />}
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 scrollbar-thin">

                    {/* Step 1: Configure Criteria */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                            <div className="text-left">
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <Target className="text-blue-600" size={28} />
                                    Reshuffle Criteria Configuration
                                </h4>
                                <p className="text-sm text-slate-500 font-medium mt-2 max-w-3xl">
                                    Define the conditions that trigger account reallocation. Accounts matching any enabled criterion will be flagged for reassignment.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Stagnant Days */}
                                <div className={`p-6 bg-white border-2 rounded-[2rem] transition-all ${criteria.stagnantDays.enabled ? 'border-blue-200 shadow-lg' : 'border-slate-100'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${criteria.stagnantDays.enabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <Clock size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-black text-slate-900">Stagnant Accounts</h5>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">No activity for extended period</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateCriteria('stagnantDays', { enabled: !criteria.stagnantDays.enabled })}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${criteria.stagnantDays.enabled ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}
                                        >
                                            {criteria.stagnantDays.enabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                    {criteria.stagnantDays.enabled && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days Threshold</label>
                                            <input
                                                type="number"
                                                value={criteria.stagnantDays.threshold}
                                                onChange={(e) => updateCriteria('stagnantDays', { threshold: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                placeholder="30"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Never Touched */}
                                <div className={`p-6 bg-white border-2 rounded-[2rem] transition-all ${criteria.neverTouched.enabled ? 'border-amber-200 shadow-lg' : 'border-slate-100'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${criteria.neverTouched.enabled ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-black text-slate-900">Never Contacted</h5>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Zero engagement history</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateCriteria('neverTouched', { enabled: !criteria.neverTouched.enabled })}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${criteria.neverTouched.enabled ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}
                                        >
                                            {criteria.neverTouched.enabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                </div>

                                {/* Broken PTP */}
                                <div className={`p-6 bg-white border-2 rounded-[2rem] transition-all ${criteria.brokenPTP.enabled ? 'border-rose-200 shadow-lg' : 'border-slate-100'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${criteria.brokenPTP.enabled ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <X size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-black text-slate-900">Broken Promises</h5>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Failed payment commitments</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateCriteria('brokenPTP', { enabled: !criteria.brokenPTP.enabled })}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${criteria.brokenPTP.enabled ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}
                                        >
                                            {criteria.brokenPTP.enabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                </div>

                                {/* High Value */}
                                <div className={`p-6 bg-white border-2 rounded-[2rem] transition-all ${criteria.highValue.enabled ? 'border-emerald-200 shadow-lg' : 'border-slate-100'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${criteria.highValue.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <DollarSign size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-black text-slate-900">High Value Accounts</h5>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Above threshold amount</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateCriteria('highValue', { enabled: !criteria.highValue.enabled })}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${criteria.highValue.enabled ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}
                                        >
                                            {criteria.highValue.enabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                    {criteria.highValue.enabled && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Threshold ({sym})</label>
                                            <input
                                                type="number"
                                                value={criteria.highValue.threshold}
                                                onChange={(e) => updateCriteria('highValue', { threshold: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                                placeholder="50000"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Overdue Days */}
                                <div className={`p-6 bg-white border-2 rounded-[2rem] transition-all ${criteria.overdueDays.enabled ? 'border-purple-200 shadow-lg' : 'border-slate-100'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${criteria.overdueDays.enabled ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-black text-slate-900">Overdue Period</h5>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Days past due threshold</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateCriteria('overdueDays', { enabled: !criteria.overdueDays.enabled })}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${criteria.overdueDays.enabled ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}
                                        >
                                            {criteria.overdueDays.enabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                    {criteria.overdueDays.enabled && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days Threshold</label>
                                            <input
                                                type="number"
                                                value={criteria.overdueDays.threshold}
                                                onChange={(e) => updateCriteria('overdueDays', { threshold: parseInt(e.target.value) })}
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                                                placeholder="90"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Risk Score */}
                                <div className={`p-6 bg-white border-2 rounded-[2rem] transition-all ${criteria.riskScore.enabled ? 'border-red-200 shadow-lg' : 'border-slate-100'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${criteria.riskScore.enabled ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <Activity size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-black text-slate-900">Risk Classification</h5>
                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Specific risk tier</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateCriteria('riskScore', { enabled: !criteria.riskScore.enabled })}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${criteria.riskScore.enabled ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'
                                                }`}
                                        >
                                            {criteria.riskScore.enabled ? 'Enabled' : 'Disabled'}
                                        </button>
                                    </div>
                                    {criteria.riskScore.enabled && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Level</label>
                                            <select
                                                value={criteria.riskScore.value}
                                                onChange={(e) => updateCriteria('riskScore', { value: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                                                title="Select Risk Level"
                                            >
                                                <option value="Critical">Critical</option>
                                                <option value="High">High</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Low">Low</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Advanced Options */}
                            <div className="p-8 bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-sm">
                                <h5 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <Settings className="text-blue-600" size={24} />
                                    Advanced Options
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Users size={20} className="text-slate-400" />
                                            <div>
                                                <span className="text-sm font-black text-slate-900 block">Balance Workload</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Distribute evenly across agents</span>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={balanceWorkload}
                                            onChange={(e) => setBalanceWorkload(e.target.checked)}
                                            className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Target size={20} className="text-slate-400" />
                                            <div>
                                                <span className="text-sm font-black text-slate-900 block">Respect Specialization</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Match to agent expertise</span>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={respectSpecialization}
                                            onChange={(e) => setRespectSpecialization(e.target.checked)}
                                            className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Activity size={20} className="text-slate-400" />
                                            <div>
                                                <span className="text-sm font-black text-slate-900 block">Preserve Relationships</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Keep existing agent if possible</span>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={preserveRelationships}
                                            onChange={(e) => setPreserveRelationships(e.target.checked)}
                                            className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Zap size={20} className="text-slate-400" />
                                            <div>
                                                <span className="text-sm font-black text-slate-900 block">Auto-Execute</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Apply changes immediately</span>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={autoExecute}
                                            onChange={(e) => setAutoExecute(e.target.checked)}
                                            className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Analysis Results */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                            <div className="text-left">
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <BarChart3 className="text-blue-600" size={28} />
                                    Analysis Results
                                </h4>
                                <p className="text-sm text-slate-500 font-medium mt-2">
                                    {affectedAccounts.length} accounts identified for reallocation based on configured criteria.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-[2rem] border-2 border-blue-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-blue-600 text-white rounded-xl">
                                            <Shuffle size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Affected Accounts</p>
                                            <p className="text-3xl font-black text-slate-900">{affectedAccounts.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-[2rem] border-2 border-emerald-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-emerald-600 text-white rounded-xl">
                                            <DollarSign size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Value</p>
                                            <p className="text-3xl font-black text-slate-900">
                                                {sym}{affectedAccounts.reduce((sum, d) => sum + d.amountDue, 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-[2rem] border-2 border-purple-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 bg-purple-600 text-white rounded-xl">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Active Agents</p>
                                            <p className="text-3xl font-black text-slate-900">{agentPerformance.length}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] overflow-hidden">
                                <div className="p-6 bg-slate-50 border-b border-slate-200">
                                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">Affected Accounts Preview</h5>
                                </div>
                                <div className="max-h-96 overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 sticky top-0">
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="px-6 py-4 text-left">Account</th>
                                                <th className="px-6 py-4 text-left">Amount Due</th>
                                                <th className="px-6 py-4 text-left">DPD</th>
                                                <th className="px-6 py-4 text-left">Risk</th>
                                                <th className="px-6 py-4 text-left">Current Agent</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {affectedAccounts.slice(0, 20).map(debtor => (
                                                <tr key={debtor.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-900">{debtor.name}</td>
                                                    <td className="px-6 py-4 font-black text-blue-600">{sym}{debtor.amountDue.toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-bold text-slate-600">{debtor.overdueDays}d</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${debtor.riskScore === 'Critical' ? 'bg-rose-100 text-rose-600' :
                                                            debtor.riskScore === 'High' ? 'bg-amber-100 text-amber-600' :
                                                                'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            {debtor.riskScore}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-500">
                                                        {systemUsers.find(u => u.id === debtor.assignedAgentId)?.name || 'Unassigned'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review Assignments */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                            <div className="text-left">
                                <h4 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <Users className="text-blue-600" size={28} />
                                    Proposed Assignments
                                </h4>
                                <p className="text-sm text-slate-500 font-medium mt-2">
                                    Review the AI-generated assignment recommendations before execution.
                                </p>
                            </div>

                            <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] overflow-hidden">
                                <div className="p-6 bg-slate-50 border-b border-slate-200">
                                    <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">Assignment Plan</h5>
                                </div>
                                <div className="max-h-[500px] overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 sticky top-0">
                                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="px-6 py-4 text-left">Account</th>
                                                <th className="px-6 py-4 text-left">Current Agent</th>
                                                <th className="px-6 py-4 text-center">→</th>
                                                <th className="px-6 py-4 text-left">New Agent</th>
                                                <th className="px-6 py-4 text-left">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {proposedAssignments.map(assignment => {
                                                const debtor = portfolio.find(d => d.id === assignment.debtorId);
                                                const oldAgent = systemUsers.find(u => u.id === assignment.oldAgentId);
                                                const newAgent = systemUsers.find(u => u.id === assignment.agentId);

                                                return (
                                                    <tr key={assignment.debtorId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-slate-900">{debtor?.name}</td>
                                                        <td className="px-6 py-4 font-medium text-slate-500">{oldAgent?.name || 'Unassigned'}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <ChevronRight size={16} className="text-blue-600 mx-auto" />
                                                        </td>
                                                        <td className="px-6 py-4 font-bold text-blue-600">{newAgent?.name}</td>
                                                        <td className="px-6 py-4 text-xs text-slate-500 italic">{assignment.reason}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Execute */}
                    {step === 4 && (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                            {isProcessing ? (
                                <>
                                    <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8 animate-pulse">
                                        <Loader2 size={48} className="animate-spin" />
                                    </div>
                                    <h4 className="text-3xl font-black text-slate-900 mb-4">Processing Reshuffle...</h4>
                                    <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto mb-8">
                                        Reallocating {proposedAssignments.length} accounts across {agentPerformance.length} agents.
                                    </p>
                                    <div className="w-full max-w-md">
                                        <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div
                                                ref={(el) => { if (el) el.style.width = `${progress}%`; }}
                                                className="h-full bg-blue-600 transition-all duration-300 shadow-[0_0_10px_#2563eb]"
                                            />
                                        </div>
                                        <p className="text-sm font-black text-slate-400 mt-3">{progress.toFixed(0)}% Complete</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-8">
                                        <Check size={48} />
                                    </div>
                                    <h4 className="text-3xl font-black text-slate-900 mb-4">Reshuffle Complete!</h4>
                                    <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto mb-8">
                                        Successfully reallocated {proposedAssignments.length} accounts. The changes have been applied to the portfolio.
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-black active:scale-95 transition-all"
                                    >
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step < 4 && (
                    <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center shrink-0">
                        <button
                            onClick={() => step > 1 && setStep(step - 1)}
                            disabled={step === 1}
                            className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            Back
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-12 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center gap-3"
                            >
                                {step === 3 ? (autoExecute ? 'Execute Now' : 'Review & Execute') : 'Continue'}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartReshuffle;
