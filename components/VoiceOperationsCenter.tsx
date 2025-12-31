import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Mic, PhoneOutgoing, Activity, Waves, Play, Pause, Volume2, Zap, CheckCircle2,
    AlertTriangle, MessageSquare, ShieldCheck, User, BrainCircuit, History, Search,
    Filter, ArrowRight, Clock, Sparkles, Loader2, Ear, Target, Smile, Frown, Meh,
    PhoneCall, Calendar, ListMusic, Bot, Terminal, ArrowUpRight, ArrowDownLeft,
    VolumeX, UserPlus, Smartphone, DollarSign, AlertCircle, Send, FileAudio, Timer,
    Info, Quote, ShieldAlert, Globe, Disc, ListRestart, Volume1, Trash2, Shield,
    Check, Lock, PauseCircle, PlayCircle, SkipForward, FastForward, Cpu, Fingerprint,
    MicOff, UserRound, LayoutTemplate, WavesIcon, MessageSquareQuote, Flame, Scale,
    ChevronLeft, ChevronDown, X, Plus, UploadCloud, Settings, Circle, Sliders,
    Languages, Signal, Rocket, Crosshair, Users, Power, Grid, Phone, Voicemail, Download,
    Command, Headphones, ChevronRight, UserCheck, Radio, BarChart3, Eye, Edit, Building2, TrendingUp, FileCheck, MoreVertical, File as FileIcon, Paperclip, Tag
} from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { DUMMY_DEBTORS } from '../constants';
import { Debtor, SystemSettings, VoiceProfile, User as UserType, CallRecording } from '../types';
import { decodeBase64, decodeAudioData, createPcmBlob } from '../services/audioUtils';

// --- Interfaces & Types (Consolidated) ---

interface DialogueLine {
    sender: 'AI' | 'USR' | 'SYS' | 'AGENT';
    text: string;
    timestamp: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
}

interface ActiveCall {
    id: string;
    debtor: Debtor;
    duration: string;
    sentiment: 'positive' | 'neutral' | 'hostile';
    intent: string;
    status: 'connecting' | 'talking' | 'listening' | 'closing' | 'idle';
    lastActivity: string;
    recordingSaved?: boolean;
    transcript?: DialogueLine[];
    outcome?: string;
}

const REGIONAL_DIALECTS: Record<string, { dialect: string, greeting: string }> = {
    'Cebu': { dialect: 'Cebuano', greeting: 'Maayong Buntag' },
    'Davao': { dialect: 'Cebuano/Tagalog', greeting: 'Maayong Adlaw' },
    'Iloilo': { dialect: 'Hiligaynon', greeting: 'Maayong Aga' },
    'Pampanga': { dialect: 'Kapampangan', greeting: 'Mayap a Abak' },
    'Tarlac': { dialect: 'Kapampangan/Ilocano', greeting: 'Mayap a Abak / Naimbag a Bigat' },
    'Pangasinan': { dialect: 'Pangasinense', greeting: 'Maabig ya Agew' },
    'Bicol': { dialect: 'Bicolano', greeting: 'Dios Marhay na Aga' },
    'Batangas': { dialect: 'Tagalog (Batangueño)', greeting: 'Ala eh, Magandang umaga' },
    'Manila': { dialect: 'Taglish', greeting: 'Good Morning po' },
    'Cavite': { dialect: 'Tagalog (Caviteño)', greeting: 'Magandang umaga' },
    'Ilocos': { dialect: 'Ilocano', greeting: 'Naimbag a Bigat' },
    'Zamboanga': { dialect: 'Chavacano', greeting: 'Buenos Dias' },
    'Bacolod': { dialect: 'Hiligaynon', greeting: 'Maayong Aga' },
    'Samar': { dialect: 'Waray-Waray', greeting: 'Maupay nga aga' },
    'Leyte': { dialect: 'Waray-Waray', greeting: 'Maupay nga aga' },
    'Cagayan': { dialect: 'Ibanag/Itawes', greeting: 'Mapiya a bimmannag' },
    'Cotabato': { dialect: 'Maguindanaoan', greeting: 'Mapia mapipita' },
    'Marawi': { dialect: 'Maranao', greeting: 'Mapiya mapipita' },
};

const DETECT_DIALECT = (city: string, province: string) => {
    const key = Object.keys(REGIONAL_DIALECTS).find(k =>
        (city && city.includes(k)) || (province && province.includes(k))
    );
    return key ? REGIONAL_DIALECTS[key] : { dialect: 'Taglish (General)', greeting: 'Magandang araw po' };
};

const INITIAL_PERSONAS = [
    { id: 'vp-1', name: 'Kore', traits: 'Neural Polyglot, Firm, High EQ, Tactical', color: 'rose', lang: 'Taglish (Recovery Pro)', baseVoice: 'Kore', status: 'trained' },
    { id: 'vp-2', name: 'Puck', traits: 'Linguistic Expert, Rapid Negotiation, Persistent', color: 'purple', lang: 'Taglish (Standard)', baseVoice: 'Puck', status: 'trained' },
    { id: 'vp-3', name: 'Zephyr', traits: 'Highly Empathetic, Dialect Specialist, Soft', color: 'blue', lang: 'English (Soft Nudge)', baseVoice: 'Zephyr', status: 'idle' }
];

interface VoiceOperationsCenterProps {
    settings: SystemSettings;
    user: UserType;
    onSaveRecording: (recording: CallRecording) => void;
}

const VoiceOperationsCenter: React.FC<VoiceOperationsCenterProps> = ({ settings, user, onSaveRecording }) => {
    // --- Global State ---
    const [activeTab, setActiveTab] = useState<'control-hub' | 'mode-ai' | 'mode-manual' | 'mode-ivr' | 'archive-vault'>('control-hub');
    const [callLogs, setCallLogs] = useState<ActiveCall[]>([]);
    const [isDualChannel, setIsDualChannel] = useState(true);

    // --- Manual Dialer State ---
    const [manualNumber, setManualNumber] = useState('');
    const [lastDialed, setLastDialed] = useState('');

    // --- IVR State ---
    const [ivrNodes, setIvrNodes] = useState([
        { id: 1, trigger: 'Incoming Call', action: 'Play Greeting: "Welcome to PCCS..."', next: 2 },
        { id: 2, trigger: 'Input: 1', action: 'Route: Payments Dept', next: null },
        { id: 3, trigger: 'Input: 2', action: 'Route: Agent Queue', next: null },
        { id: 4, trigger: 'Input: 9', action: 'Hangup', next: null }
    ]);

    // --- Autodialer State ---
    const [dialerMode, setDialerMode] = useState<'AI' | 'HUMAN'>('AI');
    const [voicePersonas, setVoicePersonas] = useState(INITIAL_PERSONAS);
    const [activePersona, setActivePersona] = useState(INITIAL_PERSONAS[0]);
    const [isRecordingEnabled, setIsRecordingEnabled] = useState(true);

    const [activeCalls, setActiveCalls] = useState<ActiveCall[]>(
        DUMMY_DEBTORS.slice(0, 10).map((d, i) => ({
            id: `call-${i}`,
            debtor: d,
            duration: '00:00',
            sentiment: 'neutral',
            intent: 'Idle',
            status: 'idle',
            lastActivity: 'Pending'
        }))
    );

    const [selectedCallId, setSelectedCallId] = useState<string | null>(activeCalls[0].id);
    const [isLive, setIsLive] = useState(false);
    const [isDialing, setIsDialing] = useState(false);
    const [transcription, setTranscription] = useState<DialogueLine[]>([]);
    const [callTimer, setCallTimer] = useState(0);
    const [isAutodialerRunning, setIsAutodialerRunning] = useState(false);
    const [queueIndex, setQueueIndex] = useState(0);
    const [liveSentiment, setLiveSentiment] = useState<number>(50);

    // --- Voice Masking State ---
    const [voiceMaskingActive, setVoiceMaskingActive] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [isTraining, setIsTraining] = useState(false);
    const [trainingProgress, setTrainingProgress] = useState(0);
    const [enrollmentConfig, setEnrollmentConfig] = useState({
        name: '',
        pitch: 0,
        speed: 1.0,
        vibrato: 0.2,
        basePersona: 'Balanced',
        language: 'Taglish'
    });

    // --- AI Voice Bot State ---
    const [aiPolyglotMode, setAiPolyglotMode] = useState(true);
    const [aiGeoLocation, setAiGeoLocation] = useState(true);
    const [aiTactic, setAiTactic] = useState<'EMPATHIC' | 'FIRM' | 'NEGOTIATOR'>('NEGOTIATOR');
    const [activeDialect, setActiveDialect] = useState<{ dialect: string, greeting: string } | null>(null);
    const [isSimulation, setIsSimulation] = useState(false);
    const [simStep, setSimStep] = useState(0);
    const [activeTalkbots, setActiveTalkbots] = useState<any[]>([]);

    // --- Refs ---
    const audioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sessionRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const timerRef = useRef<any>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);

    const sym = settings.localization.currencySymbol;
    const selectedCall = useMemo(() => activeCalls.find(c => c.id === selectedCallId), [selectedCallId, activeCalls]);

    // --- Effects ---
    useEffect(() => {
        if (transcriptEndRef.current) transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [transcription]);

    // --- Autodialer Logic ---
    const startLiveCall = useCallback(async (targetCall: ActiveCall) => {
        if (!targetCall) return;
        setIsDialing(true);
        setSelectedCallId(targetCall.id);

        if (isDualChannel) {
            setTranscription(prev => prev.concat([{ sender: 'SYS', text: "Dual Channel Recording Active (Audit L/R Split)", timestamp: new Date().toLocaleTimeString() }]));
        } else {
            setTranscription([{
                sender: 'SYS', text: `Initiating recovery call for ${targetCall.debtor.name}...`, timestamp: new Date().toLocaleTimeString()
            }]);
        }

        try {
            const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY });
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            audioContextRef.current = outputCtx;
            nextStartTimeRef.current = 0;

            let dialectInfo = { dialect: 'Taglish', greeting: 'Magandang araw po' };
            if (dialerMode === 'AI' && aiGeoLocation) {
                dialectInfo = DETECT_DIALECT(targetCall.debtor.city || '', targetCall.debtor.province || '');
                setActiveDialect(dialectInfo);
                setTranscription(prev => prev.concat([{
                    sender: 'SYS',
                    text: `Detected Location Context: ${targetCall.debtor.city || 'Regional'}. Language Set: ${dialectInfo.dialect}`,
                    timestamp: new Date().toLocaleTimeString()
                }]));
            } else {
                setActiveDialect(null);
            }

            const isTrainingCall = targetCall.id.startsWith('train-');
            const tacticInstructions = {
                EMPATHIC: "Prioritize rapport and psychological safety. Use soft tones. Offer flexible PTPs.",
                FIRM: "High urgency. Mention the consequences of non-payment clearly. Stick to firm timelines.",
                NEGOTIATOR: "Highly analytical. Calculate potential discounts or structured payment plans if they show willingness."
            };

            let systemInstruction = dialerMode === 'AI'
                ? `You are ${activePersona.name}, a highly intelligent collection agent for PCCS Philippines. 
           COLLECTION TACTIC: ${tacticInstructions[aiTactic]}.
           BORROWER: ${targetCall.debtor.name} owes ${sym}${targetCall.debtor.amountDue}. 
           LOCATION: ${targetCall.debtor.city || 'Manila'}, ${targetCall.debtor.province || 'PH'}.
           
           LINGUISTIC PROTOCOL ($10173 COMPLIANT):
           1. START: Use the local greeting "${dialectInfo.greeting}".
           2. ASK FIRST: You MUST immediately ask if they prefer to speak in ${dialectInfo.dialect}, Tagalog, or English.
           3. ADAPT: Fluidly switch between Tagalog, English, and Taglish. Mirror local dialects if the borrower uses them.
           
           ${isTrainingCall || isSimulation ? '--- TRAINING MODE ENABLED --- You are speaking to a USER who is role-playing as the debtor for training purposes. Be your best autonomous self to show how effective you are.' : ''}
           
           GOAL: Secure a firm Promise to Pay (PTP) date and amount. Be professional, respectful, but effective.`
                : `You are an AI COPILOT for a human collector. Monitor the borrower ${targetCall.debtor.name}. Provide objection handlers.`;

            if (dialerMode === 'HUMAN' && voiceMaskingActive) {
                systemInstruction += ` [VOICE MASKING ENABLED]: You must transform the incoming agent speech into the voice of the profile: ${activePersona.name} (${activePersona.traits}). Act as a real-time voice transformer. ensure emotion is preserved while replacing the physical voice print.`;
            }

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: activePersona.baseVoice as any } } },
                    systemInstruction: systemInstruction
                },
                callbacks: {
                    onopen: () => {
                        setIsLive(true);
                        setIsDialing(false);
                        setTranscription(prev => prev.concat([{ sender: 'SYS', text: "Contact established.", timestamp: new Date().toLocaleTimeString() }]));
                        timerRef.current = setInterval(() => setCallTimer(prev => prev + 1), 1000);

                        const source = inputCtx.createMediaStreamSource(stream);
                        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = createPcmBlob(inputData);
                            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(processor);
                        processor.connect(inputCtx.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && audioContextRef.current) {
                            const ctx = audioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.addEventListener('ended', () => sourcesRef.current.delete(source));
                            sourcesRef.current.add(source);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                        }
                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent!.outputTranscription!.text;
                            setTranscription(prev => prev.concat([{ sender: 'AI', text, timestamp: new Date().toLocaleTimeString() }]));
                        }
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            const sentimentVal = text.toLowerCase().includes('sorry') || text.toLowerCase().includes('bayad') ? 80 : text.toLowerCase().includes('ayoko') || text.toLowerCase().includes('wala') ? 20 : 50;
                            setLiveSentiment(sentimentVal);
                            setTranscription(prev => prev.concat([{
                                sender: dialerMode === 'AI' ? 'USR' : 'AGENT', text, timestamp: new Date().toLocaleTimeString(),
                                sentiment: sentimentVal > 60 ? 'positive' : sentimentVal < 40 ? 'negative' : 'neutral'
                            }]));
                        }
                    },
                    onerror: () => stopSession(),
                    onclose: () => stopSession()
                }
            });
            sessionRef.current = await sessionPromise;
        } catch (error) {
            console.error("Connection failed", error);
            setIsDialing(false);
            setIsLive(false);
        }
    }, [activePersona, sym, dialerMode, voiceMaskingActive, isDualChannel, aiTactic, aiGeoLocation, isSimulation]);

    const stopSession = useCallback(() => {
        if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        sourcesRef.current.forEach(source => source.stop());
        sourcesRef.current.clear();
        if (timerRef.current) clearInterval(timerRef.current);

        const finalLog: DialogueLine = {
            sender: 'SYS',
            text: `Call Ended. Status: ${dialerMode === 'AI' ? 'Auto-Logged' : 'Agent Resolved'}. Masking: ${voiceMaskingActive ? 'Active' : 'Off'}`,
            timestamp: new Date().toLocaleTimeString()
        };

        if (selectedCallId && selectedCall) {
            const finalDuration = formatTime(callTimer);
            const finalTranscript = [...transcription, finalLog];

            const completedCall: ActiveCall = {
                ...selectedCall,
                status: 'closing',
                duration: finalDuration,
                transcript: finalTranscript,
                outcome: 'Call Completed',
                recordingSaved: isRecordingEnabled,
                lastActivity: new Date().toLocaleTimeString()
            };

            setCallLogs(prev => [completedCall, ...prev]);

            if (isRecordingEnabled) {
                onSaveRecording({
                    id: `REC-${Date.now()}`,
                    agentName: dialerMode === 'AI' ? `AI Node (${activePersona.name})` : user.name,
                    debtorName: selectedCall.debtor.name,
                    timestamp: new Date().toLocaleString(),
                    duration: finalDuration,
                    status: 'Pending',
                    sentiment: liveSentiment > 60 ? 'Positive' : liveSentiment < 40 ? 'Hostile' : 'Neutral',
                    notes: isDualChannel ? 'Audit Grade: Dual Channel Stereo (L: Agent, R: Debtor)' : 'Standard Mono'
                });
            }

            setActiveCalls(prev => prev.map(c => c.id === selectedCallId ? {
                ...c, recordingSaved: isRecordingEnabled, status: 'idle', duration: finalDuration,
                transcript: finalTranscript, outcome: 'Call Logged'
            } : c));
        }

        setTranscription(prev => prev.concat([finalLog]));
        setIsLive(false);
        setIsDialing(false);
        setCallTimer(0);

        if (isAutodialerRunning && queueIndex < activeCalls.length - 1) {
            setTimeout(() => {
                const nextIdx = queueIndex + 1;
                setQueueIndex(nextIdx);
                startLiveCall(activeCalls[nextIdx]);
            }, 3000);
        } else if (isAutodialerRunning) {
            setIsAutodialerRunning(false);
        }
    }, [selectedCallId, selectedCall, isAutodialerRunning, transcription, callTimer, dialerMode, voiceMaskingActive, isRecordingEnabled, activePersona, user.name, onSaveRecording, liveSentiment, queueIndex, startLiveCall]);

    const stopSimulation = useCallback(() => {
        setIsSimulation(false);
        setIsLive(false);
        setCallTimer(0);
        setSimStep(0);
        setTranscription(prev => prev.concat([{ sender: 'SYS', text: "Simulation Terminal Terminated.", timestamp: new Date().toLocaleTimeString() }]));
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const startTrainingSimulation = useCallback(async () => {
        setIsSimulation(true);
        setActiveTab('control-hub');

        const baseDebtor = DUMMY_DEBTORS[0];
        const trainingCall: ActiveCall = {
            id: `train-${Date.now()}`,
            debtor: {
                ...baseDebtor,
                name: 'Jon Santiago (Training Profile)',
                amountDue: 45000,
                city: 'Manila',
                province: 'Metro Manila',
            },
            duration: '00:00',
            sentiment: 'neutral',
            intent: 'Training Session',
            status: 'connecting',
            lastActivity: 'Initializing Training Node'
        };

        setTranscription([{ sender: 'SYS', text: "INTERACTIVE TRAINING MODE: You are now role-playing as the Debtor. Negotiate with the Talkbot to test its effectiveness.", timestamp: new Date().toLocaleTimeString() }]);
        setActiveCalls(prev => [trainingCall, ...prev]);
        setSelectedCallId(trainingCall.id);
        startLiveCall(trainingCall);
    }, [startLiveCall]);

    const toggleAutodialer = () => {
        if (isAutodialerRunning) { setIsAutodialerRunning(false); }
        else { setIsAutodialerRunning(true); setQueueIndex(0); startLiveCall(activeCalls[0]); }
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const startAutonomousTalkbot = (debtor: Debtor) => {
        const botId = `bot-${Date.now()}`;
        const newBot = {
            id: botId,
            debtor: debtor,
            status: 'negotiating',
            startTime: new Date().toLocaleTimeString(),
            persona: activePersona.name,
            sentiment: 50
        };
        setActiveTalkbots(prev => [newBot, ...prev]);

        setTimeout(() => {
            setActiveTalkbots(prev => prev.map(b => b.id === botId ? { ...b, status: 'closing', sentiment: 85 } : b));
            setTranscription(prev => prev.concat([{ sender: 'SYS', text: `Talkbot ${debtor.name} secured PTP commitment.`, timestamp: new Date().toLocaleTimeString() }]));
        }, 10000);
        setActiveTab('control-hub');
        startLiveCall({
            id: newBot.id,
            debtor: debtor,
            duration: '00:00',
            sentiment: 'neutral',
            intent: 'Autonomous Recovery',
            status: 'connecting',
            lastActivity: 'Provisioning AI Node'
        });
    };

    // --- Sub-Component: Neural Orbit Visualizer ---
    const NeuralOrbit = ({ isActive, color }: { isActive: boolean, color: string }) => (
        <div className={`relative w-48 h-48 flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-20 transition-opacity'}`}>
            <div className={`absolute inset-0 rounded-full border-2 border-dashed ${color} animate-[spin_10s_linear_infinite] opacity-20`}></div>
            <div className={`absolute inset-4 rounded-full border border-dashed ${color} animate-[spin_15s_linear_infinite_reverse] opacity-30`}></div>
            <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border-4 border-white/5 flex items-center justify-center shadow-2xl relative overflow-hidden group`}>
                <div className={`absolute inset-0 bg-${activePersona.color}-500/10 mix-blend-overlay`}></div>
                {isActive ? (
                    <div className="flex gap-1 items-end h-12">
                        {[1, 2, 3, 4, 5, 6, 8, 4, 3, 2].map((h, i) => (
                            <div
                                key={i}
                                className={`w-1.5 bg-${activePersona.color}-400 rounded-full animate-wave h-[${h * 4}px] animation-delay-[${i * 100}ms]`}
                            ></div>
                        ))}
                        <style>{`
            .animate-wave {
                animation: wave-animation 1s ease-in-out infinite alternate;
            }
            @keyframes wave-animation {
                0% { transform: scaleY(0.2); }
                100% { transform: scaleY(1); }
            }
        `}</style>
                    </div>
                ) : (
                    <Ear size={48} className="text-slate-600" />
                )}
            </div>
            {isActive && (
                <div className="absolute -bottom-4 px-4 py-1.5 bg-slate-900 rounded-full border border-white/10 shadow-xl">
                    <p className="text-[8px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Neural Link Static
                    </p>
                </div>
            )}
        </div>
    );

    const handleManualDial = () => {
        if (!manualNumber) return;
        setLastDialed(manualNumber);
        const dummyCall: ActiveCall = {
            id: `manual - ${Date.now()} `,
            debtor: { ...DUMMY_DEBTORS[0], name: `Manual: ${manualNumber} `, phoneNumber: manualNumber, amountDue: 0 },
            duration: '00:00',
            sentiment: 'neutral',
            intent: 'Manual Outbound',
            status: 'calling' as any,
            lastActivity: 'Dialing'
        };
        startLiveCall(dummyCall);
        setManualNumber('');
    };

    const handleKeypad = (num: string) => {
        setManualNumber(prev => prev + num);
    };

    // --- Voice Masking Logic ---
    const handleNextStep = () => setWizardStep(prev => Math.min(4, prev + 1));
    const handlePrevStep = () => setWizardStep(prev => Math.max(1, prev - 1));

    const startTrainingSequence = async () => {
        setIsTraining(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            setTrainingProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                const newId = `vp - ${Date.now()} `;
                const newProfile = {
                    id: newId,
                    name: enrollmentConfig.name || 'New Mask Profile',
                    status: 'trained',
                    traits: `${enrollmentConfig.basePersona}, ${enrollmentConfig.language} `,
                    baseVoice: 'Zephyr',
                    color: 'emerald',
                    lang: enrollmentConfig.language
                };
                setVoicePersonas(prev => [newProfile, ...prev]);
                setActivePersona(newProfile);
                setIsTraining(false);
                setShowWizard(false);
                setWizardStep(1);
                setTrainingProgress(0);
            }
        }, 100);
    };

    return (
        <div className="flex-1 flex flex-col gap-6 animate-in fade-in duration-500 relative text-left">

            {/* --- High-Performance Mode Selector --- */}
            <div className="bg-slate-900 rounded-[3rem] p-1.5 shadow-2xl border border-white/5 flex items-center justify-between shrink-0 mb-2">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth p-1">
                    {[
                        { id: 'control-hub', label: 'Mission Control', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { id: 'mode-ai', label: 'Neural Voicebot', icon: BrainCircuit, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                        { id: 'mode-manual', label: 'Manual Terminal', icon: Grid, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { id: 'mode-ivr', label: 'IVR Designer', icon: Voicemail, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                        { id: 'archive-vault', label: 'Dossier & Vault', icon: History, color: 'text-slate-400', bg: 'bg-slate-400/10' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2.5 px-5 py-3 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap active:scale-95 ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}
                            title={`Switch to ${tab.label}`}
                        >
                            <tab.icon size={14} className={activeTab === tab.id ? tab.color : 'opacity-40'} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
                <div className="hidden min-[1100px]:flex items-center gap-4 px-8 border-l border-white/10 shrink-0">
                    <div className="text-right">
                        <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Active Ops</p>
                        <p className="text-white font-black text-xs leading-none mt-1">{isAutodialerRunning ? '1 / 1 Node' : 'Idle'}</p>
                    </div>
                </div>
            </div>

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex gap-6 overflow-hidden">

                {/* LEFT PANEL: Queue & Status always visible on Mission Control, visible elsewhere too */}
                <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0 overflow-hidden xl:h-full">

                    {/* Active Call Card */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative shrink-0">
                        <div className={`h-1.5 w-full ${isLive ? 'bg-rose-500 animate-pulse' : 'bg-slate-200'}`}></div>
                        <div className="p-5 space-y-3">
                            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Signal size={12} className={isLive ? (isSimulation ? 'text-amber-500' : 'text-rose-500') : 'text-slate-300'} /> {isSimulation ? 'Simulated Signal' : 'Live Signal'}
                            </h3>
                            <div className="text-center py-2">
                                {isLive ? (
                                    <>
                                        <p className="text-3xl font-black text-slate-900 font-mono tracking-tight">{formatTime(callTimer)}</p>
                                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 animate-pulse ${isSimulation ? 'text-amber-500' : 'text-rose-500'}`}>
                                            {isSimulation ? 'Simulation Engine Primary' : 'Recording Active'}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-3xl font-black text-slate-300 font-mono tracking-tight">00:00</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Line Idle</p>
                                    </>
                                )}
                            </div>
                            {isLive && selectedCall && (
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-[10px]">{selectedCall.debtor.name[0]}</div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-black text-slate-900 truncate">{selectedCall.debtor.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{isDialing ? 'Dialing...' : 'Connected'}</p>
                                                {activeDialect && dialerMode === 'AI' && (
                                                    <span className="px-1 py-0.5 bg-blue-50 text-blue-600 rounded text-[7px] font-black uppercase border border-blue-100 animate-pulse">{activeDialect.dialect}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={isSimulation ? stopSimulation : stopSession} className="flex-1 py-1.5 bg-rose-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 active:scale-95 transition-all">End {isSimulation ? 'Sim' : 'Call'}</button>
                                    </div>
                                </div>
                            )}

                            {!isLive && selectedCall && (
                                <div className="p-4 bg-blue-600 rounded-2xl shadow-lg border border-blue-500 animate-in zoom-in-95">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-black text-xs">{selectedCall.debtor.name[0]}</div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-white truncate">{selectedCall.debtor.name}</p>
                                            <p className="text-[9px] font-bold text-blue-100 uppercase tracking-widest">Ready to Engage</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => startLiveCall(selectedCall)}
                                        className="w-full py-4 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <PhoneCall size={16} /> Execute Call
                                    </button>
                                </div>
                            )}

                            {!isLive && (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => { setDialerMode('AI'); toggleAutodialer(); }}
                                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${isAutodialerRunning && dialerMode === 'AI' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'}`}
                                    >
                                        AI Auto
                                    </button>
                                    <button
                                        onClick={() => { setDialerMode('HUMAN'); toggleAutodialer(); }}
                                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${isAutodialerRunning && dialerMode === 'HUMAN' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-purple-200'}`}
                                    >
                                        Agent Auto
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Queue List */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <ListMusic size={14} className="text-blue-600" /> Recovery Queue
                            </h3>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-bold">{activeCalls.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
                            {activeCalls.map((call, idx) => (
                                <div
                                    key={call.id}
                                    onClick={() => !isLive && setSelectedCallId(call.id)}
                                    className={`p-3 rounded-2xl border transition-all relative cursor-pointer active:scale-[0.98] group ${selectedCallId === call.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] border shrink-0 ${selectedCallId === call.id ? 'bg-blue-600 border-blue-500 shadow-inner' : 'bg-white border-slate-100 text-slate-400 group-hover:border-blue-200'}`}>
                                            {idx + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-black truncate">{call.debtor.name}</p>
                                            <div className="flex items-center justify-between">
                                                <p className={`text-[9px] font-bold uppercase tracking-tighter truncate ${selectedCallId === call.id ? 'text-slate-400' : 'text-slate-500'}`}>{sym}{call.debtor.amountDue.toLocaleString()}</p>
                                                {selectedCallId === call.id && !isLive && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); startLiveCall(call); }}
                                                        className="p-1 px-2 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        Call
                                                    </button>
                                                )}
                                                {call.status === 'idle' && selectedCallId !== call.id && <Clock size={10} className="text-slate-300" />}
                                                {call.status === 'closing' && <CheckCircle2 size={10} className="text-emerald-500" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CENTER PANEL: Dynamic Content based on Active Tab */}
                <div className="flex-1 overflow-hidden h-full flex flex-col rounded-[3rem] bg-white border border-slate-200 shadow-sm relative">

                    {/* --- TAB: MISSION CONTROL --- */}
                    {activeTab === 'archive-vault' && (
                        <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
                            <div className="p-8 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <History className="text-slate-500" /> Dossier Archive
                                </h3>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input type="text" placeholder="Search interactions..." className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all w-64" title="Search Interaction Archive" />
                                    </div>
                                    <button className="p-2 bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all" title="Filter interaction logs"><Filter size={18} /></button>
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                {/* Logs List */}
                                <div className="w-1/3 border-r border-slate-200 overflow-y-auto scrollbar-thin p-6 space-y-4 bg-white">
                                    {callLogs.length === 0 ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Radio size={28} className="text-slate-200" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zero Data Points</p>
                                        </div>
                                    ) : (
                                        callLogs.map(log => (
                                            <div
                                                key={log.id}
                                                onClick={() => setSelectedCallId(log.id)}
                                                className={`p-4 rounded-[1.5rem] border-2 transition-all cursor-pointer group relative ${selectedCallId === log.id ? 'bg-slate-50 border-blue-600 shadow-lg' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50'}`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${log.sentiment === 'positive' ? 'bg-emerald-500 text-white' : log.sentiment === 'hostile' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'}`}>{log.sentiment}</span>
                                                    <span className="text-[8px] font-black text-slate-300 uppercase font-mono">{log.lastActivity}</span>
                                                </div>
                                                <h4 className="text-base font-black text-slate-900 truncate mb-0.5">{log.debtor.name}</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{log.debtor.city}, {log.debtor.province}</p>
                                                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 uppercase tracking-widest"><Clock size={10} className="text-blue-500" /> {log.duration}</div>
                                                    {log.recordingSaved && <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-600 uppercase tracking-widest"><FileAudio size={10} /> AI-REC</div>}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Log Detail */}
                                <div className="flex-1 overflow-y-auto p-12 bg-white relative">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                                    {selectedCall && callLogs.find(l => l.id === selectedCall.id) ? (
                                        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                                <div className="text-left">
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">{selectedCall.debtor.name[0]}</div>
                                                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedCall.debtor.name}</h2>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] font-mono">ENCRYPTEDInteractionID // {selectedCall.id}</p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-black active:scale-95 transition-all" title="Play AI call recording">
                                                        <Play size={16} /> Play AI-REC
                                                    </button>
                                                    <button className="p-4 bg-slate-100 text-slate-400 hover:text-blue-600 rounded-[2rem] transition-all" title="Export details"><ArrowUpRight size={20} /></button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                                {[
                                                    { l: 'Duration', v: selectedCall.duration, i: Timer, c: 'text-slate-900' },
                                                    { l: 'Sentiment', v: selectedCall.sentiment, i: Activity, c: selectedCall.sentiment === 'positive' ? 'text-emerald-500' : selectedCall.sentiment === 'hostile' ? 'text-rose-500' : 'text-slate-900' },
                                                    { l: 'Outcome', v: selectedCall.outcome || 'Logged', i: CheckCircle2, c: 'text-blue-600' },
                                                    { l: 'Auth Node', v: 'PCCS-CSF-N1', i: ShieldCheck, c: 'text-slate-400' }
                                                ].map((stat, i) => (
                                                    <div key={stat.l} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                                        <stat.i size={18} className="text-slate-400 mb-4" />
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.l}</p>
                                                        <p className={`text-xl font-black capitalize ${stat.c}`}>{stat.v}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="space-y-8">
                                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                                        <Terminal size={18} className="text-blue-600" /> Digital Script Reconstruction
                                                    </h3>
                                                    <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline" title="Download PDF interaction report">
                                                        <Download size={14} /> Export PDF Dossier
                                                    </button>
                                                </div>
                                                <div className="space-y-6 bg-slate-950 p-10 rounded-[3rem] shadow-2xl border border-white/5 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit size={120} className="text-blue-500" /></div>
                                                    {selectedCall.transcript?.map((line, idx) => (
                                                        <div key={idx} className={`flex gap-6 relative z-10 ${line.sender === 'AI' || line.sender === 'AGENT' ? 'flex-row' : (line.sender === 'SYS' ? 'justify-center my-8' : 'flex-row-reverse text-right')}`}>
                                                            {line.sender !== 'SYS' && <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-[10px] shadow-xl ${line.sender === 'AI' ? 'bg-blue-600 text-white' : line.sender === 'AGENT' ? 'bg-purple-600 text-white' : 'bg-white text-slate-900'}`}>{line.sender}</div>}
                                                            <div className={`max-w-[75%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed shadow-lg ${line.sender === 'AI' || line.sender === 'AGENT' ? 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none' : (line.sender === 'SYS' ? 'bg-blue-500/10 text-blue-400 py-2 px-6 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20' : 'bg-white text-slate-900 rounded-tr-none')}`}>
                                                                {line.text}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-8 animate-pulse">
                                                <History size={48} className="text-slate-200" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Select a Node Interaction</h3>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-sm">Dossier access requires node selection from the Interaction Archive.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'control-hub' && (
                        <div className="flex-1 flex overflow-hidden">
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        <Activity className="text-blue-600" /> Command Interface
                                    </h3>
                                    <div className="flex gap-2">
                                        {isSimulation && <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-200 animate-pulse">Simulation Sandbox</span>}
                                        {voiceMaskingActive && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Neural Mask Active</span>}
                                        {isRecordingEnabled && !isSimulation && <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100">REC ON</span>}
                                    </div>
                                </div>

                                <div className="flex-1 p-8 overflow-y-auto scrollbar-thin space-y-8 bg-slate-50/50">
                                    {/* Stream Output */}
                                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl min-h-[400px] flex flex-col relative overflow-hidden border border-slate-800">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                                        <div className="relative z-10 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-8 opacity-50">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><Terminal size={12} /> Live Transcript Node</span>
                                                <span className="text-[10px] font-mono">{activePersona.name} Protocol</span>
                                            </div>

                                            <div className="flex-1 space-y-4 overflow-y-auto scrollbar-none max-h-[500px]">
                                                {transcription.length === 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                                        <NeuralOrbit isActive={isLive} color={isSimulation ? 'border-amber-500/50' : 'border-blue-500/50'} />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-8 animate-pulse text-slate-400">{isSimulation ? 'Simulation Engine Primary' : 'Awaiting Audio Stream...'}</p>
                                                    </div>
                                                ) : (
                                                    transcription.map((line, idx) => (
                                                        <div key={idx} className={`flex gap-4 animate-in slide-in-from-bottom-2 ${line.sender === 'AI' || line.sender === 'AGENT' ? 'flex-row' : (line.sender === 'SYS' ? 'justify-center' : 'flex-row-reverse text-right')}`}>
                                                            {line.sender !== 'SYS' && <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-[9px] shadow-lg ${line.sender === 'AI' ? 'bg-blue-600 text-white' : line.sender === 'AGENT' ? 'bg-purple-600 text-white' : 'bg-white text-slate-900'}`}>{line.sender}</div>}
                                                            <div className={`max-w-[80%] p-4 rounded-[1.5rem] text-xs font-medium leading-relaxed shadow-sm ${line.sender === 'AI' || line.sender === 'AGENT' ? 'bg-white/10 text-white rounded-tl-none' : (line.sender === 'SYS' ? 'bg-slate-800/50 text-slate-400 py-1 px-4 text-[10px] uppercase tracking-widest' : 'bg-white text-slate-900 rounded-tr-none')}`}>
                                                                {line.text}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                                <div ref={transcriptEndRef} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <button onClick={() => setIsRecordingEnabled(!isRecordingEnabled)} className={`p-6 rounded-[2rem] border transition-all text-left group ${isRecordingEnabled ? 'bg-white border-rose-200 shadow-lg shadow-rose-100' : 'bg-slate-100 border-transparent opacity-60'}`}>
                                            <Disc size={24} className={isRecordingEnabled ? 'text-rose-500' : 'text-slate-400'} />
                                            <p className="mt-4 text-sm font-black text-slate-900">Recording</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{isRecordingEnabled ? 'Enabled' : 'Disabled'}</p>
                                        </button>

                                        <button onClick={() => setVoiceMaskingActive(!voiceMaskingActive)} className={`p-6 rounded-[2rem] border transition-all text-left group ${voiceMaskingActive ? 'bg-white border-emerald-200 shadow-lg shadow-emerald-100' : 'bg-slate-100 border-transparent opacity-60'}`}>
                                            <Zap size={24} className={voiceMaskingActive ? 'text-emerald-500' : 'text-slate-400'} />
                                            <p className="mt-4 text-sm font-black text-slate-900">Masking</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{voiceMaskingActive ? 'Active' : 'Bypassed'}</p>
                                        </button>

                                        <div className="col-span-2 bg-white rounded-[2rem] border border-slate-200 p-6 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">Active Persona</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <h4 className="text-lg font-black text-slate-900">{activePersona.name}</h4>
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase">{activePersona.lang}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => setActiveTab('voice-masking')} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-all" title="Configure Voice Profile">
                                                <Settings size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDEBAR: SCRIPTS */}
                            <div className="w-96 border-l border-slate-200 bg-white overflow-y-auto scrollbar-thin flex flex-col shrink-0">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <LayoutTemplate size={16} className="text-blue-500" /> Interaction Scripts
                                    </h4>
                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase border border-blue-100">Live Guide</span>
                                </div>
                                <div className="p-8 space-y-8">
                                    {[
                                        { t: 'Opening Salutation', c: `"${activeDialect?.greeting || 'Magandang araw'}, strictly for ${selectedCall?.debtor.name || 'the debtor'}. This is ${user.name} from PCCS regarding an urgent financial matter."`, s: 'Compliant ($10173)' },
                                        { t: 'Identity Verification', c: '"For security validation, can you please confirm the last 4 digits of your ID on file or your registered birthdate?"', s: 'Required' },
                                        { t: 'Debt Disclosure', c: `"We are calling to discuss account reference ${selectedCall?.debtor.id.slice(-6).toUpperCase() || 'REF-88'} with a current liability of ${sym}${selectedCall?.debtor.amountDue.toLocaleString() || '0.00'}."`, s: 'Sensitive' },
                                        { t: 'PTP Negotiation', c: '"We can offer a structured settlement node of 3 installments if you commit to the first payment by Friday. Would this resolve your liquidity blockage?"', s: 'Tactical' },
                                        { t: 'Closing Protocol', c: '"This call has been recorded for outcome validation. Please expect a confirmation SMS within 5 minutes. Have a productive day."', s: 'Final' }
                                    ].map(script => (
                                        <div key={script.t} className="space-y-3 group border-b border-slate-50 pb-6 last:border-0">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{script.t}</p>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase">{script.s}</span>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-all relative">
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => { navigator.clipboard.writeText(script.c); alert('Script copied to logic clipboard'); }} className="p-1.5 bg-white shadow-sm rounded-lg text-slate-400 hover:text-blue-600" title="Copy script to clipboard"><Command size={12} /></button>
                                                </div>
                                                <p className="text-xs font-bold text-slate-700 leading-relaxed italic">{script.c}</p>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white space-y-4 shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full blur-2xl"></div>
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-blue-400">AI Objection Handler</h5>
                                        <p className="text-xs font-medium text-slate-300 italic leading-relaxed">"If debtor mentions medical emergency, immediately pivot to 'Compassion Protocol' and request documentation for a 15-day grace node."</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: AI AUTO-PILOT (Combined Dialer + Voice Bot) --- */}
                    {activeTab === 'mode-ai' && (
                        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-8 space-y-8 scrollbar-thin overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Mode Selection */}
                                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                            <Rocket size={18} className="text-blue-500" /> AI Dialing Mode
                                        </h4>
                                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 italic">Gemini 2.5 Polyglot</div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <button
                                            onClick={() => setDialerMode('AI')}
                                            className={`p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden ${dialerMode === 'AI' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                                        >
                                            <BrainCircuit size={32} className="mb-6" />
                                            <h5 className="text-xl font-black">Neural Voicebot</h5>
                                            <p className={`text-sm mt-2 font-medium leading-relaxed ${dialerMode === 'AI' ? 'text-indigo-100' : 'text-slate-500'}`}>Full autopilot. AI uses neural voice prints to negotiate and secure payments autonomously.</p>
                                        </button>
                                        <button
                                            onClick={() => setDialerMode('HUMAN')}
                                            className={`p-8 rounded-[2.5rem] border-2 text-left transition-all ${dialerMode === 'HUMAN' ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                                        >
                                            <PhoneOutgoing size={32} className="mb-6" />
                                            <h5 className="text-xl font-black">Predictive Autodialer</h5>
                                            <p className={`text-sm mt-2 font-medium leading-relaxed ${dialerMode === 'HUMAN' ? 'text-blue-100' : 'text-slate-500'}`}>High-velocity human-led dialing. AI provides voice masking and real-time response suggestions.</p>
                                        </button>
                                    </div>
                                </div>
                                {/* Regional Intelligence */}
                                <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Globe size={18} className="text-blue-400" /> Regional Intelligence
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div><p className="text-sm font-black">Geo-Dialect Sync</p><p className="text-[10px] text-slate-500">Auto-greet based on borrower city</p></div>
                                            <div onClick={() => setAiGeoLocation(!aiGeoLocation)} className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors ${aiGeoLocation ? 'bg-blue-600 justify-end' : 'bg-white/10 justify-start'}`}><div className="w-5 h-5 bg-white rounded-full shadow-sm"></div></div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div><p className="text-sm font-black">Polyglot Mode</p><p className="text-[10px] text-slate-500">Enable fluid Taglish/Dialect switching</p></div>
                                            <div onClick={() => setAiPolyglotMode(!aiPolyglotMode)} className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors ${aiPolyglotMode ? 'bg-indigo-600 justify-end' : 'bg-white/10 justify-start'}`}><div className="w-5 h-5 bg-white rounded-full shadow-sm"></div></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                        {['Manila', 'Cebu', 'Davao', 'Iloilo'].map(city => (
                                            <div key={city} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">{city}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-10 rounded-[3.5rem] border-2 border-dashed border-indigo-100 flex flex-col items-center text-center space-y-6">
                                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600">
                                    <Sparkles size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Neural Simulation Arena</h3>
                                    <p className="text-sm font-medium text-slate-500 max-w-lg mt-2 italic leading-relaxed">
                                        Stress-test your bot's negotiation tact and dialect adaptation in a safe, controlled sandbox. Observe live metrics, transcript flow, and sentiment handling before pushing to production.
                                    </p>
                                </div>
                                <button
                                    onClick={startTrainingSimulation}
                                    className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-700 shadow-2xl hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-4"
                                    title="Start AI Voicebot Simulation"
                                >
                                    <Play size={20} fill="currentColor" />
                                    Launch Bot Simulation
                                </button>
                                <div className="flex gap-4 pt-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                        <Target size={14} className="text-emerald-500" /> Dialect Accuracy: 98.2%
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                        <Scale size={14} className="text-amber-500" /> Compliance Node: Safe
                                    </div>
                                </div>
                            </div>

                            {/* AI Talkbot Production Hub */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                <div className="xl:col-span-2 bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20"><Rocket size={20} /></div>
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900 tracking-tight">Production Launchpad</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deploy Autonomous Talkbots to Queue</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">System Ready</span>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activeCalls.slice(0, 4).map((call) => (
                                                <div key={call.id} className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white rounded-xl shadow-sm"><User size={16} className="text-slate-400" /></div>
                                                            <p className="text-sm font-black text-slate-900 truncate">{call.debtor.name}</p>
                                                        </div>
                                                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">{sym}{call.debtor.amountDue.toLocaleString()}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => startAutonomousTalkbot(call.debtor)}
                                                        className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all flex items-center justify-center gap-2"
                                                        title="Launch Autonomous AI Agent"
                                                    >
                                                        <Play size={12} fill="currentColor" /> Deploy AI Agent
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="mb-8">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Live Missions</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Active Autonomous Conversions</p>
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        {activeTalkbots.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center opacity-30">
                                                <Headphones size={48} className="mb-4" />
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em]">No Active Deployments</p>
                                            </div>
                                        ) : (
                                            activeTalkbots.map(bot => (
                                                <div key={bot.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-xs font-black">{bot.debtor.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                                        <span>Node: {bot.persona}</span>
                                                        <span>Started: {bot.startTime}</span>
                                                    </div>
                                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className={`h-full bg-blue-500 w-[${bot.sentiment}%]`}></div>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest text-slate-600 mt-2">
                                                        <span>Sentiment: {bot.sentiment}%</span>
                                                        <span>Signal: 100% Secure</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="mt-8 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500 rounded-lg"><Signal size={14} /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest">Uplink Stable</p>
                                                <p className="text-[8px] text-blue-300 uppercase tracking-[0.3em]">9ms Latency // Node Active</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* --- TAB: MANUAL CALL TERMINAL --- */}
                    {activeTab === 'mode-manual' && (
                        <div className="flex-1 flex flex-col p-8 bg-slate-50 overflow-y-auto scrollbar-thin">
                            <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {/* Keypad Section */}
                                <div className="bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl border border-slate-800 flex flex-col items-center">
                                    <div className="w-full mb-8 p-6 bg-slate-800 rounded-3xl text-right border border-slate-700/50">
                                        <p className="text-4xl font-mono font-black text-white tracking-widest">{manualNumber || 'Ready...'}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(key => (
                                            <button key={key} onClick={() => handleKeypad(key)} className="w-16 h-16 rounded-full bg-slate-800 text-white font-black text-xl hover:bg-slate-700 active:scale-90 transition-all shadow-lg border border-white/5" title={`Input ${key}`}>{key}</button>
                                        ))}
                                    </div>
                                    <div className="flex gap-6">
                                        <button onClick={handleManualDial} className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-95 transition-all" title="Initiate Manual Call Sequence"><PhoneOutgoing size={32} /></button>
                                        <button onClick={() => setManualNumber(prev => prev.slice(0, -1))} className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition-all" title="Delete Last Character"><X size={24} /></button>
                                    </div>
                                </div>

                                {/* Protocol Info */}
                                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-6">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-3"><Info size={18} className="text-blue-500" /> Manual Protocol</h4>
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed italic">Manual dialing triggers the standard agent interface. Ensure voice masking is configured in the Control Hub if anonymity is required.</p>
                                    <div className="space-y-4 pt-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Last Dialed</span>
                                            <span className="text-xs font-black text-slate-900">{lastDialed || 'None'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: IVR STUDIO --- */}
                    {activeTab === 'mode-ivr' && (
                        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
                            <div className="p-8 border-b border-slate-200 bg-white flex justify-between items-center">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <Voicemail className="text-orange-500" /> IVR Flow Designer
                                </h3>
                                <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all" title="Save Flow config">Save Flow</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 relative ivr-dots-canvas">
                                <div className="max-w-3xl mx-auto space-y-8 relative z-10">
                                    {ivrNodes.map((node, i) => (
                                        <div key={node.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 border-4 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-500 z-10">{i + 1}</div>
                                                {i < ivrNodes.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>}
                                            </div>
                                            <div className="flex-1 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-100">{node.trigger}</div>
                                                    <button className="text-slate-300 hover:text-red-500 transition-colors" title="Remove Node"><Trash2 size={16} /></button>
                                                </div>
                                                <h4 className="text-lg font-black text-slate-900">{node.action}</h4>
                                                {node.next && (
                                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
                                                        <ArrowRight size={14} /> Goes to Step {node.next}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-[2rem] text-slate-400 font-bold uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2" title="Add new node">
                                        <Plus size={16} /> Add Logic Node
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* --- WIZARD MODAL (Consolidated) --- */}
            {
                showWizard && (
                    <div className="fixed inset-0 z-[2000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="text-xl font-black text-slate-900">New Voice Persona</h3>
                                <button onClick={() => setShowWizard(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all" title="Close Wizard"><X size={20} /></button>
                            </div>

                            <div className="p-10 flex-1">
                                {isTraining ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-8">
                                        <div className="relative w-24 h-24">
                                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                            <Cpu className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-black text-slate-900">Synthesizing Neural Map...</h4>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">{trainingProgress}% Complete</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-900 uppercase">Persona Name</label>
                                            <input
                                                type="text"
                                                value={enrollmentConfig.name}
                                                onChange={(e) => setEnrollmentConfig({ ...enrollmentConfig, name: e.target.value })}
                                                placeholder="e.g. Director Sarah"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-900 uppercase">Base Language</label>
                                            <select
                                                value={enrollmentConfig.language}
                                                onChange={(e) => setEnrollmentConfig({ ...enrollmentConfig, language: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all appearance-none"
                                                title="Select Language"
                                            >
                                                <option value="Taglish">Taglish (Standard)</option>
                                                <option value="English">English (Formal)</option>
                                                <option value="Tagalog">Tagalog (Native)</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={startTrainingSequence}
                                            disabled={!enrollmentConfig.name}
                                            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all mt-6 disabled:opacity-50"
                                            title="Initiate Neural Training"
                                        >
                                            Start Training Sequence
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
            .scrollbar-none::-webkit-scrollbar { display: none; }
            .scrollbar-thin::-webkit-scrollbar { width: 4px; }
            .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .ivr-dots-canvas {
                background-image: radial-gradient(#94a3b8 1px, transparent 1px);
                background-size: 24px 24px;
            }
            `}</style>
        </div >
    );
}

export default VoiceOperationsCenter;
