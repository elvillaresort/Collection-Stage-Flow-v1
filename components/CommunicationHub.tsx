
import React, { useState, useEffect } from 'react';
import {
    FileText,
    Sparkles,
    UserCheck,
    ShieldCheck,
    Upload,
    Plus,
    Search,
    Filter,
    ArrowRight,
    MessageSquare,
    Bot,
    CheckCircle2,
    Clock,
    Trash2,
    Edit3,
    ChevronRight,
    BrainCircuit,
    Settings,
    X,
    Send,
    Globe,
    HelpCircle,
    BookOpen
} from 'lucide-react';
import { CommunicationTemplate, AIPersonality, CommunicationType, SystemSettings } from '../types';
import { supabaseService } from '../services/supabaseService';

interface CommunicationHubProps {
    settings: SystemSettings;
}

const CommunicationHub: React.FC<CommunicationHubProps> = ({ settings }) => {
    const [activeTab, setActiveTab] = useState<'templates' | 'personas' | 'playground'>('templates');
    const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
    const [personas, setPersonas] = useState<AIPersonality[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddTemplate, setShowAddTemplate] = useState(false);
    const [showAddPersona, setShowAddPersona] = useState(false);

    // New Template State
    const [newTemplate, setNewTemplate] = useState<Partial<CommunicationTemplate>>({
        name: '',
        content: '',
        clientName: '',
        clientId: '',
        channel: CommunicationType.SMS,
        category: 'INITIAL_DEMAND',
        isOfficial: true,
        isAiEnhanced: false
    });

    // New Persona State
    const [newPersona, setNewPersona] = useState<Partial<AIPersonality>>({
        name: '',
        description: '',
        traits: [],
        baseTone: 'PROFESSIONAL',
        instructions: '',
        restrictedPhrases: [],
        suggestedPhrases: [],
        linkedTemplateId: ''
    });

    // Playground Simulation State
    const [simMessages, setSimMessages] = useState<{ role: 'AI' | 'SYSTEM' | 'USER', text: string, type?: string }[]>([
        { role: 'SYSTEM', text: 'Initializing Linguistic Simulation Node...' },
        { role: 'SYSTEM', text: 'Waiting for Persona Selection and Input Scenario...' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [selectedPersonaId, setSelectedPersonaId] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [{ data: tData }, { data: pData }] = await Promise.all([
                supabaseService.getTemplates(),
                supabaseService.getPersonas()
            ]);
            if (tData) setTemplates(tData as any);
            if (pData) setPersonas(pData as any);
        } catch (err) {
            console.error("Error fetching communication data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTemplate = async () => {
        if (!newTemplate.name || !newTemplate.content || !newTemplate.clientName) {
            alert("Please fill in all required template fields.");
            return;
        }

        const { error } = await supabaseService.createTemplate({
            ...newTemplate,
            lastModified: new Date().toISOString()
        });

        if (!error) {
            setShowAddTemplate(false);
            setNewTemplate({
                name: '',
                content: '',
                clientName: '',
                clientId: '',
                channel: CommunicationType.SMS,
                category: 'INITIAL_DEMAND',
                isOfficial: true,
                isAiEnhanced: false
            });
            fetchData();
        } else {
            alert("Error creating template: " + error.message);
        }
    };

    const handleAddPersona = async () => {
        if (!newPersona.name || !newPersona.instructions) {
            alert("Please provide a name and instructions for the AI Persona.");
            return;
        }

        const { error } = await supabaseService.createPersona({
            name: newPersona.name,
            description: newPersona.description,
            traits: newPersona.traits,
            baseTone: newPersona.baseTone,
            instructions: newPersona.instructions,
            restrictedPhrases: newPersona.restrictedPhrases,
            suggestedPhrases: newPersona.suggestedPhrases,
            linkedTemplateId: newPersona.linkedTemplateId || undefined
        });

        if (!error) {
            setShowAddPersona(false);
            setNewPersona({
                name: '',
                description: '',
                traits: [],
                baseTone: 'PROFESSIONAL',
                instructions: '',
                restrictedPhrases: [],
                suggestedPhrases: [],
                linkedTemplateId: ''
            });
            fetchData();
        } else {
            alert("Error creating persona: " + error.message);
        }
    };

    const deleteTemplate = async (id: string) => {
        if (confirm("Are you sure you want to delete this approved template?")) {
            const { error } = await supabaseService.deleteTemplate(id);
            if (!error) fetchData();
        }
    };

    const deletePersona = async (id: string) => {
        if (confirm("Are you sure you want to retire this AI Persona?")) {
            const { error } = await supabaseService.deletePersona(id);
            if (!error) fetchData();
        }
    };

    const startSimulation = (personaId: string, templateId?: string) => {
        setSelectedPersonaId(personaId);
        if (templateId) setSelectedTemplateId(templateId);
        setActiveTab('playground');
        setSimMessages([
            { role: 'SYSTEM', text: `Persona Loaded: ${personas.find(p => p.id === personaId)?.name || 'Unknown'}` },
            { role: 'AI', text: "Linguistic engine ready. Please provide a debtor scenario to begin simulation.", type: 'intro' }
        ]);
    };

    const handleSendSimulation = async () => {
        if (!userInput.trim()) return;

        const newMsg = { role: 'USER' as const, text: userInput };
        setSimMessages(prev => [...prev, newMsg]);
        setUserInput('');
        setIsSimulating(true);

        // Mock AI response generation based on persona
        const selectedPersona = personas.find(p => p.id === selectedPersonaId);
        const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

        setTimeout(() => {
            let response = "";
            const tone = selectedPersona?.baseTone || 'PROFESSIONAL';

            if (userInput.toLowerCase().includes('identity theft')) {
                response = "I understand your concern. We take identity theft claims very seriously. Could you please provide a police report or a formal affidavit so we can halt the collection process and initiate an internal investigation?";
            } else if (userInput.toLowerCase().includes('pay next week') || userInput.toLowerCase().includes('promise')) {
                response = `Thank you for that commitment. Since you promised to settle this next week, I will mark your account for a follow-up. Please ensure the funds are ready by then to avoid further escalation. Is there a specific day you'd like me to call and confirm?`;
            } else {
                response = `I've noted your statement. Based on our current records and the ${selectedTemplate?.name || 'guidelines'}, we recommend proceeding with a structured payment plan. How would you like to resolve this balance today?`;
            }

            if (tone === 'EMPATHETIC') {
                response = "I hear you, and I want to help find a solution that works for your current situation. " + response;
            } else if (tone === 'FIRM') {
                response = "Please be advised that this account is already past due. " + response;
            }

            setSimMessages(prev => [...prev, {
                role: 'AI',
                text: response,
                type: 'response'
            }]);
            setIsSimulating(false);
        }, 1500);
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-left">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Communication Hub</h1>
                        <button
                            onClick={() => setShowGuide(true)}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50"
                            title="View Comprehensive Guide"
                        >
                            <HelpCircle size={20} />
                        </button>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Approved Client Templates & AI Persona Management</p>
                </div>
                <div className="flex gap-3">
                    {activeTab === 'templates' && (
                        <button
                            onClick={() => setShowAddTemplate(true)}
                            className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2"
                        >
                            <Upload size={16} /> Upload Approved Script
                        </button>
                    )}
                    {activeTab === 'personas' && (
                        <button
                            onClick={() => setShowAddPersona(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> Design New Persona
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                {[
                    { id: 'templates', label: 'Approved Script Registry', icon: FileText },
                    { id: 'personas', label: 'AI Persona Hub', icon: Bot },
                    { id: 'playground', label: 'Intelligence Playground', icon: BrainCircuit }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-8 py-5 text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all relative ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="min-h-[600px]">
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing Hub Data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'templates' && (
                            <div className="space-y-6">
                                <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                                    <Search size={18} className="text-slate-400 ml-4" />
                                    <input
                                        type="text"
                                        placeholder="Filter by Client Name or Template Title..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-300"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredTemplates.map(template => (
                                        <div key={template.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group flex flex-col">
                                            <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl ${template.isOfficial ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                                                        }`}>
                                                        {template.isOfficial ? <ShieldCheck size={20} /> : <FileText size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 text-sm leading-tight">{template.name}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{template.clientName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button title="Delete Template" onClick={() => deleteTemplate(template.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                            <div className="p-8 flex-1">
                                                <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                                                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic line-clamp-4">
                                                        "{template.content}"
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">{template.channel}</span>
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">{template.category}</span>
                                                    <span className="px-3 py-1 border border-slate-100 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-tighter">v{template.version}</span>
                                                </div>
                                            </div>
                                            <div className="p-8 bg-slate-50/50 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} className="text-slate-300" />
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Rev. {new Date(template.lastModified).toLocaleDateString()}</span>
                                                </div>
                                                <button
                                                    onClick={() => alert(`Script "${template.name}" has been prioritized for all active ${template.channel} campaigns.`)}
                                                    className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all"
                                                >
                                                    Deploy Script <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => setShowAddTemplate(true)}
                                        className="bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 gap-4 cursor-pointer hover:border-blue-200 group transition-all"
                                    >
                                        <div className="w-16 h-16 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                                            <Plus size={32} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-600 transition-all">Add Original Approved Script</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'personas' && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {personas.map(persona => (
                                        <div key={persona.id} className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                            <div className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12"><Bot size={300} /></div>

                                            <div className="relative z-10 space-y-8">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-4 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
                                                            <Sparkles size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-black tracking-tight">{persona.name}</h3>
                                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-1">{persona.baseTone} Specialist</p>
                                                        </div>
                                                    </div>
                                                    <button title="Delete Persona" onClick={() => deletePersona(persona.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors"><X size={18} /></button>
                                                </div>

                                                <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                                                    "{persona.description}"
                                                </p>

                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        <UserCheck size={14} className="text-blue-500" /> Behavioral Traits
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {persona.traits.map((trait, i) => (
                                                            <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold text-slate-300">{trait}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target Logic</p>
                                                        <p className="text-xs font-bold text-white">Debtor Psychology Management</p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Linked Registry</p>
                                                        <p className="text-xs font-bold text-blue-400 truncate">
                                                            {(persona as any).template?.name || 'Unlinked / Global'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => startSimulation(persona.id, persona.linkedTemplateId)}
                                                    className="w-full py-5 bg-white text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-[0.98] shadow-2xl"
                                                >
                                                    Simulate Collection Stream
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div
                                        onClick={() => setShowAddPersona(true)}
                                        className="bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 gap-4 cursor-pointer hover:border-blue-200 group transition-all"
                                    >
                                        <div className="w-20 h-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all shadow-sm">
                                            <BrainCircuit size={40} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-all">Blueprint New Collector Persona</p>
                                            <p className="text-[9px] font-medium text-slate-300 mt-2 uppercase tracking-tight">AI Behavior Parameter Configuration</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'playground' && (
                            <div className="bg-slate-950 rounded-[3.5rem] p-12 text-white shadow-2xl min-h-[600px] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-700">
                                <div className="absolute right-[5%] top-[5%] opacity-5"><BrainCircuit size={400} /></div>

                                <div className="relative z-10 flex flex-col h-full gap-10">
                                    <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                                                <Globe size={28} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-xl font-black tracking-tight">Intelligence Playground</h3>
                                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Real-time Linguistic Simulation Node</p>
                                            </div>
                                        </div>
                                        <div className="hidden lg:flex gap-8 px-10 border-l border-white/10 ml-10">
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Latency</p>
                                                <p className="text-sm font-black text-emerald-400 tracking-tight">124ms</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Model</p>
                                                <p className="text-sm font-black text-blue-400 tracking-tight">Nexus-7b</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1">
                                        <div className="lg:col-span-1 space-y-6">
                                            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-8">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Simulation Persona</label>
                                                    <select
                                                        title="Select Persona"
                                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                                        value={selectedPersonaId}
                                                        onChange={(e) => setSelectedPersonaId(e.target.value)}
                                                    >
                                                        <option value="">Select Persona...</option>
                                                        {personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Approved Script Context</label>
                                                    <select
                                                        title="Select Script"
                                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                                        value={selectedTemplateId}
                                                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                                                    >
                                                        <option value="">Select Script...</option>
                                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.clientName})</option>)}
                                                    </select>
                                                </div>
                                                <div className="p-6 bg-blue-500/10 rounded-3xl border border-blue-500/20">
                                                    <p className="text-[10px] font-bold text-blue-300 leading-relaxed italic">
                                                        "This session uses high-frequency behavioral loops specialized for the Philippine financial sector."
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="lg:col-span-2 flex flex-col bg-slate-900/50 rounded-[3rem] border border-white/5 overflow-hidden">
                                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5 whitespace-nowrap overflow-hidden">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Communication Stream Active</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 p-8 space-y-6 font-mono text-[11px] text-slate-400 overflow-y-auto max-h-[400px]">
                                                {simMessages.map((m, i) => (
                                                    <div key={i} className={`animate-in slide-in-from-bottom-2 duration-300 ${m.role === 'AI' ? 'text-blue-400' : m.role === 'SYSTEM' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                        <p>[{m.role}] {m.text}</p>
                                                        {m.type === 'intro' && (
                                                            <div className="mt-4 p-5 bg-white/5 rounded-2xl border-l-4 border-blue-500 text-white italic">
                                                                "Internal validation complete. I am ready to deploy the strategy for this account segment."
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {isSimulating && (
                                                    <p className="text-blue-400 animate-pulse">[AI] Thinking...</p>
                                                )}
                                            </div>

                                            <div className="p-8 bg-slate-950 border-t border-white/5 relative">
                                                <input
                                                    type="text"
                                                    placeholder="Type a scenario to simulate (e.g. 'Debtor claims identity theft')..."
                                                    className="w-full bg-slate-900 border border-white/10 rounded-[2rem] px-8 py-5 text-xs font-medium outline-none text-white placeholder:text-slate-600"
                                                    value={userInput}
                                                    onChange={(e) => setUserInput(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSendSimulation()}
                                                />
                                                <button
                                                    title="Send Simulation Call"
                                                    onClick={handleSendSimulation}
                                                    className="absolute right-12 top-11 p-2 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all"
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* MODALS */}
            {showAddTemplate && (
                <div className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300 text-left">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-900 text-white rounded-2xl"><Upload size={20} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Register Approved Script</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Client-Mandated Communication Template</p>
                                </div>
                            </div>
                            <button title="Close" onClick={() => setShowAddTemplate(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Creditor</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. BDO Unibank, Home Credit"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-slate-900 transition-all"
                                        value={newTemplate.clientName}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, clientName: e.target.value, clientId: e.target.value.substring(0, 3).toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Script Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Initial SMS Reminder v2"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-slate-900 transition-all"
                                        value={newTemplate.name}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Linguistic Content</label>
                                <textarea
                                    rows={6}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-xs font-medium leading-relaxed outline-none focus:bg-white focus:border-slate-900 transition-all italic"
                                    placeholder="Copy-paste the exact wording approved by the client..."
                                    value={newTemplate.content}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Channel</label>
                                    <select
                                        title="Select Channel"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none cursor-pointer"
                                        value={newTemplate.channel}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, channel: e.target.value as any })}
                                    >
                                        {Object.values(CommunicationType).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        title="Select Category"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none cursor-pointer"
                                        value={newTemplate.category}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value as any })}
                                    >
                                        {['INITIAL_DEMAND', 'FOLLOW_UP', 'PTP_REMINDER', 'SETTLEMENT_OFFER', 'LEGAL_WARNING', 'FIELD_ADVISORY', 'CUSTOM'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex gap-4">
                                <button
                                    onClick={handleAddTemplate}
                                    className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-[0.98]"
                                >
                                    Commit to Script Registry
                                </button>
                                <button
                                    onClick={() => setShowAddTemplate(false)}
                                    className="px-10 py-5 bg-slate-100 text-slate-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-all"
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddPersona && (
                <div className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300 text-left">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl"><BrainCircuit size={20} /></div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight">AI Persona Architect</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Define Linguistic & Behavioral Parameters</p>
                                </div>
                            </div>
                            <button title="Close" onClick={() => setShowAddPersona(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Persona Descriptor</label>
                                <input
                                    type="text"
                                    placeholder="e.g. The Strategic Negotiator"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-slate-900 transition-all"
                                    value={newPersona.name}
                                    onChange={(e) => setNewPersona({ ...newPersona, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Linguistic Instructions</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 text-xs font-medium leading-relaxed outline-none focus:bg-white focus:border-slate-900 transition-all"
                                    placeholder="Instructions on how the AI should behave, e.g. 'Always use respectful Taglish, emphasize the benefits of clearing the record'..."
                                    value={newPersona.instructions}
                                    onChange={(e) => setNewPersona({ ...newPersona, instructions: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Tone</label>
                                    <select
                                        title="Select Base Tone"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none cursor-pointer"
                                        value={newPersona.baseTone}
                                        onChange={(e) => setNewPersona({ ...newPersona, baseTone: e.target.value as any })}
                                    >
                                        {['FIRM', 'EMPATHETIC', 'PROFESSIONAL', 'PERSUASIVE', 'NEGOTIATOR'].map(tone => <option key={tone} value={tone}>{tone}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contextual Script Binding</label>
                                    <select
                                        title="Select Linked Template"
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none cursor-pointer"
                                        value={newPersona.linkedTemplateId}
                                        onChange={(e) => setNewPersona({ ...newPersona, linkedTemplateId: e.target.value })}
                                    >
                                        <option value="">Global / Unlinked</option>
                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.clientName})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Linguistic Traits (Comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="Approachable, Direct, Firm with Deadlines, Emphasizes Credit Score"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-slate-900 transition-all"
                                    onChange={(e) => setNewPersona({ ...newPersona, traits: e.target.value.split(',').map(s => s.trim()) })}
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex gap-4 mt-8">
                                <button
                                    onClick={handleAddPersona}
                                    className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
                                >
                                    Instantiate Persona
                                </button>
                                <button
                                    onClick={() => setShowAddPersona(false)}
                                    className="px-10 py-5 bg-slate-100 text-slate-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-all"
                                >
                                    Abort
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Guide Modal */}
            {showGuide && (
                <div className="fixed inset-0 z-[5000] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
                        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl"><BookOpen size={24} /></div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight">Strategy Hub - Complete User Guide</h3>
                                    <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-1">Step-by-Step Comprehensive Instructions</p>
                                </div>
                            </div>
                            <button title="Close" onClick={() => setShowGuide(false)} className="p-2 text-white/80 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 text-left">
                            <div className="prose prose-sm max-w-none">
                                <section className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 mb-4">Getting Started</h2>
                                        <p className="text-sm text-slate-600 mb-4">The Strategy Hub has three main sections:</p>
                                        <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                                            <li><strong>Approved Script Registry</strong> - Manage client-approved communication templates</li>
                                            <li><strong>AI Persona Hub</strong> - Create and configure AI personas for collection strategies</li>
                                            <li><strong>Intelligence Playground</strong> - Test and simulate conversations before deployment</li>
                                        </ul>
                                    </div>

                                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                        <h3 className="text-sm font-black text-blue-900 mb-2">Quick Start Workflow</h3>
                                        <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
                                            <li>Create or upload approved client templates</li>
                                            <li>Design AI personas with specific tones and traits</li>
                                            <li>Link personas to templates</li>
                                            <li>Test combinations in the Intelligence Playground</li>
                                            <li>Deploy templates to active campaigns</li>
                                        </ol>
                                    </div>
                                </section>

                                <section className="space-y-6 mt-10 pt-10 border-t border-slate-200">
                                    <h2 className="text-xl font-black text-slate-900 mb-4">Tab 1: Approved Script Registry</h2>
                                    
                                    <div className="space-y-4">
                                        <h3 className="text-base font-black text-slate-800">Adding a New Template</h3>
                                        <ol className="space-y-3 text-sm text-slate-600 list-decimal list-inside">
                                            <li><strong>Click "Upload Approved Script"</strong> button or the "+" card</li>
                                            <li><strong>Fill Required Fields:</strong>
                                                <ul className="ml-6 mt-2 space-y-1 list-disc">
                                                    <li>Client Creditor (e.g., "BDO Unibank")</li>
                                                    <li>Script Name (e.g., "Initial SMS Reminder v2")</li>
                                                    <li>Linguistic Content (exact approved wording with placeholders like [NAME], [AMOUNT])</li>
                                                </ul>
                                            </li>
                                            <li><strong>Select Optional Fields:</strong>
                                                <ul className="ml-6 mt-2 space-y-1 list-disc">
                                                    <li>Target Channel (SMS, WhatsApp, Email, Voice, Field Visit)</li>
                                                    <li>Category (INITIAL_DEMAND, FOLLOW_UP, PTP_REMINDER, etc.)</li>
                                                </ul>
                                            </li>
                                            <li><strong>Click "Commit to Script Registry"</strong> to save</li>
                                        </ol>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-2xl">
                                        <h4 className="text-sm font-black text-slate-900 mb-2">Template Best Practices</h4>
                                        <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                                            <li>Always include version numbers in template names</li>
                                            <li>Use clear placeholders: [NAME], [AMOUNT], [LOAN_ID], [LINK]</li>
                                            <li>Only upload officially approved scripts</li>
                                            <li>Never modify approved content</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="space-y-6 mt-10 pt-10 border-t border-slate-200">
                                    <h2 className="text-xl font-black text-slate-900 mb-4">Tab 2: AI Persona Hub</h2>
                                    
                                    <div className="space-y-4">
                                        <h3 className="text-base font-black text-slate-800">Creating a New Persona</h3>
                                        <ol className="space-y-3 text-sm text-slate-600 list-decimal list-inside">
                                            <li><strong>Click "Design New Persona"</strong> button or the "+" card</li>
                                            <li><strong>Define Persona Identity:</strong>
                                                <ul className="ml-6 mt-2 space-y-1 list-disc">
                                                    <li>Persona Descriptor (e.g., "The Strategic Negotiator")</li>
                                                    <li>Linguistic Instructions (detailed behavior guidelines)</li>
                                                </ul>
                                            </li>
                                            <li><strong>Configure Settings:</strong>
                                                <ul className="ml-6 mt-2 space-y-1 list-disc">
                                                    <li>Base Tone (FIRM, EMPATHETIC, PROFESSIONAL, PERSUASIVE, NEGOTIATOR)</li>
                                                    <li>Contextual Script Binding (link to a template or leave global)</li>
                                                    <li>Linguistic Traits (comma-separated: "Approachable, Direct, Firm with Deadlines")</li>
                                                </ul>
                                            </li>
                                            <li><strong>Click "Instantiate Persona"</strong> to create</li>
                                        </ol>
                                    </div>

                                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                                        <h4 className="text-sm font-black text-indigo-900 mb-2">Persona Design Tips</h4>
                                        <ul className="space-y-1 text-xs text-indigo-800 list-disc list-inside">
                                            <li>Match persona tone to campaign stage (early = empathetic, late = firm)</li>
                                            <li>Be specific in linguistic instructions with examples</li>
                                            <li>Link personas to relevant client templates</li>
                                            <li>Test personas in Playground before deployment</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="space-y-6 mt-10 pt-10 border-t border-slate-200">
                                    <h2 className="text-xl font-black text-slate-900 mb-4">Tab 3: Intelligence Playground</h2>
                                    
                                    <div className="space-y-4">
                                        <h3 className="text-base font-black text-slate-800">Running a Simulation</h3>
                                        <ol className="space-y-3 text-sm text-slate-600 list-decimal list-inside">
                                            <li><strong>Select Configuration:</strong>
                                                <ul className="ml-6 mt-2 space-y-1 list-disc">
                                                    <li>Choose a Simulation Persona from dropdown</li>
                                                    <li>Select an Approved Script Context</li>
                                                </ul>
                                            </li>
                                            <li><strong>Wait for System Initialization</strong> (green dot indicates active)</li>
                                            <li><strong>Type Test Scenarios:</strong>
                                                <ul className="ml-6 mt-2 space-y-1 list-disc">
                                                    <li>"Debtor claims identity theft"</li>
                                                    <li>"Debtor promises to pay next week"</li>
                                                    <li>"Debtor wants to negotiate settlement"</li>
                                                </ul>
                                            </li>
                                            <li><strong>Press Enter or Click Send</strong> to see AI response</li>
                                            <li><strong>Analyze Responses:</strong> Review how persona handles scenarios</li>
                                            <li><strong>Iterate:</strong> Adjust persona settings if needed and re-test</li>
                                        </ol>
                                    </div>

                                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                        <h4 className="text-sm font-black text-emerald-900 mb-2">Testing Best Practices</h4>
                                        <ul className="space-y-1 text-xs text-emerald-800 list-disc list-inside">
                                            <li>Test common objections and edge cases</li>
                                            <li>Verify compliance (no threatening language)</li>
                                            <li>Test multiple scenarios before deploying</li>
                                            <li>Refine personas based on test results</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mt-10 pt-10 border-t border-slate-200">
                                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-2xl">
                                        <h3 className="text-lg font-black mb-4">Need More Help?</h3>
                                        <p className="text-sm text-slate-300 mb-4">For detailed documentation, see the complete guide:</p>
                                        <p className="text-xs font-mono bg-white/10 p-3 rounded-xl inline-block">STRATEGY_HUB_GUIDE.md</p>
                                    </div>
                                </section>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setShowGuide(false)}
                                className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                            >
                                Got It, Close Guide
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunicationHub;
