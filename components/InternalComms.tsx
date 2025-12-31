
import * as React from 'react';
import {
   Search,
   MessageSquare,
   Phone,
   Video,
   Paperclip,
   Send,
   MoreVertical,
   ShieldCheck,
   History,
   X,
   Maximize2,
   Download,
   FileText,
   ImageIcon,
   User as UserIcon,
   PhoneCall,
   PhoneOff,
   Mic,
   MicOff,
   Volume2,
   Clock,
   CheckCheck,
   PlusCircle,
   FileBox,
   Monitor,
   Users,
   AlertCircle,
   FolderOpen,
   Calendar,
   ShieldAlert,
   ArrowUpRight,
   ArrowDownLeft,
   Zap,
   Check,
   ChevronUp,
   Minimize2,
   BellRing,
   Sparkles,
   UserCheck,
   Eye,
   Terminal,
   Lock,
   Gavel,
   Hash,
   LockKeyhole,
   Info,
   Trello,
   LayoutDashboard,
   CalendarDays,
   Target,
   RefreshCw,
   AlertTriangle,
   Activity,
   ChevronLeft,
   ChevronRight
} from 'lucide-react';
import { User, InternalMessage, InternalCall, SystemLog } from '../types';

const { useState, useEffect, useRef, useMemo } = React;

interface InternalCommsProps {
   currentUser: User;
   systemUsers: User[];
   logs: SystemLog[];
   onLogComms: (action: string, details: string, type: 'comms') => void;
}

interface NotificationToast {
   id: string;
   senderName: string;
   content: string;
   avatar: string;
}

interface Channel {
   id: string;
   name: string;
   isPrivate: boolean;
   unreadCount: number;
   topic: string;
}

interface TeamEvent {
   id: string;
   title: string;
   time: string;
   type: 'Meeting' | 'Deadline' | 'Milestone';
   organizer: string;
}

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";

const DUMMY_CHANNELS: Channel[] = [
   { id: 'ch-1', name: 'general', isPrivate: false, unreadCount: 0, topic: 'Daily recovery sync & global updates' },
   { id: 'ch-2', name: 'remedial-ops', isPrivate: true, unreadCount: 3, topic: 'Legal track coordination & escalations' },
   { id: 'ch-3', name: 'field-sync', isPrivate: false, unreadCount: 0, topic: 'On-site visitation coordination' },
   { id: 'ch-4', name: 'announcements', isPrivate: false, unreadCount: 1, topic: 'Corporate directives & node news' }
];

const DUMMY_EVENTS: TeamEvent[] = [
   { id: 'ev-1', title: 'Q4 Audit Review', time: 'Today, 2:00 PM', type: 'Meeting', organizer: 'Compliance Lead' },
   { id: 'ev-2', title: 'SEC-138 Notice Deadline', time: 'Tomorrow, 5:00 PM', type: 'Deadline', organizer: 'Legal Desk' },
   { id: 'ev-3', title: 'Regional Cluster Target', time: 'Nov 30, 09:00 AM', type: 'Milestone', organizer: 'Ops Manager' }
];

const InternalComms: React.FC<InternalCommsProps> = ({ currentUser, systemUsers, logs, onLogComms }) => {
   const [activeHubTab, setActiveHubTab] = useState<'chat' | 'calls' | 'files' | 'events' | 'supervision'>('chat');
   const [selectedId, setSelectedId] = useState<string | null>(DUMMY_CHANNELS[0].id);
   const [isChannel, setIsChannel] = useState(true);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

   // Auto-hide sidebar on mobile logic
   useEffect(() => {
      const handleResize = () => {
         if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
         } else {
            setIsSidebarOpen(true);
         }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
   }, []);

   const [messages, setMessages] = useState<InternalMessage[]>([]);
   const [inputValue, setInputValue] = useState('');
   const [activeCall, setActiveCall] = useState<InternalCall | null>(null);
   const [callDuration, setCallDuration] = useState(0);
   const [isMuted, setIsMuted] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [showHistory, setShowHistory] = useState(false);
   const [isIntervening, setIsIntervening] = useState(false);
   const [notification, setNotification] = useState<NotificationToast | null>(null);
   const [minimizedChats, setMinimizedChats] = useState<string[]>([]);

   const fileInputRef = useRef<HTMLInputElement>(null);
   const chatEndRef = useRef<HTMLDivElement>(null);

   const isAdmin = currentUser.role === 'ADMIN';

   const selectedTarget = useMemo(() => {
      if (isChannel) return DUMMY_CHANNELS.find(c => c.id === selectedId);
      return systemUsers.find(u => u.id === selectedId);
   }, [selectedId, isChannel, systemUsers]);

   const filteredUsers = useMemo(() => {
      return systemUsers.filter(u =>
         u.id !== currentUser.id &&
         u.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
   }, [systemUsers, currentUser.id, searchQuery]);

   const handleSelection = (id: string, channel: boolean) => {
      setSelectedId(id);
      setIsChannel(channel);
      setActiveHubTab('chat');
      if (window.innerWidth < 1024) {
         setIsSidebarOpen(false);
      }
   };

   const conversationMessages = useMemo(() => {
      return messages.filter(m => m.receiverId === selectedId || (m.senderId === selectedId && m.receiverId === currentUser.id));
   }, [messages, selectedId, currentUser.id]);

   useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
   }, [conversationMessages, activeHubTab]);

   useEffect(() => {
      let interval: any;
      if (activeCall && activeCall.status === 'ongoing') {
         interval = setInterval(() => setCallDuration(d => d + 1), 1000);
      } else {
         setCallDuration(0);
      }
      return () => clearInterval(interval);
   }, [activeCall]);

   const handleSendMessage = (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputValue.trim() || !selectedId) return;

      const newMessage: InternalMessage = {
         id: "msg-" + Date.now(),
         senderId: currentUser.id,
         receiverId: selectedId,
         content: inputValue,
         timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
         isRead: true
      };

      setMessages(prev => prev.concat([newMessage]));
      setInputValue('');
      onLogComms('Internal Transmission', `User [${currentUser.name}] sent message to ${isChannel ? 'Channel' : 'Peer'} [${selectedTarget?.name || selectedId}]`, 'comms');

      if (!isChannel) {
         setTimeout(() => {
            const incomingMsg: InternalMessage = {
               id: "msg-reply-" + Date.now(),
               senderId: selectedId,
               receiverId: currentUser.id,
               content: `Acknowledged. Processing the request in Node Cluster.`,
               timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
               isRead: false
            };
            setMessages(prev => prev.concat([incomingMsg]));
            setNotification({ id: "notif-" + Date.now(), senderName: selectedTarget?.name || 'Teammate', content: incomingMsg.content, avatar: (selectedTarget as User)?.avatar || DEFAULT_AVATAR });
            setTimeout(() => setNotification(null), 5000);
         }, 3000);
      }
   };

   const startCall = (type: 'voice' | 'video') => {
      if (isChannel || !selectedId) return;
      const newCall: InternalCall = {
         id: "call-" + Date.now(),
         callerId: currentUser.id,
         receiverId: selectedId,
         startTime: new Date().toLocaleTimeString(),
         status: 'ongoing',
         type
      };
      setActiveCall(newCall);
      onLogComms('Internal Call', `Voice/Video session initiated with [${selectedTarget?.name || 'Peer'}]`, 'comms');
   };

   return (
      <div className="h-full w-full bg-white flex animate-in fade-in duration-500 relative text-left">

         {/* Side Navigation Overlay (Mobile Only) */}
         {isSidebarOpen && (
            <div
               className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
               onClick={() => setIsSidebarOpen(false)}
            />
         )}

         {/* Side Navigation - Slack style */}
         <div className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-r border-slate-100 flex flex-col bg-slate-900 text-white overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-0'} lg:relative fixed inset-y-0 left-0 z-[70]`}>
            <div className="flex flex-col h-full w-80 shrink-0">
               <div className="p-8 space-y-6 text-left shrink-0">
                  <div className="flex items-center justify-between">
                     <h2 className="text-xl font-black tracking-tight">Team Hub</h2>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={() => setIsSidebarOpen(false)}
                           className="p-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 lg:hidden"
                           title="Close Sidebar"
                        >
                           <X size={18} />
                        </button>
                        <button
                           onClick={() => setActiveHubTab('events')}
                           className={`p-2 rounded-xl transition-all ${activeHubTab === 'events' ? 'bg-blue-600 shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                           title="Team Events"
                        >
                           <CalendarDays size={18} />
                        </button>
                     </div>
                  </div>

                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                     <input
                        type="text"
                        placeholder="Jump to..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-none">
                  <div className="space-y-2">
                     <div className="flex items-center justify-between px-3 mb-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Channels</p>
                        <button className="p-1 hover:bg-white/10 rounded-lg text-slate-500" title="Create New Channel"><PlusCircle size={14} /></button>
                     </div>
                     <div className="space-y-0.5">
                        {DUMMY_CHANNELS.map(ch => (
                           <button
                              key={ch.id}
                              onClick={() => handleSelection(ch.id, true)}
                              className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all ${selectedId === ch.id && isChannel ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}
                           >
                              <div className="flex items-center gap-3 truncate">
                                 {ch.isPrivate ? <LockKeyhole size={14} className="shrink-0 opacity-60" /> : <Hash size={16} className="shrink-0 opacity-60" />}
                                 <span className="text-sm font-bold truncate">{ch.name}</span>
                              </div>
                              {ch.unreadCount > 0 && <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{ch.unreadCount}</span>}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between px-3 mb-2">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Direct Messages</p>
                        <button className="p-1 hover:bg-white/10 rounded-lg text-slate-500" title="Find Direct Messages"><Users size={14} /></button>
                     </div>
                     <div className="space-y-0.5">
                        {filteredUsers.map(u => (
                           <button
                              key={u.id}
                              onClick={() => handleSelection(u.id, false)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${selectedId === u.id && !isChannel ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-400 hover:bg-white/5'}`}
                              title={`Chat with ${u.name}`}
                           >
                              <div className="relative shrink-0">
                                 <img src={u.avatar} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                 <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${u.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                              </div>
                              <div className="min-w-0 flex-1 text-left">
                                 <p className="text-sm font-bold truncate leading-none">{u.name.split(' ')[0]}</p>
                                 <p className={`text-[8px] uppercase tracking-widest mt-1 ${selectedId === u.id && !isChannel ? 'text-blue-100' : 'text-slate-500'}`}>{u.role.replace(/_/g, ' ').split(' ')[0]}</p>
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="p-6 bg-slate-950/50 border-t border-white/5">
                  <div className="flex items-center gap-4 px-2">
                     <div className="relative">
                        <img src={currentUser.avatar} className="w-10 h-10 rounded-xl border border-white/10" alt="" />
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                     </div>
                     <div className="min-w-0 flex-1">
                        <p className="text-xs font-black truncate">{currentUser.name}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Available</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Viewport */}
         <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
            {activeHubTab === 'chat' && (
               selectedTarget ? (
                  <>
                     {/* Chat Header */}
                     <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10">
                        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                           <button
                              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                              className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm group"
                              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                           >
                              {isSidebarOpen ? <ChevronLeft size={20} /> : <div className="flex gap-0.5"><div className="w-1 h-1 bg-current rounded-full" /><div className="w-1 h-1 bg-current rounded-full" /><div className="w-1 h-1 bg-current rounded-full" /></div>}
                           </button>
                           <div className={`p-4 rounded-2xl ${isChannel ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-900'}`}>
                              {isChannel ? <Hash size={24} /> : <UserIcon size={24} />}
                           </div>
                           <div className="text-left min-w-0">
                              <div className="flex items-center gap-3">
                                 <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">{isChannel ? (selectedTarget as Channel).name : (selectedTarget as User).name}</h3>
                                 {!isChannel && (selectedTarget as User).isActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                              </div>
                              <p className="text-xs font-medium text-slate-400 mt-1 truncate max-w-xl italic">
                                 {isChannel ? (selectedTarget as Channel).topic : `Secure session with ${(selectedTarget as User).employeeId}`}
                              </p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           {!isChannel && (
                              <>
                                 <button onClick={() => startCall('voice')} className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90" title="Voice Call"><PhoneCall size={20} /></button>
                                 <button onClick={() => startCall('video')} className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90" title="Video Call"><Video size={20} /></button>
                              </>
                           )}
                           <button className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:bg-slate-100 transition-all" title="More Options"><MoreVertical size={20} /></button>
                        </div>
                     </div>

                     {/* Message Thread Area */}
                     <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-slate-50/20 scrollbar-thin">
                        {conversationMessages.length === 0 && (
                           <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                              <div className="w-20 h-20 bg-slate-200 rounded-[2rem] flex items-center justify-center mb-6"><MessageSquare size={40} /></div>
                              <p className="text-sm font-black uppercase tracking-[0.2em]">Start the conversation</p>
                           </div>
                        )}
                        {conversationMessages.map((msg) => {
                           const isFromMe = msg.senderId === currentUser.id;
                           const sender = systemUsers.find(u => u.id === msg.senderId);

                           return (
                              <div key={msg.id} className={`flex gap-4 sm:gap-6 animate-in slide-in-from-bottom-2 ${isFromMe ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                                 {!isFromMe && <img src={sender?.avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-xl object-cover shrink-0 mt-1" alt="" />}
                                 <div className={`max-w-[70%] space-y-2 ${isFromMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    {!isFromMe && isChannel && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{sender?.name}</span>}
                                    <div className={`p-5 rounded-[2rem] text-sm font-semibold leading-relaxed shadow-sm ${isFromMe ? 'bg-slate-900 text-white rounded-tr-none shadow-xl' : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'}`}>
                                       {msg.content}
                                    </div>
                                    <div className="flex items-center gap-2 px-1">
                                       <span className="text-[9px] font-black text-slate-400 uppercase">{msg.timestamp}</span>
                                       {isFromMe && <CheckCheck size={14} className="text-blue-500" />}
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                        <div ref={chatEndRef} />
                     </div>

                     {/* Input Area */}
                     <div className="p-6 sm:p-10 bg-white border-t border-slate-100 shrink-0">
                        <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex items-end gap-4">
                           <div className="flex-1 relative">
                              <textarea
                                 value={inputValue}
                                 onChange={(e) => setInputValue(e.target.value)}
                                 onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                 placeholder={`Message ${isChannel ? '#' : ''}${selectedTarget?.name}...`}
                                 rows={1}
                                 className="w-full pl-6 pr-14 py-4 sm:py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-sm font-bold outline-none resize-none"
                              />
                              <button type="button" className="absolute right-5 bottom-4 sm:bottom-5 p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Attach Files"><Paperclip size={20} /></button>
                           </div>
                           <button type="submit" className="p-4 sm:p-5 bg-blue-600 text-white rounded-[1.8rem] shadow-xl shadow-blue-600/20 active:scale-95 hover:bg-blue-700 transition-all" title="Send Message"><Send size={24} /></button>
                        </form>
                     </div>
                  </>
               ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-20 text-center animate-in zoom-in-95 duration-700">
                     <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-10 rotate-12 group transition-all hover:rotate-0">
                        <MessageSquare size={64} className="text-slate-200" />
                     </div>
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight">Team Hub Transmissions</h2>
                     <p className="text-sm font-medium mt-4 max-w-xs text-slate-400 italic">Select a team channel or colleague from the directory to start collaborating in real-time.</p>
                  </div>
               )
            )}

            {activeHubTab === 'events' && (
               <div className="flex-1 p-10 sm:p-16 overflow-y-auto animate-in slide-in-from-bottom-4 duration-500 text-left">
                  <div className="max-w-4xl mx-auto space-y-12">
                     <div className="space-y-4">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-5">
                           <Calendar size={40} className="text-blue-600" /> Team Itinerary
                        </h3>
                        <p className="text-slate-400 font-medium text-lg italic leading-relaxed">Centralized tracker for critical operational milestones.</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                           { label: 'Meetings', count: 4, icon: Users, color: 'blue' },
                           { label: 'Deadlines', count: 2, icon: Clock, color: 'rose' },
                           { label: 'Syncs', count: 1, icon: RefreshCw, color: 'emerald' }
                        ].map((stat, i) => (
                           <div key={i} className={`bg-white border-2 border-slate-50 p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center gap-3`}>
                              <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 mb-2`}><stat.icon size={28} /></div>
                              <h4 className="text-3xl font-black text-slate-900 leading-none">{stat.count}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label} Scheduled</p>
                           </div>
                        ))}
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Upcoming Manifest</h4>
                        <div className="space-y-3">
                           {DUMMY_EVENTS.map(ev => (
                              <div key={ev.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center justify-between group hover:border-blue-600 transition-all">
                                 <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-2xl transition-all ${ev.type === 'Deadline' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600 group-hover:scale-110'}`}>
                                       {ev.type === 'Deadline' ? <AlertTriangle size={24} /> : <CalendarDays size={24} />}
                                    </div>
                                    <div className="text-left">
                                       <div className="flex items-center gap-2">
                                          <h5 className="text-lg font-black text-slate-900">{ev.title}</h5>
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${ev.type === 'Deadline' ? 'bg-rose-600 text-white' : 'bg-blue-100 text-blue-600'}`}>{ev.type}</span>
                                       </div>
                                       <p className="text-sm font-bold text-slate-400 mt-1">{ev.time} • Organized by {ev.organizer}</p>
                                    </div>
                                 </div>
                                 <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Add to Sync</button>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {isAdmin && activeHubTab === 'supervision' && (
               <div className="flex-1 p-10 sm:p-16 overflow-y-auto animate-in slide-in-from-right-10 duration-500 text-left">
                  <div className="max-w-5xl mx-auto space-y-12">
                     <div className="bg-[#0f172a] rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl border-4 border-slate-800">
                        <div className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12"><Activity size={240} /></div>
                        <div className="relative z-10">
                           <h3 className="text-4xl font-black tracking-tight leading-none">Operational Oversight</h3>
                           <p className="text-slate-400 text-lg font-medium mt-4 max-w-xl italic">Live telemetry from active personnel clusters. Real-time shadow monitoring and compliance enforcement hub.</p>

                           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                              <div className="text-left"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Agents</p><p className="text-3xl font-black text-blue-400">{systemUsers.filter(u => u.isActive).length}</p></div>
                              <div className="text-left"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Mirror Latency</p><p className="text-3xl font-black text-emerald-400">84ms</p></div>
                              <div className="text-left"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Compliance Rate</p><p className="text-3xl font-black text-white">99.2%</p></div>
                              <div className="text-left"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Signal Health</p><p className="text-3xl font-black text-white">Nominal</p></div>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-8">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3"><Zap size={16} className="text-blue-600" /> Tactical Streams</h4>
                           <div className="space-y-4">
                              {systemUsers.filter(u => u.isActive).slice(0, 3).map(u => (
                                 <div key={u.id} className="p-6 bg-slate-50 rounded-[2.5rem] flex items-center justify-between border border-slate-100 group hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-5">
                                       <img src={u.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-xl grayscale group-hover:grayscale-0 transition-all" alt="" />
                                       <div>
                                          <p className="text-lg font-black text-slate-900 leading-none">{u.name}</p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-tighter">In session: Communicator Hub</p>
                                       </div>
                                    </div>
                                    <button className="p-3 bg-white border border-slate-200 rounded-xl text-blue-600 shadow-sm active:scale-90 transition-all hover:bg-blue-600 hover:text-white" title="Shadow Monitor Session"><Eye size={20} /></button>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                           <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-8"><ShieldAlert size={16} className="text-rose-600" /> Sentinel Feed</h4>
                              <div className="space-y-4 font-mono text-[10px] text-slate-500">
                                 <p className="p-3 bg-slate-900 rounded-xl border border-white/5 text-blue-400 leading-relaxed">[14:32:01] <span className="text-white">AUTH:</span> User agent001 synchronized via secure port 443.</p>
                                 <p className="p-3 bg-slate-900 rounded-xl border border-white/5 text-emerald-400 leading-relaxed">[14:32:45] <span className="text-white">ENCRYPT:</span> E2EE Channel CH-2 established (AES-256).</p>
                                 <p className="p-3 bg-slate-900 rounded-xl border border-white/5 text-slate-400 leading-relaxed opacity-60">[14:33:10] Audit log integrity verified by Node Supervisor.</p>
                              </div>
                           </div>
                           <button className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-2xl active:scale-95" title="Finalize Global Audit Log">Commit Global Audit</button>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </div>

         <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
      </div>
   );
};

export default InternalComms;
