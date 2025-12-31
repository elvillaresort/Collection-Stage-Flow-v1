import React, { useState, useMemo } from 'react';
import {
    Scale, AlertTriangle, CheckCircle2, Clock, XCircle, FileText, User, Calendar,
    Search, Filter, Plus, X, Send, Paperclip, Shield, Building2, Phone, Mail,
    MessageSquare, TrendingUp, AlertCircle, ChevronRight, Loader2, Eye, Edit3,
    Archive, Flag, UserCheck, FileCheck, Gavel, ShieldAlert, Info
} from 'lucide-react';
import { Complaint, ComplaintStatus, ComplaintCategory, User as UserType, Debtor, SystemSettings } from '../types';

interface DisputesManagementProps {
    complaints: Complaint[];
    portfolio: Debtor[];
    user: UserType;
    settings: SystemSettings;
    onAddComplaint: (complaint: Complaint) => void;
    onUpdateComplaint: (complaint: Complaint) => void;
    onResolveComplaint: (id: string, resolution: string) => void;
}

const DUMMY_COMPLAINTS: Complaint[] = [
    {
        id: 'CMP-001',
        debtorId: 'DBT-001',
        debtorName: 'Maria Santos',
        loanId: 'LN-2024-001',
        category: ComplaintCategory.HARASSMENT,
        description: 'Alleged excessive calls during prohibited hours (before 8 AM and after 8 PM) in violation of BSP Circular No. 454.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: ComplaintStatus.UNDER_INVESTIGATION,
        severity: 8,
        assignedTo: 'Compliance Officer',
        bspReferenceNumber: 'BSP-2024-12345',
        responseDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        escalationLevel: 'BSP',
        npcCompliance: true,
        communicationLog: [
            { timestamp: new Date().toISOString(), action: 'Complaint Filed', performedBy: 'System', notes: 'Auto-logged from debtor portal' },
            { timestamp: new Date().toISOString(), action: 'Assigned to Compliance', performedBy: 'Admin', notes: 'High priority - BSP regulation violation' }
        ]
    },
    {
        id: 'CMP-002',
        debtorId: 'DBT-002',
        debtorName: 'Juan Dela Cruz',
        loanId: 'LN-2024-002',
        category: ComplaintCategory.PAYMENT_DISCREPANCY,
        description: 'Debtor claims payment of ₱15,000 was not properly credited to account. Requesting transaction verification.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: ComplaintStatus.NEW,
        severity: 6,
        escalationLevel: 'INTERNAL',
        responseDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'CMP-003',
        debtorId: 'DBT-003',
        debtorName: 'Ana Reyes',
        loanId: 'LN-2024-003',
        category: ComplaintCategory.IDENTITY_THEFT,
        description: 'Debtor claims loan was taken out fraudulently using stolen identity documents. NBI clearance and affidavit submitted.',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: ComplaintStatus.RESOLVED,
        severity: 10,
        resolution: 'Account frozen pending investigation. Referred to legal department and NBI Cybercrime Division. Debtor cleared of liability.',
        resolutionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        escalationLevel: 'LEGAL',
        npcCompliance: true,
        dtiReferenceNumber: 'DTI-NCR-2024-5678'
    }
];

const DisputesManagement: React.FC<DisputesManagementProps> = ({
    complaints: initialComplaints = [],
    portfolio,
    user,
    settings,
    onAddComplaint,
    onUpdateComplaint,
    onResolveComplaint
}) => {
    const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints.length > 0 ? initialComplaints : DUMMY_COMPLAINTS);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [showNewComplaintModal, setShowNewComplaintModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'ALL'>('ALL');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Complaint Form
    const [newComplaint, setNewComplaint] = useState({
        debtorId: '',
        category: ComplaintCategory.SERVICE,
        description: '',
        severity: 5,
        escalationLevel: 'INTERNAL' as const
    });

    // Resolution Form
    const [resolutionText, setResolutionText] = useState('');

    const sym = settings.localization.currencySymbol;

    const filteredComplaints = useMemo(() => {
        return complaints.filter(c => {
            const matchesSearch = c.debtorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.loanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
            const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
            return matchesSearch && matchesStatus && matchesCategory;
        });
    }, [complaints, searchQuery, statusFilter, categoryFilter]);

    const stats = useMemo(() => {
        return {
            total: complaints.length,
            new: complaints.filter(c => c.status === ComplaintStatus.NEW).length,
            investigating: complaints.filter(c => c.status === ComplaintStatus.UNDER_INVESTIGATION).length,
            resolved: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
            critical: complaints.filter(c => c.severity >= 8).length,
            bspEscalated: complaints.filter(c => c.escalationLevel === 'BSP').length
        };
    }, [complaints]);

    const handleSubmitComplaint = () => {
        if (!newComplaint.debtorId || !newComplaint.description) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            const debtor = portfolio.find(d => d.id === newComplaint.debtorId);
            const complaint: Complaint = {
                id: `CMP-${Date.now()}`,
                debtorId: newComplaint.debtorId,
                debtorName: debtor?.name || 'Unknown',
                loanId: debtor?.loanId || 'N/A',
                category: newComplaint.category,
                description: newComplaint.description,
                timestamp: new Date().toISOString(),
                status: ComplaintStatus.NEW,
                severity: newComplaint.severity,
                escalationLevel: newComplaint.escalationLevel,
                assignedTo: user.name,
                responseDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                communicationLog: [{
                    timestamp: new Date().toISOString(),
                    action: 'Complaint Created',
                    performedBy: user.name,
                    notes: 'Initial complaint registration'
                }]
            };

            setComplaints(prev => [complaint, ...prev]);
            onAddComplaint(complaint);
            setShowNewComplaintModal(false);
            setNewComplaint({
                debtorId: '',
                category: ComplaintCategory.SERVICE,
                description: '',
                severity: 5,
                escalationLevel: 'INTERNAL'
            });
            setIsSubmitting(false);
            alert('Complaint registered successfully');
        }, 1000);
    };

    const handleResolveComplaint = () => {
        if (!selectedComplaint || !resolutionText) {
            alert('Please provide resolution details');
            return;
        }

        const updated: Complaint = {
            ...selectedComplaint,
            status: ComplaintStatus.RESOLVED,
            resolution: resolutionText,
            resolutionDate: new Date().toISOString(),
            communicationLog: [
                ...(selectedComplaint.communicationLog || []),
                {
                    timestamp: new Date().toISOString(),
                    action: 'Complaint Resolved',
                    performedBy: user.name,
                    notes: resolutionText
                }
            ]
        };

        setComplaints(prev => prev.map(c => c.id === updated.id ? updated : c));
        onUpdateComplaint(updated);
        onResolveComplaint(updated.id, resolutionText);
        setShowDetailsModal(false);
        setResolutionText('');
        alert('Complaint resolved successfully');
    };

    const getStatusColor = (status: ComplaintStatus) => {
        switch (status) {
            case ComplaintStatus.NEW: return 'bg-blue-50 text-blue-600 border-blue-100';
            case ComplaintStatus.UNDER_INVESTIGATION: return 'bg-amber-50 text-amber-600 border-amber-100';
            case ComplaintStatus.RESOLVED: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case ComplaintStatus.DISMISSED: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusIcon = (status: ComplaintStatus) => {
        switch (status) {
            case ComplaintStatus.NEW: return AlertCircle;
            case ComplaintStatus.UNDER_INVESTIGATION: return Clock;
            case ComplaintStatus.RESOLVED: return CheckCircle2;
            case ComplaintStatus.DISMISSED: return XCircle;
        }
    };

    const getSeverityColor = (severity: number) => {
        if (severity >= 8) return 'text-rose-600';
        if (severity >= 5) return 'text-amber-600';
        return 'text-emerald-600';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Scale size={28} className="text-blue-600" />
                        Disputes & Grievances Management
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 text-sm">
                        Philippine Regulatory Compliance • BSP Circular 454 • Data Privacy Act 10173
                    </p>
                </div>
                <button
                    onClick={() => setShowNewComplaintModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> Register Complaint
                </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'Total Cases', value: stats.total, icon: FileText, color: 'slate' },
                    { label: 'New', value: stats.new, icon: AlertCircle, color: 'blue' },
                    { label: 'Investigating', value: stats.investigating, icon: Clock, color: 'amber' },
                    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'emerald' },
                    { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'rose' },
                    { label: 'BSP Escalated', value: stats.bspEscalated, icon: Building2, color: 'purple' }
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, loan ID, or description..."
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
                        <option value="ALL">All Statuses</option>
                        {Object.values(ComplaintStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <select
                        title="Filter by category"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as any)}
                        className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                        <option value="ALL">All Categories</option>
                        {Object.values(ComplaintCategory).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Complaints List */}
            <div className="space-y-4">
                {filteredComplaints.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                        <Scale size={64} className="text-slate-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No Complaints Found</h3>
                        <p className="text-slate-500 font-medium">No disputes match your current filters</p>
                    </div>
                ) : (
                    filteredComplaints.map(complaint => {
                        const StatusIcon = getStatusIcon(complaint.status);
                        return (
                            <div
                                key={complaint.id}
                                className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                                onClick={() => { setSelectedComplaint(complaint); setShowDetailsModal(true); }}
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${complaint.severity >= 8 ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    <Scale size={24} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-black text-slate-900">{complaint.debtorName}</h3>
                                                        <span className="text-xs font-black text-slate-400 font-mono">{complaint.loanId}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(complaint.status)}`}>
                                                            {complaint.status}
                                                        </span>
                                                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-100">
                                                            {complaint.category}
                                                        </span>
                                                        {complaint.escalationLevel && complaint.escalationLevel !== 'INTERNAL' && (
                                                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-100 flex items-center gap-1">
                                                                <Flag size={10} /> {complaint.escalationLevel}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`text-2xl font-black ${getSeverityColor(complaint.severity)}`}>
                                                    {complaint.severity}/10
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">
                                            {complaint.description}
                                        </p>

                                        <div className="flex items-center gap-6 text-xs text-slate-400 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(complaint.timestamp).toLocaleDateString()}
                                            </div>
                                            {complaint.assignedTo && (
                                                <div className="flex items-center gap-2">
                                                    <UserCheck size={14} />
                                                    {complaint.assignedTo}
                                                </div>
                                            )}
                                            {complaint.responseDeadline && (
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} />
                                                    Due: {new Date(complaint.responseDeadline).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>

                                        {(complaint.bspReferenceNumber || complaint.dtiReferenceNumber || complaint.ntcReferenceNumber) && (
                                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {complaint.bspReferenceNumber && <span>BSP: {complaint.bspReferenceNumber}</span>}
                                                {complaint.dtiReferenceNumber && <span>DTI: {complaint.dtiReferenceNumber}</span>}
                                                {complaint.ntcReferenceNumber && <span>NTC: {complaint.ntcReferenceNumber}</span>}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center">
                                        <ChevronRight size={24} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* New Complaint Modal */}
            {showNewComplaintModal && (
                <div className="fixed inset-0 z-[5000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-10 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl">
                                    <Plus size={28} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Register New Complaint</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Dispute Resolution System</p>
                                </div>
                            </div>
                            <button title="Close" onClick={() => setShowNewComplaintModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <span className="text-rose-500">*</span> Select Debtor
                                </label>
                                <select
                                    title="Select debtor"
                                    value={newComplaint.debtorId}
                                    onChange={(e) => setNewComplaint({ ...newComplaint, debtorId: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-600 transition-all outline-none"
                                >
                                    <option value="">-- Select Debtor --</option>
                                    {portfolio.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.loanId})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <span className="text-rose-500">*</span> Complaint Category
                                </label>
                                <select
                                    title="Select complaint category"
                                    value={newComplaint.category}
                                    onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value as ComplaintCategory })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-600 transition-all outline-none"
                                >
                                    {Object.values(ComplaintCategory).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <span className="text-rose-500">*</span> Description
                                </label>
                                <textarea
                                    value={newComplaint.description}
                                    onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                                    rows={6}
                                    placeholder="Provide detailed description of the complaint..."
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-600 transition-all outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Severity (1-10)</label>
                                    <input
                                        title="Severity level"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={newComplaint.severity}
                                        onChange={(e) => setNewComplaint({ ...newComplaint, severity: parseInt(e.target.value) || 5 })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-600 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Escalation Level</label>
                                    <select
                                        title="Select escalation level"
                                        value={newComplaint.escalationLevel}
                                        onChange={(e) => setNewComplaint({ ...newComplaint, escalationLevel: e.target.value as any })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-600 transition-all outline-none"
                                    >
                                        <option value="INTERNAL">Internal</option>
                                        <option value="BSP">BSP (Bangko Sentral)</option>
                                        <option value="DTI">DTI (Consumer Welfare)</option>
                                        <option value="NTC">NTC (Telecom)</option>
                                        <option value="NPC">NPC (Privacy)</option>
                                        <option value="LEGAL">Legal Department</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-100">
                                <div className="flex items-start gap-3">
                                    <Info size={20} className="text-amber-600 mt-0.5" />
                                    <div className="text-left">
                                        <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-2">Philippine Regulatory Compliance</h4>
                                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                            All complaints are handled in accordance with BSP Circular 454 (Fair Debt Collection Practices),
                                            Data Privacy Act 10173, and relevant DTI/NTC regulations. Response timelines are automatically tracked.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowNewComplaintModal(false)}
                                    className="flex-1 py-4 text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitComplaint}
                                    disabled={isSubmitting}
                                    className="flex-1 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    Submit Complaint
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Complaint Details Modal */}
            {showDetailsModal && selectedComplaint && (
                <div className="fixed inset-0 z-[5000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
                        <div className="p-10 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl ${selectedComplaint.severity >= 8 ? 'bg-rose-600' : 'bg-blue-600'} text-white shadow-xl`}>
                                    <Scale size={28} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedComplaint.debtorName}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                        {selectedComplaint.loanId} • {selectedComplaint.category}
                                    </p>
                                </div>
                            </div>
                            <button title="Close" onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-thin">
                            {/* Status & Severity */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Current Status</p>
                                    <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border inline-flex items-center gap-2 ${getStatusColor(selectedComplaint.status)}`}>
                                        {React.createElement(getStatusIcon(selectedComplaint.status), { size: 16 })}
                                        {selectedComplaint.status}
                                    </span>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Severity Level</p>
                                    <div className={`text-4xl font-black ${getSeverityColor(selectedComplaint.severity)}`}>
                                        {selectedComplaint.severity}/10
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Complaint Description</h4>
                                <p className="text-sm text-slate-700 font-medium leading-relaxed p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    {selectedComplaint.description}
                                </p>
                            </div>

                            {/* Regulatory References */}
                            {(selectedComplaint.bspReferenceNumber || selectedComplaint.dtiReferenceNumber || selectedComplaint.ntcReferenceNumber) && (
                                <div className="p-6 bg-purple-50 rounded-3xl border-2 border-purple-100">
                                    <h4 className="text-[10px] font-black text-purple-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Building2 size={14} /> Regulatory References
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {selectedComplaint.bspReferenceNumber && (
                                            <div>
                                                <p className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">BSP Reference</p>
                                                <p className="text-sm font-black text-purple-900 mt-1">{selectedComplaint.bspReferenceNumber}</p>
                                            </div>
                                        )}
                                        {selectedComplaint.dtiReferenceNumber && (
                                            <div>
                                                <p className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">DTI Reference</p>
                                                <p className="text-sm font-black text-purple-900 mt-1">{selectedComplaint.dtiReferenceNumber}</p>
                                            </div>
                                        )}
                                        {selectedComplaint.ntcReferenceNumber && (
                                            <div>
                                                <p className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">NTC Reference</p>
                                                <p className="text-sm font-black text-purple-900 mt-1">{selectedComplaint.ntcReferenceNumber}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Communication Log */}
                            {selectedComplaint.communicationLog && selectedComplaint.communicationLog.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <MessageSquare size={14} /> Activity Timeline
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedComplaint.communicationLog.map((log, i) => (
                                            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                                                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-xs font-black text-slate-900">{log.action}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
                                                    </div>
                                                    <p className="text-xs text-slate-600 font-medium">{log.notes}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1">By: {log.performedBy}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Resolution Section */}
                            {selectedComplaint.status === ComplaintStatus.RESOLVED ? (
                                <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-100">
                                    <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Resolution
                                    </h4>
                                    <p className="text-sm text-emerald-700 font-medium leading-relaxed mb-3">{selectedComplaint.resolution}</p>
                                    <p className="text-[10px] font-bold text-emerald-600">
                                        Resolved on: {selectedComplaint.resolutionDate && new Date(selectedComplaint.resolutionDate).toLocaleString()}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolve Complaint</h4>
                                    <textarea
                                        value={resolutionText}
                                        onChange={(e) => setResolutionText(e.target.value)}
                                        rows={4}
                                        placeholder="Enter resolution details..."
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all outline-none resize-none"
                                    />
                                    <button
                                        onClick={handleResolveComplaint}
                                        className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle2 size={18} />
                                        Mark as Resolved
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisputesManagement;
