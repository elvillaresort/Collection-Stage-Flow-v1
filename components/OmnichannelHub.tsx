
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Send,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Smartphone,
  Mail,
  MessageCircle,
  Zap,
  User,
  Clock,
  ShieldCheck,
  Sparkles,
  Loader2,
  Check,
  CheckCheck,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  Plus,
  X,
  Globe,
  Signal,
  PhoneCall,
  FileText,
  Download,
  History,
  Activity as ActivityIcon,
  Facebook,
  Instagram,
  SendHorizontal,
  Hash,
  Link,
  Ban,
  ThumbsUp,
  CreditCard,
  FileBadge
} from 'lucide-react';
import { DUMMY_DEBTORS } from '../constants';
import { Debtor, CommunicationType, Activity, User as UserType, CaseStatus, SystemSettings } from '../types';
import { generateContextualReply } from '../services/geminiService';
import { supabaseService } from '../services/supabaseService';

interface Message {
  id: string;
  sender: 'agent' | 'debtor' | 'system';
  content: string;
  timestamp: string;
  channel: CommunicationType;
  status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  debtor: Debtor;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  channel: CommunicationType;
  messages: Message[];
}

const DUMMY_CONVERSATIONS: Conversation[] = DUMMY_DEBTORS.map((d, idx) => {
  const channels = [
    CommunicationType.VIBER,
    CommunicationType.FB_MESSENGER,
    CommunicationType.WHATSAPP,
    CommunicationType.TELEGRAM,
    CommunicationType.SMS,
    CommunicationType.EMAIL,
    CommunicationType.TWITTER,
    CommunicationType.INSTAGRAM
  ];
  const channel = channels[idx % channels.length];

  return {
    id: 'conv-' + d.id,
    debtor: d,
    lastMessage: idx % 2 === 0 ? "I will pay by tomorrow via GCash." : "Please stop the automated calls.",
    lastTimestamp: "10:45 AM",
    unreadCount: idx === 0 ? 1 : 0,
    channel: channel,
    messages: [
      { id: 'm1', sender: 'system', content: 'Nexus AI initiated contact via ' + channel, timestamp: '9:00 AM', channel: channel },
      { id: 'm2', sender: 'debtor', content: idx % 2 === 0 ? "When can I pay the partial amount?" : "Payment link received, thank you.", timestamp: '10:30 AM', channel: channel },
      { id: 'm3', sender: 'agent', content: "Our system shows a standard settlement is available. Do you want the details?", timestamp: '10:40 AM', channel: channel, status: 'read' }
    ]
  };
});

interface OmnichannelHubProps {
  onAddActivity: (activity: Activity) => void;
  user: UserType;
  settings: SystemSettings;
}

const OmnichannelHub: React.FC<OmnichannelHubProps> = ({ onAddActivity, user, settings }) => {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [activeChannel, setActiveChannel] = useState<CommunicationType>(CommunicationType.VIBER);
  const [inputValue, setInputValue] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState<'All' | CommunicationType>('All');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sym = settings.localization.currencySymbol;

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      const { data, error } = await supabaseService.getConversations();
      if (!error && data) {
        // Map DB conversations to local state
        const mapped: Conversation[] = data.map((c: any) => ({
          id: c.id,
          debtor: { id: c.debtor_id, name: c.debtors?.name, loanId: c.debtors?.loan_id } as any,
          lastMessage: c.last_message,
          lastTimestamp: new Date(c.last_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unreadCount: c.unread_count,
          channel: c.channel as CommunicationType,
          messages: [] // Fetch messages when selected
        }));
        setConversations(mapped);
      }
      setLoading(false);
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      const fetchMessages = async () => {
        const { data, error } = await supabaseService.getOmniMessages(selectedConv.id);
        if (!error && data) {
          const mappedMessages: Message[] = data.map((m: any) => ({
            id: m.id,
            sender: m.sender_type as any,
            content: m.content,
            timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            channel: m.channel as CommunicationType,
            status: m.status as any
          }));
          setSelectedConv(prev => prev ? { ...prev, messages: mappedMessages } : null);
        }
      };
      fetchMessages();
    }
  }, [selectedConv?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConv, mobileView, selectedConv?.messages]);

  useEffect(() => {
    if (selectedConv) {
      setActiveChannel(selectedConv.channel);
    }
  }, [selectedConv]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedConv) return;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessageData = {
      conversation_id: selectedConv.id,
      sender_type: 'agent',
      sender_id: user.id,
      content: inputValue,
      channel: activeChannel,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    supabaseService.sendOmniMessage(newMessageData).then(({ error }) => {
      if (!error) {
        const newMessage: Message = {
          id: Date.now().toString(), // Should use ID from DB
          sender: 'agent',
          content: inputValue,
          timestamp: timeNow,
          channel: activeChannel,
          status: 'sent'
        };
        setSelectedConv(prev => prev ? {
          ...prev,
          messages: prev.messages.concat(newMessage),
          lastMessage: inputValue,
          lastTimestamp: newMessage.timestamp,
        } : null);
        setInputValue('');
        onAddActivity({
          id: 'act-' + Date.now(),
          debtorId: selectedConv.debtor.id,
          type: activeChannel,
          date: new Date().toLocaleString(),
          agent: user.name,
          outcome: 'Message Dispatched',
          notes: 'Omnichannel reply sent via Hub.'
        });
      }
    });
  };

  const handleAiDraft = async () => {
    if (!selectedConv) return;
    setIsDrafting(true);
    try {
      const draft = await generateContextualReply(selectedConv.debtor, selectedConv.messages, activeChannel);
      setInputValue(draft);
    } catch (err) { console.error(err); } finally { setIsDrafting(false); }
  };

  /* AI SCANNING STATE */
  const [isScanning, setIsScanning] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);
  const [foundPlatform, setFoundPlatform] = useState<CommunicationType | null>(null);

  const handleScanFootprint = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Simulate finding a random new platform for the first debtor or a random one
      const capabilities = [CommunicationType.INSTAGRAM, CommunicationType.TWITTER];
      const randomPlatform = capabilities[Math.floor(Math.random() * capabilities.length)];
      setFoundPlatform(CommunicationType.INSTAGRAM); // Force Instagram for demo or random
      setShowScanResult(true);
    }, 2500);
  };

  const handleAddFoundChannel = () => {
    if (!foundPlatform) return;

    // Create new conversation
    const newConv: Conversation = {
      id: `conv-new-${Date.now()}`,
      debtor: DUMMY_DEBTORS[0], // Attach to first debtor for demo
      lastMessage: "Account discovered via Digital Footprint Scan",
      lastTimestamp: "Just now",
      unreadCount: 1,
      channel: foundPlatform,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'system',
          content: `Nexus AI detected this ${foundPlatform} account matching the debtor's digital footprint (Confidence: 98%). Channel added to hub.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: foundPlatform
        }
      ]
    };

    setConversations(prev => [newConv, ...prev]);
    setShowScanResult(false);
    setFoundPlatform(null);
    setFilterChannel('All'); // Reset filter to show the new item
    setSelectedConv(newConv); // Auto select
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const matchesSearch = c.debtor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.debtor.loanId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChannel = filterChannel === 'All' || c.channel === filterChannel;
      return matchesSearch && matchesChannel;
    });
  }, [searchQuery, filterChannel, conversations]);

  const hubChannels = useMemo(() => {
    const supported = [
      CommunicationType.VIBER,
      CommunicationType.FB_MESSENGER,
      CommunicationType.WHATSAPP,
      CommunicationType.TELEGRAM,
      CommunicationType.SMS,
      CommunicationType.INSTAGRAM,
      CommunicationType.TWITTER,
      CommunicationType.EMAIL
    ];
    const base = ['All'];
    supported.forEach(s => base.push(s));
    return base;
  }, []);

  const getChannelTheme = (channel: CommunicationType) => {
    switch (channel) {
      case CommunicationType.VIBER: return { color: 'bg-purple-600', text: 'text-purple-600', bg: 'bg-purple-50', icon: <Smartphone size={14} /> };
      case CommunicationType.FB_MESSENGER: return { color: 'bg-blue-600', text: 'text-blue-600', bg: 'bg-blue-50', icon: <Facebook size={14} /> };
      case CommunicationType.WHATSAPP: return { color: 'bg-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50', icon: <MessageCircle size={14} /> };
      case CommunicationType.TELEGRAM: return { color: 'bg-sky-500', text: 'text-sky-600', bg: 'bg-sky-50', icon: <SendHorizontal size={14} /> };
      case CommunicationType.INSTAGRAM: return { color: 'bg-pink-600', text: 'text-pink-600', bg: 'bg-pink-50', icon: <Instagram size={14} /> };
      case CommunicationType.TWITTER: return { color: 'bg-slate-900', text: 'text-slate-900', bg: 'bg-slate-50', icon: <Hash size={14} /> };
      case CommunicationType.EMAIL: return { color: 'bg-slate-800', text: 'text-slate-800', bg: 'bg-slate-100', icon: <Mail size={14} /> };
      case CommunicationType.SMS: return { color: 'bg-blue-500', text: 'text-blue-500', bg: 'bg-blue-50', icon: <MessageSquare size={14} /> };
      default: return { color: 'bg-slate-400', text: 'text-slate-400', bg: 'bg-slate-50', icon: <Zap size={14} /> };
    }
  };

  return (
    <div className="h-full w-full bg-white flex animate-in fade-in duration-500 transition-all relative text-left">

      {/* SCANNING OVERLAY */}
      {isScanning && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-sm text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-blue-100 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center animate-pulse">
                  <Zap size={32} className="text-blue-600" />
                </div>
              </div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Scanning Digital Footprint</h3>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">Nexus AI is analyzing public social registers and OSINT databases for debtor matches...</p>
          </div>
        </div>
      )}

      {/* SCAN RESULT OVERLAY */}
      {showScanResult && foundPlatform && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-sm text-center transform transition-all scale-100">
            <div className={'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ' + getChannelTheme(foundPlatform).color + ' text-white'}>
              {getChannelTheme(foundPlatform).icon}
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Account Discovered!</h3>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed mb-6">
              We found a highly probable match on <strong>{foundPlatform}</strong> for <strong>{DUMMY_DEBTORS[0].name}</strong>.<br />
              <span className="text-emerald-600 font-bold">Confidence Score: 98%</span>
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setShowScanResult(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all">Dismiss</button>
              <button onClick={handleAddFoundChannel} className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">Add Channel</button>
            </div>
          </div>
        </div>
      )}

      <div className={(mobileView === 'chat' ? 'hidden md:flex' : 'flex') + ' w-full md:w-80 lg:w-96 border-r border-slate-100 flex-col shrink-0 bg-slate-50/50 transition-all duration-300'}>
        <div className="p-5 md:p-8 border-b border-slate-100 bg-white space-y-4 md:space-y-6 text-left shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Omnichannel Hub</h2>
            <button onClick={handleScanFootprint} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-100" title="Scan Digital Footprint">
              <Zap size={12} className={isScanning ? "animate-pulse" : ""} /> AI Scan
            </button>
          </div>
          <div className="relative"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input type="text" placeholder="Search accounts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-slate-100 rounded-2xl border-none focus:ring-4 focus:ring-blue-500/10 text-[11px] sm:text-xs font-black outline-none transition-all" /></div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 touch-pan-x">
            {hubChannels.map(ch => (
              <button
                key={ch}
                onClick={() => setFilterChannel(ch as any)}
                className={'px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 active:scale-95 ' + (filterChannel === ch ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200')}
                title={`Filter by ${ch}`}
              >
                {ch === 'All' ? 'All Chats' : ch}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3 scrollbar-thin scroll-smooth">
          {filteredConversations.map((conv) => {
            const theme = getChannelTheme(conv.channel);
            return (
              <div key={conv.id} onClick={() => { setSelectedConv(conv); setMobileView('chat'); }} className={'p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] cursor-pointer transition-all border-2 group relative overflow-hidden active:scale-[0.98] ' + (selectedConv?.id === conv.id ? 'bg-white border-blue-600 shadow-xl' : 'bg-white/40 border-transparent hover:bg-white hover:border-slate-100')}>
                <div className="flex gap-3 md:gap-4 relative z-10 text-left">
                  <div className="relative shrink-0"><div className={'w-11 h-11 md:w-12 md:h-12 rounded-[1rem] md:rounded-[1.2rem] overflow-hidden border-2 transition-all duration-500 ' + (selectedConv?.id === conv.id ? 'border-blue-600 rotate-3' : 'border-white')}><img src={'https://picsum.photos/seed/' + conv.debtor.id + '/100/100'} alt="" /></div><div className={'absolute -bottom-1 -right-1 w-5 h-5 md:w-6 md:h-6 rounded-lg ' + theme.color + ' text-white flex items-center justify-center border-2 border-white shadow-lg group-hover:scale-110 transition-all'}>{theme.icon}</div></div>
                  <div className="flex-1 min-w-0"><div className="flex justify-between items-start mb-1"><h4 className="text-[11px] sm:text-xs md:text-sm font-black text-slate-900 truncate">{conv.debtor.name}</h4>{conv.unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse mt-1"></span>}</div><p className="text-[10px] md:text-[11px] text-slate-500 truncate font-medium">{conv.lastMessage}</p><p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mt-1 md:mt-2">{conv.lastTimestamp} • {conv.channel}</p></div>
                </div>
              </div>
            );
          })}
          {filteredConversations.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center opacity-30 grayscale"><MessageSquare size={48} className="mb-4" /><p className="text-[10px] font-black uppercase tracking-widest">No matching threads</p></div>
          )}
        </div>
      </div>
      <div className={(mobileView === 'list' ? 'hidden md:flex' : 'flex') + ' flex-1 flex-col bg-white overflow-hidden transition-all duration-500'}>
        {selectedConv ? (
          <>
            <div className="p-4 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/20 shrink-0 z-10 shadow-sm">
              <div className="flex items-center gap-3 md:gap-6 min-w-0">
                <button onClick={() => setMobileView('list')} className="md:hidden p-2.5 text-slate-400 bg-white border border-slate-200 rounded-xl active:scale-90 transition-all shadow-sm" title="Back to List"><ArrowLeft size={18} /></button>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-[1rem] md:rounded-[1.8rem] bg-slate-100 overflow-hidden border-2 border-white shadow-md shrink-0"><img src={'https://picsum.photos/seed/' + selectedConv.debtor.id + '/100/100'} alt="" /></div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2 md:gap-3"><h3 className="text-xs sm:text-sm md:text-xl font-black text-slate-900 tracking-tight leading-none truncate max-w-[100px] xs:max-w-none">{selectedConv.debtor.name}</h3><div className={'hidden sm:flex px-2 py-1 rounded-lg ' + getChannelTheme(selectedConv.channel).bg + ' ' + getChannelTheme(selectedConv.channel).text + ' text-[9px] font-black uppercase tracking-widest items-center gap-2 border border-current/20'}>{getChannelTheme(selectedConv.channel).icon} {selectedConv.channel}</div></div>
                  <div className="flex items-center gap-2 md:gap-4 mt-1 md:mt-2"><span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active Link</span><span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md uppercase tracking-tighter truncate">{selectedConv.debtor.loanId}</span></div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  className="p-2.5 md:p-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-slate-600 shadow-sm active:scale-90 transition-all hover:border-blue-200 hover:text-blue-600"
                  title="Initiate Voice Call"
                >
                  <PhoneCall size={18} />
                </button>
                <button
                  className="p-2.5 md:p-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-slate-600 shadow-sm active:scale-90 transition-all hidden xs:block"
                  title="More Options"
                >
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 flex overflow-hidden relative bg-slate-50/10">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-10 space-y-5 md:space-y-8 scroll-smooth scrollbar-none">
                {selectedConv.messages.map((msg) => (
                  <div key={msg.id} className={'flex animate-in slide-in-from-bottom-2 duration-300 ' + (msg.sender === 'agent' ? 'justify-end' : (msg.sender === 'system' ? 'justify-center' : 'justify-start'))}>
                    {msg.sender === 'system' ? (
                      <div className="px-5 md:px-6 py-2 bg-white/80 border border-slate-100 rounded-full text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 md:gap-3 shadow-sm backdrop-blur-sm"><ShieldCheck size={12} className="text-blue-500" /> {msg.content}</div>
                    ) : (
                      <div className={'max-w-[85%] md:max-w-[70%] space-y-1.5 md:space-y-2 ' + (msg.sender === 'agent' ? 'items-end' : 'items-start') + ' flex flex-col text-left'}>
                        <div className={'p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] text-[11px] sm:text-xs md:text-sm font-semibold leading-relaxed shadow-sm transition-all ' + (msg.sender === 'agent' ? getChannelTheme(activeChannel).color + ' text-white rounded-tr-none shadow-xl shadow-blue-500/10 active:scale-[0.98]' : 'bg-white text-slate-900 border border-slate-100 rounded-tl-none active:scale-[0.98]')}>
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-2 px-1.5"><span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase">{msg.timestamp}</span>{msg.sender === 'agent' && <CheckCheck size={12} className="text-emerald-500" />}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 md:p-8 bg-white border-t border-slate-100 shrink-0 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
              <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2"><button onClick={handleAiDraft} disabled={isDrafting} className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:bg-blue-600 disabled:opacity-50 active:scale-95" title="Generate AI Draft">{isDrafting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-blue-400" />} AI <span className="hidden xs:inline">Draft</span></button><button className="p-2 md:p-3 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl md:rounded-2xl hover:bg-white hover:text-purple-600 hover:border-purple-200 transition-all active:scale-90" title="Attach Image"><ImageIcon size={18} /></button></div>
                  <div className="flex bg-slate-100 p-1 rounded-xl md:rounded-2xl border border-slate-200 overflow-x-auto scrollbar-none max-w-[150px] xs:max-w-none">
                    {[
                      CommunicationType.VIBER,
                      CommunicationType.FB_MESSENGER,
                      CommunicationType.WHATSAPP,
                      CommunicationType.TELEGRAM,
                      CommunicationType.SMS,
                      CommunicationType.INSTAGRAM,
                      CommunicationType.TWITTER,
                      CommunicationType.EMAIL
                    ].map(ch => (
                      <button key={ch} onClick={() => setActiveChannel(ch as any)} className={'p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all active:scale-90 ' + (activeChannel === ch ? getChannelTheme(ch).color + ' text-white shadow-xl' : 'text-slate-400 hover:text-slate-600')} title={ch}>{getChannelTheme(ch).icon}</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-3 md:gap-5"><div className="flex-1 relative transition-all"><textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Type recovery message..." rows={1} className="w-full px-5 md:px-7 py-3 md:py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all text-xs md:text-sm font-bold outline-none resize-none scrollbar-none shadow-inner" onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} /><button className="absolute right-4 bottom-4 md:bottom-5 p-1 text-slate-200 hover:text-blue-500 transition-colors hidden sm:block active:scale-90" title="Attach Emoji"><Smile size={20} /></button></div><button onClick={handleSendMessage} className={'p-3 md:p-5 text-white rounded-2xl md:rounded-[2rem] transition-all shadow-2xl active:scale-90 hover:opacity-90 ' + getChannelTheme(activeChannel).color} title="Dispatch Transmission"><Send size={20} className="md:w-6 md:h-6" /></button></div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 text-center animate-in fade-in zoom-in-95 duration-700"><div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center mb-8 rotate-12 group transition-all hover:rotate-0 shadow-inner"><MessageSquare size={48} className="text-slate-200 md:w-16 md:h-16 group-hover:text-blue-100 transition-colors" /></div><h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">Enterprise Messaging Hub</h2><p className="text-[10px] md:text-sm text-slate-400 mt-4 max-w-sm font-medium leading-relaxed italic">Select a verified recovery matter from the directory to initialize the communication session.</p></div>
        )}
      </div>
    </div>
  );
};

export default OmnichannelHub;
