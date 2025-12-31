import * as React from 'react';
import {
    AlertTriangle, Search, Plus, FileText, Upload, Download, CheckCircle, XCircle,
    Clock, User, Calendar, Tag, AlertCircle, Sparkles, Send, Eye, Edit, Trash2,
    Shield, Scale, Building2, Users, ChevronDown, ChevronRight, Paperclip, Bot,
    TrendingUp, FileCheck, MessageSquare, Filter, MoreVertical, File as FileIcon, ArrowRight
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Grievance, GrievanceCategory, EscalationLevel, GrievanceStatus, User as UserType, Debtor } from '../types';
import { supabaseService } from '../services/supabaseService';

const { useState, useMemo, useEffect } = React;

interface GrievancesProps {
    user: UserType;
    debtorAccounts: Debtor[];
}

const Grievances: React.FC<GrievancesProps> = ({ user, debtorAccounts }) => {
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<GrievanceStatus | 'ALL'>('ALL');
    const [filterPriority, setFilterPriority] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrievances = async () => {
            setLoading(true);
            const { data, error } = await supabaseService.getGrievances();
            if (!error && data) {
                setGrievances(data);
            }
            setLoading(false);
        };
        fetchGrievances();
    }, []);

    // New Grievance Form State
    const [newGrievance, setNewGrievance] = useState({
        debtorSearch: '',
        debtorId: '',
        debtorName: '',
        debtorAccount: '',
        debtorContact: '',
        complaintDescription: '',
        dateOfIncident: new Date().toISOString().split('T')[0],
        category: '' as GrievanceCategory,
        escalationLevel: 'INTERNAL' as EscalationLevel,
        priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        agentNarrative: '',
        evidence: [] as File[],
        disputedAmount: '',
        desiredResolution: '',
    });

    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<{
        category: GrievanceCategory;
        confidence: number;
        keyIssues: string[];
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    } | null>(null);

    const [generatingReport, setGeneratingReport] = useState(false);
    const [showReportPreview, setShowReportPreview] = useState(false);
    const [generatedReport, setGeneratedReport] = useState<string>('');
    const [letterhead, setLetterhead] = useState<string | null>(null);

    const categoryLabels: Record<GrievanceCategory, string> = {
        HARASSMENT: 'Harassment',
        UNFAIR_PRACTICE: 'Unfair Practice',
        PRIVACY_VIOLATION: 'Privacy Violation',
        INCORRECT_AMOUNT: 'Incorrect Amount',
        UNAUTHORIZED_CONTACT: 'Unauthorized Contact',
        THREATENING_BEHAVIOR: 'Threatening Behavior',
        IDENTITY_THEFT: 'Identity Theft',
        FRAUD_CLAIM: 'Fraud Claim',
        PAYMENT_DISPUTE: 'Payment Dispute',
        DATA_BREACH: 'Data Breach',
        OTHER: 'Other'
    };

    const escalationLabels: Record<EscalationLevel, string> = {
        INTERNAL: 'Internal Resolution',
        MANAGEMENT: 'Management Review',
        LEGAL_TEAM: 'Legal Team',
        DTI: 'Department of Trade and Industry (DTI)',
        NPC: 'National Privacy Commission (NPC)',
        SEC: 'Securities and Exchange Commission (SEC)',
        BARANGAY: 'Barangay',
        CLIENT_CREDITOR: 'Client/Creditor'
    };

    const statusColors: Record<GrievanceStatus, string> = {
        DRAFT: 'bg-slate-100 text-slate-700',
        PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
        UNDER_INVESTIGATION: 'bg-blue-100 text-blue-700',
        PENDING_APPROVAL: 'bg-purple-100 text-purple-700',
        APPROVED: 'bg-green-100 text-green-700',
        REJECTED: 'bg-red-100 text-red-700',
        ESCALATED: 'bg-orange-100 text-orange-700',
        RESOLVED: 'bg-emerald-100 text-emerald-700',
        CLOSED: 'bg-gray-100 text-gray-700'
    };

    const priorityColors = {
        LOW: 'bg-blue-100 text-blue-700',
        MEDIUM: 'bg-yellow-100 text-yellow-700',
        HIGH: 'bg-orange-100 text-orange-700',
        URGENT: 'bg-red-100 text-red-700'
    };

    // AI Analysis Function
    const analyzeComplaint = async () => {
        if (!newGrievance.complaintDescription) {
            alert('Please enter a complaint description first');
            return;
        }

        setAiAnalyzing(true);

        // Simulate AI analysis (in production, this would call an AI service)
        setTimeout(() => {
            const keywords = newGrievance.complaintDescription.toLowerCase();
            let suggestedCategory: GrievanceCategory = 'OTHER';
            let confidence = 0.75;
            const keyIssues: string[] = [];
            let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';

            // Simple keyword-based categorization (replace with actual AI)
            if (keywords.includes('harass') || keywords.includes('threaten') || keywords.includes('abuse')) {
                suggestedCategory = 'HARASSMENT';
                confidence = 0.9;
                riskLevel = 'HIGH';
                keyIssues.push('Potential harassment detected');
            } else if (keywords.includes('privacy') || keywords.includes('personal data') || keywords.includes('information')) {
                suggestedCategory = 'PRIVACY_VIOLATION';
                confidence = 0.85;
                riskLevel = 'HIGH';
                keyIssues.push('Privacy concerns identified');
            } else if (keywords.includes('amount') || keywords.includes('wrong') || keywords.includes('incorrect')) {
                suggestedCategory = 'INCORRECT_AMOUNT';
                confidence = 0.8;
                riskLevel = 'MEDIUM';
                keyIssues.push('Billing dispute detected');
            } else if (keywords.includes('fraud') || keywords.includes('scam')) {
                suggestedCategory = 'FRAUD_CLAIM';
                confidence = 0.95;
                riskLevel = 'CRITICAL';
                keyIssues.push('Fraud allegation - requires immediate attention');
            }

            setAiSuggestion({
                category: suggestedCategory,
                confidence,
                keyIssues,
                riskLevel
            });

            setNewGrievance(prev => ({ ...prev, category: suggestedCategory }));
            setAiAnalyzing(false);
        }, 2000);
    };

    // Debtor Search - Only show accounts assigned to current user
    const filteredDebtors = useMemo(() => {
        if (!newGrievance.debtorSearch) return [];
        const search = newGrievance.debtorSearch.toLowerCase();
        return debtorAccounts
            .filter(d => d.assignedAgentId === user.id) // Only show user's assigned accounts
            .filter(d =>
                d.name.toLowerCase().includes(search) ||
                d.loanId.toLowerCase().includes(search) ||
                d.phoneNumber?.toLowerCase().includes(search)
            )
            .slice(0, 5);
    }, [newGrievance.debtorSearch, debtorAccounts, user.id]);

    const selectDebtor = (debtor: Debtor) => {
        setNewGrievance(prev => ({
            ...prev,
            debtorId: debtor.id,
            debtorName: debtor.name,
            debtorAccount: debtor.loanId,
            debtorContact: debtor.phoneNumber || '',
            debtorSearch: debtor.name
        }));
    };

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewGrievance(prev => ({
                ...prev,
                evidence: [...prev.evidence, ...files]
            }));
        }
    };

    // Create Grievance
    const createGrievance = () => {
        // Fallback: If debtorName is empty but user typed in search, use the search text
        const finalDebtorName = newGrievance.debtorName || newGrievance.debtorSearch;

        const missingFields = [];
        if (!finalDebtorName) missingFields.push('Debtor Name');
        if (!newGrievance.complaintDescription) missingFields.push('Complaint Description');
        if (!newGrievance.category) missingFields.push('Category');
        if (!newGrievance.escalationLevel) missingFields.push('Escalation Level');

        if (missingFields.length > 0) {
            alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
            return;
        }

        const grievance: Grievance = {
            id: `GRV-${Date.now()}`,
            ticketNumber: `TKT-${Date.now()}`,
            debtorId: newGrievance.debtorId, // Might be empty if manual entry
            debtorName: finalDebtorName,
            debtorAccount: newGrievance.debtorAccount,
            debtorContact: newGrievance.debtorContact,
            category: newGrievance.category,
            aiSuggestedCategory: aiSuggestion?.category,
            complaintDescription: newGrievance.complaintDescription,
            dateOfIncident: newGrievance.dateOfIncident,
            agentNarratives: newGrievance.agentNarrative ? [{
                agentId: user.id,
                agentName: user.name,
                narrative: newGrievance.agentNarrative,
                timestamp: new Date().toISOString(),
                version: 1
            }] : [],
            aiAnalysis: aiSuggestion ? {
                suggestedCategory: aiSuggestion.category,
                confidence: aiSuggestion.confidence,
                keyIssues: aiSuggestion.keyIssues,
                riskLevel: aiSuggestion.riskLevel,
                recommendations: ['Review evidence', 'Contact debtor for clarification', 'Escalate if necessary'],
                analyzedAt: new Date().toISOString()
            } : undefined,
            evidence: [],
            escalationLevel: newGrievance.escalationLevel,
            status: 'DRAFT',
            priority: newGrievance.priority,
            approvalSteps: [
                { id: '1', approverRole: 'Team Leader', status: 'PENDING', order: 1 },
                { id: '2', approverRole: 'Operations Manager', status: 'PENDING', order: 2 },
                { id: '3', approverRole: 'Compliance Officer', status: 'PENDING', order: 3 }
            ],
            currentApprovalStep: 0,
            createdBy: user.name,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            clientNotified: false,
            disputedAmount: newGrievance.disputedAmount ? parseFloat(newGrievance.disputedAmount) : undefined,
            desiredResolution: newGrievance.desiredResolution
        };

        // Persist to Supabase
        supabaseService.createGrievance(grievance).then(({ error }) => {
            if (error) {
                console.error('Error creating grievance:', error);
                alert('Failed to save grievance to database.');
            } else {
                setGrievances(prev => [grievance, ...prev]);
                setShowCreateModal(false);
                resetForm();

                // Auto-open the detail view so user can generate report immediately
                setTimeout(() => setSelectedGrievance(grievance), 100);
            }
        });
    };

    const resetForm = () => {
        setNewGrievance({
            debtorSearch: '',
            debtorId: '',
            debtorName: '',
            debtorAccount: '',
            debtorContact: '',
            complaintDescription: '',
            dateOfIncident: new Date().toISOString().split('T')[0],
            category: '' as GrievanceCategory,
            escalationLevel: 'INTERNAL',
            priority: 'MEDIUM',
            agentNarrative: '',
            evidence: [],
            disputedAmount: '',
            desiredResolution: ''
        });
        setAiSuggestion(null);
    };

    // Generate AI Incident Report
    const generateIncidentReport = async (grievance: Grievance) => {
        setGeneratingReport(true);

        // Simulate AI report generation (in production, this would call an AI service)
        setTimeout(() => {
            const report = `
INCIDENT REPORT
═══════════════════════════════════════════════════════════════

PANLILIO'S CREDIT & COLLECTIONS SERVICES
Incident Report - ${grievance.ticketNumber}

Generated: ${new Date().toLocaleString()}
Generated By: ${user.name} (${user.employeeId})

═══════════════════════════════════════════════════════════════
CASE INFORMATION
═══════════════════════════════════════════════════════════════

Ticket Number: ${grievance.ticketNumber}
Date of Incident: ${new Date(grievance.dateOfIncident).toLocaleDateString()}
Category: ${categoryLabels[grievance.category]}
Priority Level: ${grievance.priority}
Escalation Level: ${escalationLabels[grievance.escalationLevel]}

═══════════════════════════════════════════════════════════════
DEBTOR INFORMATION
═══════════════════════════════════════════════════════════════

Name: ${grievance.debtorName}
Account Number: ${grievance.debtorAccount || 'N/A'}
Contact Number: ${grievance.debtorContact || 'N/A'}

═══════════════════════════════════════════════════════════════
FINANCIAL & RESOLUTION REQUEST
═══════════════════════════════════════════════════════════════

Disputed Amount: ${grievance.disputedAmount ? `PHP ${grievance.disputedAmount.toLocaleString()}` : 'N/A'}
Desired Resolution: ${grievance.desiredResolution || 'Not specified'}

═══════════════════════════════════════════════════════════════
COMPLAINT SUMMARY
═══════════════════════════════════════════════════════════════

${grievance.complaintDescription}

═══════════════════════════════════════════════════════════════
AGENT NARRATIVE
═══════════════════════════════════════════════════════════════

${grievance.agentNarratives.length > 0 ? grievance.agentNarratives[0].narrative : 'No agent narrative provided.'}

${grievance.aiAnalysis ? `
═══════════════════════════════════════════════════════════════
AI ANALYSIS
═══════════════════════════════════════════════════════════════

Risk Assessment: ${grievance.aiAnalysis.riskLevel}
Confidence Level: ${(grievance.aiAnalysis.confidence * 100).toFixed(0)}%
Suggested Category: ${categoryLabels[grievance.aiAnalysis.suggestedCategory]}

Key Issues Identified:
${grievance.aiAnalysis.keyIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

AI Recommendations:
${grievance.aiAnalysis.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
` : ''}

═══════════════════════════════════════════════════════════════
FINDINGS & RECOMMENDATIONS
═══════════════════════════════════════════════════════════════

Based on the information provided and AI analysis, the following findings
and recommendations are presented:

FINDINGS:
1. Complaint category identified as: ${categoryLabels[grievance.category]}
2. Risk level assessed as: ${grievance.aiAnalysis?.riskLevel || 'MEDIUM'}
3. ${grievance.evidence.length} piece(s) of evidence attached
4. Escalation to ${escalationLabels[grievance.escalationLevel]} recommended

RECOMMENDATIONS:
1. Immediate review by ${escalationLabels[grievance.escalationLevel]}
2. Contact debtor for clarification and resolution attempt
3. Document all communication and evidence
4. ${grievance.priority === 'URGENT' || grievance.priority === 'HIGH' ? 'URGENT: Prioritize this case for immediate action' : 'Follow standard resolution timeline'}
5. Ensure compliance with all regulatory requirements

═══════════════════════════════════════════════════════════════
APPROVAL STATUS
═══════════════════════════════════════════════════════════════

${grievance.approvalSteps.map((step, i) =>
                `Step ${step.order}: ${step.approverRole} - ${step.status}${step.approverName ? ` (${step.approverName})` : ''}`
            ).join('\n')}

═══════════════════════════════════════════════════════════════
EVIDENCE ATTACHED
═══════════════════════════════════════════════════════════════

${grievance.evidence.length > 0 ? grievance.evidence.map((ev, i) =>
                `${i + 1}. ${ev.fileName} (${ev.fileType}) - Uploaded by ${ev.uploadedBy}`
            ).join('\n') : 'No evidence attached'}

═══════════════════════════════════════════════════════════════

This report is generated for internal review and client communication.
All information contained herein is confidential and proprietary.

═══════════════════════════════════════════════════════════════
SIGNATORY
═══════════════════════════════════════════════════════════════

Prepared By:
_______________________________
${user.name}
${user.role}
Employee ID: ${user.employeeId}

Date: ${new Date().toLocaleDateString()}

Reviewed By:
_______________________________
[To be signed by authorized personnel]


═══════════════════════════════════════════════════════════════
END OF REPORT
═══════════════════════════════════════════════════════════════
            `.trim();

            setGeneratedReport(report);
            setShowReportPreview(true);
            setGeneratingReport(false);

            // Update grievance with incident report
            const updatedGrievance: Grievance = {
                ...grievance,
                incidentReport: {
                    id: `RPT-${Date.now()}`,
                    grievanceId: grievance.id,
                    generatedBy: user.name,
                    generatedAt: new Date().toISOString(),
                    title: `Incident Report - ${grievance.ticketNumber}`,
                    summary: grievance.complaintDescription.substring(0, 200),
                    findings: 'AI-generated findings based on complaint analysis',
                    recommendations: grievance.aiAnalysis?.recommendations.join('; ') || 'Standard resolution process',
                    status: 'GENERATED'
                }
            };

            setGrievances(prev => prev.map(g => g.id === grievance.id ? updatedGrievance : g));
        }, 2000);
    };

    // Download report as PDF (placeholder - would use actual PDF library)
    const handleLetterheadUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    setLetterhead(ev.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const downloadAsPDF = () => {
        const doc = new jsPDF();

        let yOffset = 20;

        // Add Letterhead
        if (letterhead) {
            const imgProps = doc.getImageProperties(letterhead);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            // Clamp height if too tall
            const textHeight = Math.min(pdfHeight, 60);
            doc.addImage(letterhead, 'JPEG', 0, 0, pdfWidth, textHeight);
            yOffset = textHeight + 15;
        } else {
            // Fallback default header if no letterhead
            doc.setFontSize(18);
            doc.setTextColor(0, 100, 0); // Emerald color
            doc.text("PANLILIO'S CREDIT & COLLECTIONS SERVICES", 105, 15, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            yOffset = 25;
        }

        doc.setFontSize(10);
        const splitText = doc.splitTextToSize(generatedReport, 180);

        // Pagination logic
        let currentHeight = yOffset;
        const pageHeight = doc.internal.pageSize.getHeight();

        splitText.forEach((line: string) => {
            if (currentHeight > pageHeight - 20) {
                doc.addPage();
                currentHeight = 20; // reset to top margin
            }
            doc.text(line, 15, currentHeight);
            currentHeight += 5; // line height
        });

        doc.save(`Incident_Report_${selectedGrievance?.ticketNumber}.pdf`);
    };

    const downloadAsWord = () => {
        const headerImage = letterhead ? `<img src="${letterhead}" style="width:100%; max-width: 600px;" /><br/><br/>` : '';
        // Convert newlines to breaks for HTML export
        const content = generatedReport.replace(/\n/g, '<br/>');

        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Incident Report</title></head>
            <body>
                <div style="font-family: Arial, sans-serif; font-size: 11pt;">
                    ${headerImage}
                    ${content}
                </div>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Incident_Report_${selectedGrievance?.ticketNumber}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter grievances
    const filteredGrievances = useMemo(() => {
        return grievances.filter(g => {
            const matchesSearch = g.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.debtorName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'ALL' || g.status === filterStatus;
            const matchesPriority = filterPriority === 'ALL' || g.priority === filterPriority;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [grievances, searchTerm, filterStatus, filterPriority]);

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dispute Management</h1>
                        <p className="text-sm text-slate-600 mt-1">AI-Powered Grievance Resolution System</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
                        title="Create New Dispute"
                    >
                        <Plus size={20} />
                        New Dispute
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by ticket number or debtor name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Search Disputes"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="px-4 py-2.5 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Filter by status"
                        title="Filter by status"
                    >
                        <option value="ALL">All Status</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING_REVIEW">Pending Review</option>
                        <option value="UNDER_INVESTIGATION">Under Investigation</option>
                        <option value="PENDING_APPROVAL">Pending Approval</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value as any)}
                        className="px-4 py-2.5 border-2 border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Filter by priority"
                        title="Filter by priority"
                    >
                        <option value="ALL">All Priority</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>
                </div>
            </div>

            {/* Grievances List */}
            <div className="flex-1 overflow-y-auto p-6">
                {filteredGrievances.length === 0 ? (
                    <div className="text-center py-20">
                        <AlertTriangle size={64} className="text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Disputes Found</h3>
                        <p className="text-slate-600">Create a new dispute to get started</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredGrievances.map(grievance => (
                            <div
                                key={grievance.id}
                                className="bg-white rounded-2xl p-6 shadow-sm border-2 border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => setSelectedGrievance(grievance)}
                                title={`View details for ${grievance.ticketNumber}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-black text-slate-900">{grievance.ticketNumber}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[grievance.status]}`}>
                                                {grievance.status.replace('_', ' ')}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColors[grievance.priority]}`}>
                                                {grievance.priority}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 font-semibold">{grievance.debtorName} • {grievance.debtorAccount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">{new Date(grievance.createdAt).toLocaleDateString()}</p>
                                        <p className="text-xs font-bold text-slate-700 mt-1">{categoryLabels[grievance.category]}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-700 mb-4 line-clamp-2">{grievance.complaintDescription}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <User size={14} />
                                            {grievance.createdBy}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Scale size={14} />
                                            {escalationLabels[grievance.escalationLevel]}
                                        </span>
                                        {grievance.evidence.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Paperclip size={14} />
                                                {grievance.evidence.length} files
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={(e) => { e.stopPropagation(); setSelectedGrievance(grievance); }} title="View Grievance Detail" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-90">
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                    {grievance.aiAnalysis && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-purple-600">
                                            <Sparkles size={14} />
                                            AI Analyzed
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Grievance Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black">Create New Dispute</h2>
                                    <p className="text-sm text-blue-100 mt-1">AI-Powered Grievance Management</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    aria-label="Close modal"
                                    title="Close modal"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Debtor Selection */}
                            <div>
                                <label htmlFor="debtor-search" className="block text-sm font-bold text-slate-900 mb-2">
                                    Select Debtor <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="debtor-search"
                                        type="text"
                                        placeholder="Search by name, loan ID, or phone number..."
                                        value={newGrievance.debtorSearch}
                                        onChange={(e) => setNewGrievance(prev => ({ ...prev, debtorSearch: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        title="Search for debtor"
                                    />
                                    {filteredDebtors.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                            {filteredDebtors.map(debtor => (
                                                <button
                                                    key={debtor.id}
                                                    onClick={() => selectDebtor(debtor)}
                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0"
                                                >
                                                    <div className="font-bold text-slate-900">{debtor.name}</div>
                                                    <div className="text-sm text-slate-600">{debtor.loanId} • {debtor.phoneNumber}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Info message about account assignment */}
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-start gap-2 text-xs text-blue-800">
                                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                        <div>
                                            <p className="font-bold">Only Your Assigned Accounts</p>
                                            <p className="text-blue-700 mt-1">You can only file disputes for accounts assigned to you. If the complaint is about an account assigned to another agent, that account must be reallocated to you first through the Master Account section.</p>
                                        </div>
                                    </div>
                                </div>

                                {newGrievance.debtorName && (
                                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <CheckCircle size={16} />
                                            <span className="font-bold">Selected: {newGrievance.debtorName}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Date of Incident */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Date of Incident <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={newGrievance.dateOfIncident}
                                    onChange={(e) => setNewGrievance(prev => ({ ...prev, dateOfIncident: e.target.value }))}
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    title="Select date of incident"
                                />
                            </div>

                            {/* Complaint Description */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Complaint Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={newGrievance.complaintDescription}
                                    onChange={(e) => setNewGrievance(prev => ({ ...prev, complaintDescription: e.target.value }))}
                                    placeholder="Describe the complaint in detail..."
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    title="Enter complaint description"
                                />
                                <button
                                    onClick={analyzeComplaint}
                                    disabled={aiAnalyzing || !newGrievance.complaintDescription}
                                    className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                                    title="Analyze complaint with AI"
                                >
                                    {aiAnalyzing ? (
                                        <>
                                            <Bot className="animate-spin" size={16} />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={16} />
                                            Analyze with AI
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* AI Suggestion */}
                            {aiSuggestion && (
                                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="text-purple-600" size={20} />
                                        <h3 className="font-bold text-purple-900">AI Analysis Results</h3>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-700">Suggested Category:</span>
                                            <span className="font-bold text-purple-900">{categoryLabels[aiSuggestion.category]}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-700">Confidence:</span>
                                            <span className="font-bold text-purple-900">{(aiSuggestion.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-700">Risk Level:</span>
                                            <span className={`px-2 py-1 rounded-lg font-bold ${aiSuggestion.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                                aiSuggestion.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                    aiSuggestion.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>{aiSuggestion.riskLevel}</span>
                                        </div>
                                        {aiSuggestion.keyIssues.length > 0 && (
                                            <div className="mt-3">
                                                <span className="text-slate-700 font-semibold">Key Issues:</span>
                                                <ul className="mt-1 space-y-1">
                                                    {aiSuggestion.keyIssues.map((issue, idx) => (
                                                        <li key={idx} className="text-slate-600 flex items-start gap-2">
                                                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                            {issue}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Category Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Complaint Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newGrievance.category}
                                    onChange={(e) => setNewGrievance(prev => ({ ...prev, category: e.target.value as GrievanceCategory }))}
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Select complaint category"
                                >
                                    <option value="">Select a category...</option>
                                    {Object.entries(categoryLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Financial & Resolution */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="disputed-amount" className="block text-sm font-bold text-slate-900 mb-2">
                                        Disputed Amount (PHP)
                                    </label>
                                    <input
                                        id="disputed-amount"
                                        type="number"
                                        placeholder="0.00"
                                        value={newGrievance.disputedAmount}
                                        onChange={(e) => setNewGrievance(prev => ({ ...prev, disputedAmount: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="desired-resolution" className="block text-sm font-bold text-slate-900 mb-2">
                                        Desired Resolution
                                    </label>
                                    <select
                                        id="desired-resolution"
                                        value={newGrievance.desiredResolution}
                                        onChange={(e) => setNewGrievance(prev => ({ ...prev, desiredResolution: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select resolution...</option>
                                        <option value="Balance Adjustment">Balance Adjustment</option>
                                        <option value="Waive Penalties">Waive Penalties</option>
                                        <option value="Full Reversal">Full Reversal</option>
                                        <option value="Payment Plan Restructuring">Payment Plan Restructuring</option>
                                        <option value="Stop Harassment">Stop Harassment / Calls</option>
                                        <option value="Explanation / Reconciliation">Explanation / Reconciliation</option>
                                        <option value="Agent Disciplinary Action">Agent Disciplinary Action</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Agent Narrative */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Agent Narrative (Your Version)
                                </label>
                                <textarea
                                    value={newGrievance.agentNarrative}
                                    onChange={(e) => setNewGrievance(prev => ({ ...prev, agentNarrative: e.target.value }))}
                                    placeholder="Write your version of the incident and what transpired..."
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    title="Enter agent narrative"
                                />
                            </div>

                            {/* Escalation Level */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Escalation Level <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newGrievance.escalationLevel}
                                    onChange={(e) => setNewGrievance(prev => ({ ...prev, escalationLevel: e.target.value as EscalationLevel }))}
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Select escalation level"
                                >
                                    {Object.entries(escalationLabels).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Priority <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newGrievance.priority}
                                    onChange={(e) => setNewGrievance(prev => ({ ...prev, priority: e.target.value as any }))}
                                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Select priority level"
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>

                            {/* Evidence Upload */}
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">
                                    Evidence & Documentation
                                </label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="evidence-upload"
                                    />
                                    <label htmlFor="evidence-upload" className="cursor-pointer">
                                        <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                                        <p className="text-sm font-semibold text-slate-700">Click to upload files</p>
                                        <p className="text-xs text-slate-500 mt-1">PDF, Images, Audio, Video, Documents</p>
                                    </label>
                                </div>
                                {newGrievance.evidence.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {newGrievance.evidence.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <Paperclip size={16} className="text-slate-600" />
                                                    <span className="text-sm font-medium text-slate-900">{file.name}</span>
                                                    <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                                </div>
                                                <button
                                                    onClick={() => setNewGrievance(prev => ({
                                                        ...prev,
                                                        evidence: prev.evidence.filter((_, i) => i !== idx)
                                                    }))}
                                                    className="text-red-600 hover:text-red-700"
                                                    title="Remove Evidence"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    resetForm();
                                }}
                                className="flex-1 px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createGrievance}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold transition-colors"
                            >
                                Create Dispute
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Grievance Detail View Modal */}
            {selectedGrievance && !showReportPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-700 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black">{selectedGrievance.ticketNumber}</h2>
                                    <p className="text-sm text-slate-300 mt-1">{categoryLabels[selectedGrievance.category]}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedGrievance(null)}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    title="Close"
                                    aria-label="Close detail view"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
                            {/* Status & Priority */}
                            <div className="flex gap-3">
                                <span className={`px-4 py-2 rounded-xl text-sm font-bold ${statusColors[selectedGrievance.status]}`}>
                                    {selectedGrievance.status.replace('_', ' ')}
                                </span>
                                <span className={`px-4 py-2 rounded-xl text-sm font-bold ${priorityColors[selectedGrievance.priority]}`}>
                                    {selectedGrievance.priority} PRIORITY
                                </span>
                            </div>

                            {/* Debtor Info */}
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">Debtor Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="text-left">
                                        <span className="text-slate-600">Name:</span>
                                        <span className="ml-2 font-bold text-slate-900">{selectedGrievance.debtorName}</span>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-slate-600">Account:</span>
                                        <span className="ml-2 font-bold text-slate-900">{selectedGrievance.debtorAccount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Details */}
                            {(selectedGrievance.disputedAmount || selectedGrievance.desiredResolution) && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
                                    <h3 className="text-sm font-black text-green-900 mb-3 uppercase tracking-wider text-left">Financial & Resolution Request</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {selectedGrievance.disputedAmount && (
                                            <div className="text-left">
                                                <span className="text-green-700">Disputed Amount:</span>
                                                <span className="ml-2 font-bold text-green-900">
                                                    PHP {selectedGrievance.disputedAmount.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {selectedGrievance.desiredResolution && (
                                            <div className="text-left">
                                                <span className="text-green-700">Desired Resolution:</span>
                                                <span className="ml-2 font-bold text-green-900">{selectedGrievance.desiredResolution}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Complaint Description */}
                            <div className="text-left">
                                <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Complaint Description</h3>
                                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl">{selectedGrievance.complaintDescription}</p>
                            </div>

                            {/* Agent Narrative */}
                            {selectedGrievance.agentNarratives.length > 0 && (
                                <div className="text-left">
                                    <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Agent Narrative</h3>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                        <p className="text-slate-700">{selectedGrievance.agentNarratives[0].narrative}</p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            By {selectedGrievance.agentNarratives[0].agentName} • {new Date(selectedGrievance.agentNarratives[0].timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* AI Analysis */}
                            {selectedGrievance.aiAnalysis && (
                                <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl text-left">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="text-purple-600" size={20} />
                                        <h3 className="font-black text-purple-900">AI Analysis</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                        <div className="text-left">
                                            <span className="text-slate-700">Risk Level:</span>
                                            <span className={`ml-2 px-2 py-1 rounded-lg font-bold ${selectedGrievance.aiAnalysis.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                                selectedGrievance.aiAnalysis.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>{selectedGrievance.aiAnalysis.riskLevel}</span>
                                        </div>
                                        <div className="text-left">
                                            <span className="text-slate-700">Confidence:</span>
                                            <span className="ml-2 font-bold text-purple-900">{(selectedGrievance.aiAnalysis.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-slate-700 mb-1">Key Issues:</p>
                                        <ul className="space-y-1">
                                            {selectedGrievance.aiAnalysis.keyIssues.map((issue, idx) => (
                                                <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                    {issue}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Approval Workflow */}
                            <div className="text-left">
                                <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">Approval Workflow</h3>
                                <div className="space-y-2">
                                    {selectedGrievance.approvalSteps.map((step, idx) => (
                                        <div key={step.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step.status === 'APPROVED' ? 'bg-green-500 text-white' :
                                                step.status === 'REJECTED' ? 'bg-red-500 text-white' :
                                                    'bg-slate-300 text-slate-600'
                                                }`}>
                                                {step.order}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-bold text-slate-900">{step.approverRole}</p>
                                                <p className="text-xs text-slate-600">{step.status}</p>
                                            </div>
                                            {step.status === 'APPROVED' && <CheckCircle className="text-green-500" size={20} />}
                                            {step.status === 'REJECTED' && <XCircle className="text-red-500" size={20} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
                            <button
                                onClick={() => setSelectedGrievance(null)}
                                className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => generateIncidentReport(selectedGrievance)}
                                disabled={generatingReport}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                {generatingReport ? (
                                    <>
                                        <Bot className="animate-spin" size={20} />
                                        Generating Report...
                                    </>
                                ) : (
                                    <>
                                        <FileText size={20} />
                                        Generate AI Incident Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Preview Modal */}
            {showReportPreview && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black">Incident Report Preview</h2>
                                    <p className="text-sm text-emerald-100 mt-1">AI-Generated Professional Report</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowReportPreview(false);
                                        setSelectedGrievance(null);
                                    }}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    title="Close"
                                    aria-label="Close report preview"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Report Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                                        <Upload size={16} />
                                        {letterhead ? 'Change Letterhead' : 'Upload Letterhead'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLetterheadUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="text-xs text-slate-500 italic">
                                        {letterhead ? 'Letterhead uploaded' : 'Upload company branding image'}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-200 px-3 py-1 rounded-full">
                                    Editable Mode
                                </span>
                            </div>

                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
                                {letterhead && (
                                    <div className="mb-6 pb-6 border-b border-slate-100">
                                        <img src={letterhead} alt="Letterhead" className="w-full max-h-40 object-contain mx-auto" />
                                    </div>
                                )}
                                <textarea
                                    value={generatedReport}
                                    onChange={(e) => setGeneratedReport(e.target.value)}
                                    className="w-full flex-1 p-0 border-none resize-none focus:ring-0 font-mono text-sm text-slate-800 leading-relaxed min-h-[500px]"
                                    placeholder="Report content..."
                                    title="Edit generated report content"
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 bg-white border-t border-slate-200 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowReportPreview(false);
                                    setSelectedGrievance(null);
                                }}
                                className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={downloadAsPDF}
                                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95"
                            >
                                <FileIcon size={20} />
                                Export as PDF
                            </button>
                            <button
                                onClick={downloadAsWord}
                                className="flex-1 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg active:scale-95"
                            >
                                <FileIcon size={20} />
                                Export as Word
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Grievances;
