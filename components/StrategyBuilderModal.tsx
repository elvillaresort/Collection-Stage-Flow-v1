import React from 'react';
import {
    X, Sparkles, FileText, CheckCircle, Shield, Plus, Trash2, Edit3,
    Smartphone, Phone, Mail, MessageSquare, MapPin, Send, Clock, Bot, Info
} from 'lucide-react';
import { CommunicationType } from '../types';

interface MessageTemplate {
    id: string;
    name: string;
    channel: CommunicationType;
    content: string;
    variables: string[];
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvalDate?: string;
    clientId?: string;
    language: 'en' | 'fil';
}

interface StrategyBuilderModalProps {
    show: boolean;
    onClose: () => void;
    templates: MessageTemplate[];
    onAddTemplate: (template: MessageTemplate) => void;
    editingStrategy: any;
}

const StrategyBuilderModal: React.FC<StrategyBuilderModalProps> = ({
    show,
    onClose,
    templates,
    onAddTemplate,
    editingStrategy
}) => {
    const [activeTab, setActiveTab] = React.useState<'templates' | 'builder'>('templates');
    const [templateForm, setTemplateForm] = React.useState({
        name: '',
        channel: CommunicationType.SMS,
        content: '',
        language: 'en' as 'en' | 'fil',
        clientId: ''
    });

    const extractVariables = (content: string): string[] => {
        const regex = /\{\{(\w+)\}\}/g;
        const matches = content.matchAll(regex);
        return Array.from(matches, m => m[1]);
    };

    const handleAddTemplate = () => {
        if (!templateForm.name || !templateForm.content) {
            alert('Please fill in template name and content');
            return;
        }

        const newTemplate: MessageTemplate = {
            id: `TPL-${Date.now()}`,
            name: templateForm.name,
            channel: templateForm.channel,
            content: templateForm.content,
            variables: extractVariables(templateForm.content),
            approvalStatus: 'pending',
            language: templateForm.language,
            clientId: templateForm.clientId
        };

        onAddTemplate(newTemplate);
        setTemplateForm({
            name: '',
            channel: CommunicationType.SMS,
            content: '',
            language: 'en',
            clientId: ''
        });
        alert('Template created! Awaiting client approval.');
    };

    const getChannelIcon = (channel: CommunicationType) => {
        switch (channel) {
            case CommunicationType.SMS: return Smartphone;
            case CommunicationType.VOICE: return Phone;
            case CommunicationType.EMAIL: return Mail;
            case CommunicationType.WHATSAPP: return MessageSquare;
            case CommunicationType.FIELD_VISIT: return MapPin;
            default: return Send;
        }
    };

    const getApprovalColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[5000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="bg-white w-full max-w-6xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
                <div className="p-10 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl">
                            <Sparkles size={28} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                {editingStrategy ? 'Edit Strategy' : 'Strategy Builder'}
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                Collection Flow & Template Management
                            </p>
                        </div>
                    </div>
                    <button title="Close" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 px-10 bg-slate-50 shrink-0">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'templates'
                                ? 'text-blue-600 border-b-4 border-blue-600'
                                : 'text-slate-400 hover:text-slate-900'
                            }`}
                    >
                        <FileText size={16} className="inline mr-2" />
                        Message Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('builder')}
                        className={`px-6 py-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'builder'
                                ? 'text-blue-600 border-b-4 border-blue-600'
                                : 'text-slate-400 hover:text-slate-900'
                            }`}
                    >
                        <Sparkles size={16} className="inline mr-2" />
                        Flow Builder
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 scrollbar-thin">
                    {activeTab === 'templates' ? (
                        <div className="space-y-8">
                            {/* Info Banner */}
                            <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100">
                                <div className="flex items-start gap-3">
                                    <Shield size={20} className="text-blue-600 mt-0.5" />
                                    <div className="text-left">
                                        <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-2">
                                            Client Approval Required
                                        </h4>
                                        <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                            All message templates must be approved by the client/creditor before they can be used in collection flows.
                                            This ensures compliance with client communication standards and regulatory requirements.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Create New Template */}
                            <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-200">
                                <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <Plus size={20} className="text-blue-600" />
                                    Create New Template
                                </h4>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                Template Name
                                            </label>
                                            <input
                                                type="text"
                                                value={templateForm.name}
                                                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                                                placeholder="e.g., Friendly Payment Reminder"
                                                className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                Channel
                                            </label>
                                            <select
                                                title="Select channel"
                                                value={templateForm.channel}
                                                onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value as CommunicationType })}
                                                className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                                            >
                                                <option value={CommunicationType.SMS}>SMS</option>
                                                <option value={CommunicationType.EMAIL}>Email</option>
                                                <option value={CommunicationType.VOICE}>Voice Call Script</option>
                                                <option value={CommunicationType.WHATSAPP}>WhatsApp</option>
                                                <option value={CommunicationType.VIBER}>Viber</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                Language
                                            </label>
                                            <select
                                                title="Select language"
                                                value={templateForm.language}
                                                onChange={(e) => setTemplateForm({ ...templateForm, language: e.target.value as 'en' | 'fil' })}
                                                className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                                            >
                                                <option value="en">English</option>
                                                <option value="fil">Filipino</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                Client ID (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={templateForm.clientId}
                                                onChange={(e) => setTemplateForm({ ...templateForm, clientId: e.target.value })}
                                                placeholder="e.g., CLIENT-001"
                                                className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                            Message Content
                                        </label>
                                        <textarea
                                            value={templateForm.content}
                                            onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                                            rows={6}
                                            placeholder="Use {{variableName}} for dynamic fields. Example: Hi {{borrowerName}}, your payment of {{amountDue}} is due on {{dueDate}}."
                                            className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none resize-none"
                                        />
                                        <p className="text-xs text-slate-500 font-medium mt-2 ml-1">
                                            Detected variables: {extractVariables(templateForm.content).length > 0 ? (
                                                <span className="font-black text-blue-600">
                                                    {extractVariables(templateForm.content).join(', ')}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">None</span>
                                            )}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleAddTemplate}
                                        className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <Plus size={18} />
                                        Create Template
                                    </button>
                                </div>
                            </div>

                            {/* Template Library */}
                            <div>
                                <h4 className="text-lg font-black text-slate-900 mb-6">Template Library ({templates.length})</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {templates.map(template => {
                                        const ChannelIcon = getChannelIcon(template.channel);
                                        return (
                                            <div key={template.id} className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:shadow-xl transition-all">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                                            <ChannelIcon size={20} />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-lg font-black text-slate-900">{template.name}</h5>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs font-bold text-slate-400">{template.channel}</span>
                                                                <span className="text-xs font-bold text-slate-400">•</span>
                                                                <span className="text-xs font-bold text-slate-400">{template.language === 'en' ? 'English' : 'Filipino'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${getApprovalColor(template.approvalStatus)}`}>
                                                        {template.approvalStatus}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-slate-600 font-medium p-4 bg-slate-50 rounded-2xl mb-4">
                                                    {template.content}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {template.variables.map(v => (
                                                            <span key={v} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black">
                                                                {`{{${v}}}`}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    {template.approvalStatus === 'approved' && (
                                                        <div className="text-xs text-emerald-600 font-bold flex items-center gap-2">
                                                            <CheckCircle size={14} />
                                                            Approved by {template.approvedBy}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-20 text-center">
                            <Sparkles size={64} className="text-slate-300 mx-auto mb-6" />
                            <h4 className="text-2xl font-black text-slate-900 mb-4">Visual Flow Builder</h4>
                            <p className="text-slate-500 font-medium mb-8 max-w-2xl mx-auto">
                                The drag-and-drop strategy builder is coming soon. This will allow you to create multi-stage
                                collection flows by combining approved templates, setting timing rules, and defining escalation paths.
                            </p>
                            <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-100 max-w-2xl mx-auto">
                                <div className="flex items-start gap-3">
                                    <Info size={20} className="text-amber-600 mt-0.5" />
                                    <div className="text-left">
                                        <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-2">
                                            For Now: Use Template Library
                                        </h5>
                                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                            Create and manage your client-approved message templates in the Templates tab.
                                            These templates can be manually assigned to collection stages in your existing strategies.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StrategyBuilderModal;
