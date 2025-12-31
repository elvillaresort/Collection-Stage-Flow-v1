
import * as React from 'react';
import {
  LayoutDashboard, Users, Zap, MessageSquare, Gavel, MapPin, BarChart3, LogOut, Bell, Search, Settings as SettingsIcon, User as UserIcon, ChevronDown, X, CheckCircle2, Info, AlertTriangle, Clock, Fingerprint, Menu, Mic, Briefcase, ShieldCheck, Radar, MoreHorizontal, Plus, HelpCircle, ShieldAlert, ServerCrash, Radio, ShieldX, Monitor, Rocket, Scale, ArrowLeftRight, Database, Smartphone, Bot, Volume2, Calculator, MessageCircle, Signal, LockKeyhole, Shield, Headphones, Command, Sparkles
} from 'lucide-react';
import { User, Notification, UserRole, ClientCampaign, SystemSettings, UserAttendance } from '../types';
import AttendancePanelSidebar from './AttendancePanelSidebar';
import DutyLogMatrixModal from './DutyLogMatrixModal';
import PCCSLogo from './PCCSLogo';
import QuickWorkspace from './QuickWorkspace';

const { useState, useRef, useEffect, useMemo, memo } = React;

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  settings: SystemSettings;
  notifications: Notification[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onLogout: () => void;
  activeCampaign: ClientCampaign | null;
  onSwitchCampaign: () => void;
  attendance: UserAttendance | null;
  onUpdateAttendance: (attendance: UserAttendance) => void;
}

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback";

const Layout: React.FC<LayoutProps> = memo(({
  children, activeTab, setActiveTab, user, settings, notifications, onMarkNotificationAsRead, onMarkAllAsRead, onLogout, activeCampaign, onSwitchCampaign, attendance, onUpdateAttendance
}) => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [showDutyLog, setShowDutyLog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const mgmtRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'HEAD_OF_OPERATIONS', 'OPERATIONS_MANAGER', 'TEAM_MANAGER', 'TEAM_LEADER', 'CAMPAIGN_ADMIN', 'COMPLIANCE_OFFICER'];

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: mgmtRoles.concat(['AGENT']) },
    { id: 'portfolio', label: 'Accounts', icon: Users, roles: mgmtRoles.concat(['AGENT', 'FIELD_AGENT', 'ASSISTANT_TEAM_LEADER']) },
    { id: 'campaigns', label: 'Campaign Hub', icon: Rocket, roles: mgmtRoles },
    { id: 'grievances', label: 'Disputes', icon: Scale, roles: mgmtRoles },
    { id: 'strategies', label: 'Collection Flows', icon: Zap, roles: ['SUPER_ADMIN', 'ADMIN', 'HEAD_OF_OPERATIONS', 'CAMPAIGN_ADMIN'] },
    { id: 'monitoring', label: 'Live Monitoring', icon: Radar, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'skiptracing', label: 'Digital Skip', icon: Fingerprint, roles: mgmtRoles.concat(['AGENT']) },
    { id: 'voice_ops', label: 'Voice Ops Center', icon: Headphones, roles: mgmtRoles.concat(['AGENT']) },
    { id: 'qa', label: 'QA Audit', icon: ShieldCheck, roles: ['SUPER_ADMIN', 'ADMIN', 'HEAD_OF_OPERATIONS', 'OPERATIONS_MANAGER', 'TEAM_MANAGER'] },
    { id: 'internal', label: 'Team Chat', icon: MessageCircle, roles: ['ADMIN', 'AGENT', 'FIELD_AGENT', 'CAMPAIGN_ADMIN', 'ASSISTANT_TEAM_LEADER', 'TEAM_LEADER', 'TEAM_MANAGER', 'OPERATIONS_MANAGER', 'HEAD_OF_OPERATIONS'] },
    { id: 'communications', label: 'Messaging Hub', icon: MessageSquare, roles: mgmtRoles.concat(['AGENT', 'ASSISTANT_TEAM_LEADER']) },
    { id: 'legal', label: 'Remedial Hub', icon: Gavel, roles: ['SUPER_ADMIN', 'ADMIN', 'HEAD_OF_OPERATIONS', 'OPERATIONS_MANAGER'] },
    { id: 'field', label: 'Field Visits', icon: MapPin, roles: ['SUPER_ADMIN', 'ADMIN', 'FIELD_AGENT', 'HEAD_OF_OPERATIONS'] },
    { id: 'analytics', label: 'Reports', icon: BarChart3, roles: mgmtRoles },
    { id: 'comms_hub', label: 'Strategy Hub', icon: Sparkles, roles: mgmtRoles.concat(['AGENT']) },
    { id: 'settings', label: 'Admin Control Center', icon: SettingsIcon, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { id: 'admin_panel', label: 'Master Command', icon: Shield, roles: ['SUPER_ADMIN'] },
  ];

  const visibleMenuItems = allMenuItems.filter(item =>
    item.roles.includes(user.role) &&
    (item.label.toLowerCase().includes(sidebarSearch.toLowerCase()) || sidebarSearch === '')
  );

  const activeItem = allMenuItems.find(i => i.id === activeTab);
  const activeItemLabel = activeItem?.label || 'Dashboard';
  const ActiveIcon = activeItem?.icon || LayoutDashboard;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => setIsSidebarOpen(false), [activeTab]);

  const WatermarkOverlay = useMemo(() => {
    if (!settings.compliance.watermarkEnabled) return null;
    const density = settings.compliance.watermarkDensity || 10;
    const opacity = settings.compliance.watermarkOpacity || 0.05;
    const watermarkText = `${user.name} | ${user.employeeId} | PCCS SECURE`;
    return (
      <div className="fixed inset-0 pointer-events-none z-[9999] select-none overflow-hidden flex flex-wrap justify-around content-around p-4 watermark-overlay">
        {Array.from({ length: density * density }).map((_, i) => (
          <div key={i} className="text-[10px] sm:text-[12px] font-black text-slate-900 -rotate-[25deg] whitespace-nowrap m-8 uppercase tracking-tighter opacity-70">
            {watermarkText}
          </div>
        ))}
      </div>
    );
  }, [settings.compliance.watermarkEnabled, settings.compliance.watermarkDensity, settings.compliance.watermarkOpacity, user]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-inter relative text-left">
      {WatermarkOverlay}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-[110] bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isSidebarCollapsed ? 'w-24' : 'w-72'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-3">
            <PCCSLogo size={isSidebarCollapsed ? 40 : 32} />
            {!isSidebarCollapsed && <span className="text-lg font-black tracking-tight whitespace-nowrap">Collection Stage</span>}
          </div>
          <button title="Toggle Sidebar" onClick={() => isSidebarOpen ? setIsSidebarOpen(false) : setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
            {isSidebarCollapsed ? <Plus className="rotate-45" size={18} /> : (isSidebarOpen ? <X size={20} /> : <MoreHorizontal size={18} />)}
          </button>
        </div>

        {!isSidebarCollapsed && (
          <div className="px-5 mt-6 mb-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Jump to section..."
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-none">
          {visibleMenuItems.map((item) => {
            const isNewFeature = ['voice_ops', 'skiptracing'].includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 text-left active:scale-[0.98] relative group ${isSidebarCollapsed ? 'justify-center p-4' : 'px-4 py-3.5'} ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : ''} />
                {!isSidebarCollapsed && <span className="font-bold text-[10px] uppercase tracking-wider">{item.label}</span>}
                {isNewFeature && !isSidebarCollapsed && (
                  <span className="absolute right-3 px-1.5 py-0.5 bg-amber-400 text-slate-900 rounded-md text-[7px] font-black uppercase border border-amber-300 shadow-sm animate-bounce">NEW</span>
                )}
                {isSidebarCollapsed && isNewFeature && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
                )}
              </button>
            );
          })}
        </nav>

        <AttendancePanelSidebar
          user={user}
          attendance={attendance}
          onUpdateAttendance={onUpdateAttendance}
          onShowHistory={() => setShowDutyLog(true)}
          isCollapsed={isSidebarCollapsed}
        />

        <div className={`p-4 bg-slate-950/50 border-t border-white/5 ${isSidebarCollapsed ? 'items-center' : ''}`}>
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 mb-4 px-2">
              <img src={user.avatar || DEFAULT_AVATAR} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" />
              <div className="min-w-0 flex-1 text-left"><p className="text-xs font-black truncate">{user.name}</p><p className="text-[10px] font-bold text-slate-500 uppercase">{user.role.replace(/_/g, ' ')}</p></div>
            </div>
          ) : (
            <div className="mb-4 flex justify-center">
              <img src={user.avatar || DEFAULT_AVATAR} className="w-8 h-8 rounded-lg object-cover border border-white/10" alt="" />
            </div>
          )}
          <button
            onClick={onLogout}
            title="End Session"
            className={`flex items-center gap-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95 ${isSidebarCollapsed ? 'w-12 h-12 justify-center p-0 mx-auto' : 'w-full px-3 py-3.5'}`}
          >
            <LogOut size={16} /> {!isSidebarCollapsed && 'End Session'}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden w-full relative">
        <header className="h-20 lg:h-28 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-2 lg:gap-4">
            <button title="Open Sidebar" onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-95">
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-4 text-left">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 text-slate-500 rounded-xl">
                  <ActiveIcon size={16} />
                </div>
                <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Main Engine</span>
                    <ChevronDown size={8} className="text-slate-300" />
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">{activeTab.replace(/_/g, ' ')}</span>
                  </div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tighter leading-none">{activeItemLabel}</h2>
                </div>
              </div>
              {activeCampaign && (
                <div className="hidden min-[1100px]:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{activeCampaign.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 mr-4">
              <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <Signal size={12} className="animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest">Corp Link Active</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                <LockKeyhole size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">TLS 1.3 Verified</span>
              </div>
            </div>

            <button
              onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
              className={`p-2 lg:p-2.5 rounded-xl transition-all active:scale-95 ${isWorkspaceOpen ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100'}`}
              title="Quick Workspace (Cmd+K)"
            >
              <Command size={18} />
            </button>

            <div className="relative" ref={notifRef}>
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`p-2 lg:p-2.5 rounded-xl transition-all active:scale-95 ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400 hover:text-blue-600'}`}>
                <Bell size={18} />
                {unreadCount > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-600 text-white text-[7px] font-black rounded-full flex items-center justify-center border-2 border-white">{unreadCount}</span>}
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[150] animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Alert Stack</h3>
                    <button onClick={onMarkAllAsRead} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Clear All</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin p-4">
                    {notifications.length > 0 ? (
                      <div className="space-y-2">
                        {notifications.map((n) => (
                          <div key={n.id} onClick={() => onMarkNotificationAsRead(n.id)} className={`p-4 rounded-xl cursor-pointer hover:bg-slate-50 transition-all ${!n.read ? 'bg-blue-50/50' : ''}`}>
                            <p className="text-[11px] font-black text-slate-900">{n.title}</p>
                            <p className="text-[10px] text-slate-500 font-medium truncate">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 text-center text-slate-300 text-[10px] font-bold uppercase tracking-widest">No Security Alerts</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 group p-1 rounded-xl transition-all hover:bg-slate-50 active:scale-95">
                <img src={user.avatar || DEFAULT_AVATAR} alt="Profile" className="w-8 h-8 rounded-lg object-cover shadow-sm border border-slate-100" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                  <button onClick={() => { setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-[0.98]">
                    <UserIcon size={14} className="text-blue-500" /> My Profile
                  </button>
                  <button onClick={() => { setIsProfileOpen(false); onSwitchCampaign?.(); }} className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-[0.98]">
                    <ArrowLeftRight size={14} className="text-indigo-500" /> Switch Project
                  </button>
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 font-black text-xs hover:bg-rose-50 transition-all uppercase tracking-widest border-t border-slate-50 mt-1 active:scale-[0.98]">
                    <LogOut size={14} /> Kill Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className={`flex-1 bg-slate-50 scroll-smooth transition-all duration-500 flex flex-col ${['field', 'internal', 'communications'].includes(activeTab) ? 'overflow-hidden' : 'overflow-y-auto pb-10'}`}>
          <div className={`max-w-full mx-auto w-full flex-1 flex flex-col ${['field', 'internal', 'communications'].includes(activeTab) ? 'p-0' : 'p-4 md:p-6 lg:p-8'}`}>
            {children}
          </div>
        </section>

        <style>{`
          .watermark-overlay {
            opacity: ${settings.compliance.watermarkOpacity || 0.05};
          }
          .sidebar-item-new {
            animation: pulse-amber 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          @keyframes pulse-amber {
            0%, 100% { background-color: rgba(251, 191, 36, 0.1); }
            50% { background-color: rgba(251, 191, 36, 0.2); }
          }
        `}</style>
        <QuickWorkspace isOpen={isWorkspaceOpen} onToggle={setIsWorkspaceOpen} />
      </main>

      {showDutyLog && (
        <DutyLogMatrixModal
          user={user}
          attendance={attendance}
          onClose={() => setShowDutyLog(false)}
        />
      )}
    </div>
  );
});

export default Layout;
