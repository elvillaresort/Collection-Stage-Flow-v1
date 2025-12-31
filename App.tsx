
import * as React from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import OmnichannelHub from './components/OmnichannelHub';
import FieldForce from './components/FieldForce';
import AnalyticsModule from './components/AnalyticsModule';
import SkipTracing from './components/SkipTracing';
import VoiceOperationsCenter from './components/VoiceOperationsCenter';
import InternalComms from './components/InternalComms';
import QABotHub from './components/QABotHub';
import Settings from './components/Settings';
import Login from './components/Login';
import AnomalySentinel from './components/AnomalySentinel';
import SetupWizard from './components/SetupWizard';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';
import CampaignManager from './components/CampaignManager';
import Grievances from './components/Grievances';
import CollectionFlows from './components/CollectionFlows';
import LiveMonitoring from './components/LiveMonitoring';
import LegalModule from './components/LegalModule';
import CommunicationHub from './components/CommunicationHub';
import CampaignSelector from './components/CampaignSelector';
import { Activity, SystemSettings, User, SystemLog, Debtor, Notification, AnomalyAlert, ClientCampaign, SettlementRequest, CallRecording, LandingPageConfig, LandingPageFeature, Complaint, UserAttendance } from './types';
import { DUMMY_DEBTORS, DUMMY_ACTIVITIES, DUMMY_CLIENT_CAMPAIGNS } from './constants';
import { generateDummyUsers } from './utils/dummyUsers';
import { generateDummyDebtors } from './utils/dummyDebtors';
import { ShieldAlert, Lock, RefreshCw } from 'lucide-react';
import { supabase } from './services/supabaseClient';
import { supabaseService } from './services/supabaseService';

const { useState, useEffect, useCallback } = React;

const DEFAULT_LANDING_PAGE_CONFIG: LandingPageConfig = {
  branding: {
    logoText: "Panlilio's",
    companyName: "Credit & Collections Services",
    logoImage: ""
  },
  sections: {
    hero: {
      enabled: true,
      title: "Integrity in Recovery.",
      subtitle: "Panlilio's Credit & Collections Services is the Philippines' premier recovery firm. We combine rigorous litigation tracks with advanced AI-driven behavioral analytics to secure your capital.",
      primaryCta: "Inquire for Services",
      secondaryCta: "Client Portal Entry",
      bgImage: "/assets/ai_hub.png"
    },
    core: {
      enabled: true,
      title: "Manual Grit meets Digital Flow.",
      subtitle: "THE HARMONIZED CORE",
      content: "While others automate to avoid human labor, we automate to empower it. Our elite field agents work in perfect harmony with our AI engine to ensure no capital is left behind.",
      fieldImage: "/assets/field_ops.png",
      aiImage: "/assets/ai_hub.png"
    },
    features: {
      enabled: true,
      title: "Comprehensive Recovery Ecosystem.",
      items: [
        { title: 'Remedial Collections', description: 'Standardized large-scale recovery operations for banking, fintech, and retail credit sectors.', icon: 'Smartphone', enabled: true },
        { title: 'Legal & Litigation', description: 'Expert handling of SEC-138 (BP22), Summons issuance, and formal court proceedings across the Philippines.', icon: 'Gavel', enabled: true },
        { title: 'Field Operations', description: 'Nationwide ocular inspections and residency verification via GPS-tracked field units.', icon: 'MapPinned', enabled: true }
      ]
    },
    firm: {
      enabled: true,
      title: "Defined by Ethics, Driven by Data.",
      subtitle: "THE FIRM",
      mediationImage: "/assets/mediation.png",
      prestigeImage: "/assets/legal_prestige.png"
    },
    performance: {
      enabled: true,
      title: "Verified Success at Scale.",
      items: [
        { label: 'Active Portfolio', value: '₱24.2B', icon: 'Database' },
        { label: 'Nationwide Branches', value: '42', icon: 'MapPinned' },
        { label: 'Success Rate', value: '94%', icon: 'Trophy' },
        { label: 'Security Score', value: '100', icon: 'ShieldCheck' }
      ]
    },
    leadership: {
      enabled: true,
      title: "Senior Management Team.",
      members: [
        { name: 'Atty. Ricardo Panlilio', role: 'Senior Managing Partner', bio: 'Expert in commercial litigation and remedial finance with 30 years of experience.' },
        { name: 'Maria Isabel Rivera', role: 'Head of Operations', bio: 'Strategic lead for nationwide collection logistics and field force management.' },
        { name: 'Engr. Carlos Santos', role: 'Chief Information Officer', bio: 'Architect of the Nexus AI platform and isolated node infrastructure.' }
      ]
    },
    compliance: {
      enabled: true,
      title: "Security is our Baseline."
    },
    contact: {
      enabled: true,
      title: "Ready to Recover?",
      primaryCta: "Inquire for Services"
    },
    customSections: [
      {
        id: "custom-1",
        enabled: true,
        title: "Strategic Intelligence Core.",
        subtitle: "NEURAL NETWORK RECOVERY",
        content: "Our system doesn't just collect; it predicts. By analyzing decade-long behavioral patterns, we identify the exact psychological trigger for repayment, minimizing legal friction and maximizing capital return.",
        imagePosition: "right",
        theme: "dark",
        ctaLabel: "View Case Studies",
        image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop"
      },
      {
        id: "custom-2",
        enabled: true,
        title: "Nationwide Ocular Presence.",
        subtitle: "COAST-TO-COAST FIELD OPS",
        content: "From the high-rises of BGC to the furthest reaches of Mindanao, our GPS-tracked field units provide real-time verification and skip-tracing services that digital-only firms simply cannot match.",
        imagePosition: "left",
        theme: "light",
        ctaLabel: "Locate Field Units",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop"
      }
    ]
  }
};

const INITIAL_USERS: User[] = [
  {
    id: 'super-admin-1',
    name: 'Super System Controller',
    employeeId: 'superadmin',
    password: 'superadmin',
    role: 'SUPER_ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
    concurrentAccess: true,
    assignedDebtorIds: [],
    assignedCampaignIds: ['client-1', 'client-2', 'client-3'],
    isActive: true,
    status: 'online',
    isCertified: true
  },
  {
    id: 'admin-1',
    name: 'Company Administrator',
    employeeId: 'admin',
    password: 'admin',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    concurrentAccess: true,
    assignedDebtorIds: [],
    assignedCampaignIds: ['client-1', 'client-2'],
    isActive: true,
    status: 'online',
    isCertified: true
  },
  {
    id: 'campaign-admin-1',
    name: 'Campaign Strategist',
    employeeId: 'campaign',
    password: 'campaign',
    role: 'CAMPAIGN_ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=campaign',
    concurrentAccess: true,
    assignedDebtorIds: [],
    assignedCampaignIds: ['client-1'],
    isActive: true,
    status: 'online',
    isCertified: true
  }
];

const INITIAL_SETTINGS: SystemSettings = {
  localization: { currency: 'USD', currencySymbol: '$' },
  sentinel: {
    enabled: true,
    autoFreezeOnCritical: true,
    exfiltrationDetection: true,
    behavioralAnalytics: true,
    highValueMonitoring: true,
    threatLevel: 'NORMAL'
  },
  aegis: {
    browserIsolation: true,
    readOnlyModeOnUntrusted: true,
    disableCopyPaste: true,
    disableFileUpload: true,
    documentSanitization: true,
    pixelStreamQuality: 'high',
    credentialTheftProtection: true
  },
  recovery: { globalLockdown: false, systemStatus: 'Optimal', lastBackupDate: new Date().toLocaleDateString() },
  compliance: {
    auditLogging: true,
    encryption: true,
    geoFencing: true,
    copyPaste: true,
    screenProtection: true,
    screenshotControl: true,
    passwordSharingProtection: true,
    watermarkEnabled: true,
    watermarkOpacity: 0.1,
    watermarkDensity: 10,
    sessionTimeout: 30,
    ipWhitelist: ['192.168.1.1', '10.0.0.1'],
    allowedSSID: ['PCCS_CORP_WIFI', 'PCCS_SECURE_GUEST']
  },
  integrations: {
    facebook: { id: 'fb-1', name: 'Meta API', status: 'disconnected' },
    googleMaps: { id: 'gm-1', name: 'Maps API', status: 'disconnected' },
    linkedin: { id: 'li-1', name: 'LinkedIn', status: 'disconnected' },
    viber: { id: 'vi-1', name: 'Viber', status: 'disconnected' },
    whatsapp: { id: 'wa-1', name: 'WhatsApp', status: 'disconnected' }
  },
  landingPage: DEFAULT_LANDING_PAGE_CONFIG
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [isInitialized, setIsInitialized] = useState<boolean>(() => localStorage.getItem('pccs_initialized') === 'true');
  const [systemUsers, setSystemUsers] = useState<User[]>(INITIAL_USERS);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [user, setUser] = useState<User | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<ClientCampaign | null>(null);
  const [portfolio, setPortfolio] = useState<Debtor[]>(DUMMY_DEBTORS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activities, setActivities] = useState<Activity[]>(DUMMY_ACTIVITIES);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [campaigns, setCampaigns] = useState<ClientCampaign[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const [activeAlert, setActiveAlert] = useState<AnomalyAlert | null>(null);
  const [isGlobalLockdown, setIsGlobalLockdown] = useState(false);
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [settlementRequests, setSettlementRequests] = useState<SettlementRequest[]>([]);
  const [attendance, setAttendance] = useState<UserAttendance | null>(() => {
    const saved = localStorage.getItem('pccs_attendance');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === new Date().toISOString().split('T')[0]) return parsed;
    }
    return null;
  });

  useEffect(() => {
    if (attendance) {
      localStorage.setItem('pccs_attendance', JSON.stringify(attendance));
    } else {
      localStorage.removeItem('pccs_attendance');
    }
  }, [attendance]);

  const handleUpdateAttendance = (newAttendance: UserAttendance) => {
    // Determine the action for logging
    const prevStatus = attendance?.status || 'OFFLINE';
    const newStatus = newAttendance.status;

    if (prevStatus !== newStatus) {
      let action = 'ATTENDANCE_UPDATE';
      let details = `User status transitioned from ${prevStatus} to ${newStatus}.`;

      if (newStatus === 'WORKING' && prevStatus === 'OFFLINE') action = 'CLOCK_IN';
      if (newStatus === 'OFFLINE') action = 'CLOCK_OUT';
      if (newStatus === 'ON_BREAK') action = 'BREAK_START';
      if (newStatus === 'ON_LUNCH') action = 'LUNCH_START';
      if (newStatus === 'WORKING' && (prevStatus === 'ON_BREAK' || prevStatus === 'ON_LUNCH')) action = 'RESUME_DUTY';

      handleLogSecurity(action, details, 'low');
    }

    setAttendance(newAttendance);
    if (user) {
      supabaseService.upsertAttendance({
        user_id: user.id,
        date: newAttendance.date,
        status: newAttendance.status,
        sessions: newAttendance.sessions,
        total_work_minutes: newAttendance.totalWorkMinutes,
        total_break_minutes: newAttendance.totalBreakMinutes
      });
    }
  };

  const handleLogSecurity = useCallback(async (action: string, details: string, severity: 'low' | 'medium' | 'high' | 'critical') => {
    const logData: { action: string, severity: 'low' | 'medium' | 'high' | 'critical', details: string, type: 'security' | 'comms' | 'system' } = {
      action,
      severity,
      details,
      type: 'security'
    };

    // Persist to Supabase
    await supabaseService.addLog(logData);

    // Update local state for immediate feedback
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      userName: user?.name || 'System',
      timestamp: new Date().toLocaleString(),
      ...logData
    };
    setLogs(prev => [newLog, ...prev]);
  }, [user]);

  const handleUpdateSettings = (newSettings: SystemSettings) => {
    if (newSettings.recovery.globalLockdown !== settings.recovery.globalLockdown) {
      setIsGlobalLockdown(!!newSettings.recovery.globalLockdown);
      handleLogSecurity(
        newSettings.recovery.globalLockdown ? 'SYSTEM_LOCKDOWN' : 'SYSTEM_RELEASE',
        newSettings.recovery.globalLockdown ? 'Emergency lockdown initiated by Superadmin.' : 'System release authorized.',
        'critical'
      );
    }
    setSettings(newSettings);
  };

  // Supabase Auth and Data Fetching
  useEffect(() => {
    // Check active session
    supabaseService.getCurrentUser().then(u => {
      if (u) setUser(u);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        supabaseService.getCurrentUser().then(setUser);
      } else {
        setUser(null);
        setPortfolio([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;

    // Portfolio
    const dbDebtors = await supabaseService.getDebtors();
    setPortfolio(dbDebtors);

    // Profiles
    const profiles = await supabaseService.getProfiles();
    setSystemUsers(prev => {
      const existingIds = new Set(prev.map(u => u.id));
      const newProfiles = profiles.filter(p => !existingIds.has(p.id));
      return [...prev, ...newProfiles];
    });

    // Campaigns
    const campsRes = await supabaseService.getCampaigns();
    if (campsRes.data) setCampaigns(campsRes.data as any);

    // Logs
    const logsRes = await supabaseService.getLogs();
    if (logsRes.data) setLogs(logsRes.data as any);

    // Activities
    const dbActivities = await supabaseService.getAllActivities();
    setActivities(dbActivities);

    // Recordings
    const recsRes = await supabaseService.getCallRecordings();
    if (recsRes.data) setRecordings(recsRes.data as any);

    // Attendance
    const attRes = await supabaseService.getAttendance(user.id, new Date().toISOString().split('T')[0]);
    if (attRes.data) {
      const att = attRes.data;
      setAttendance({
        id: att.id,
        userId: att.user_id,
        userName: user.name,
        date: att.date,
        status: att.status as any,
        sessions: att.sessions || [],
        totalWorkMinutes: att.total_work_minutes,
        totalBreakMinutes: att.total_break_minutes
      });
    }
  }, [user]);

  // Fetch Data when User is set
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddCampaign = async (camp: ClientCampaign) => {
    const { error } = await supabase.from('campaigns').insert(camp);
    if (!error) setCampaigns(prev => [...prev, camp]);
  };

  const handleUpdateCampaign = async (camp: ClientCampaign) => {
    const { error } = await supabase.from('campaigns').update(camp).eq('id', camp.id);
    if (!error) setCampaigns(prev => prev.map(c => c.id === camp.id ? camp : c));
  };

  const handleDeleteCampaign = async (id: string) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (!error) setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  // Data Security: Screen Protection & Screenshot Control
  // Toggle Density Mode
  useEffect(() => {
    if (view === 'app' && user) {
      document.documentElement.classList.add('dense-ui');
    } else {
      document.documentElement.classList.remove('dense-ui');
    }
  }, [view, user]);

  // Data Security: Screen Protection & Screenshot Control
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (settings.compliance.screenProtection) {
        document.body.style.filter = document.hidden ? 'blur(25px)' : 'none';
      }
    };

    const handleBlur = () => {
      if (settings.compliance.screenProtection) document.body.style.filter = 'blur(25px)';
    };

    const handleFocus = () => {
      document.body.style.filter = 'none';
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (settings.compliance.screenshotControl) {
        // Block Cmd+Shift+3, Cmd+Shift+4, PrintScreen, etc.
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
          e.preventDefault();
          handleLogSecurity('SCREENSHOT_ATTEMPT', 'Blocked screenshot shortcut sequence', 'high');
          alert('SECURITY: Screenshots are strictly prohibited on this terminal.');
        }
        if (e.key === 'PrintScreen') {
          e.preventDefault();
          handleLogSecurity('SCREENSHOT_ATTEMPT', 'Blocked PrintScreen key', 'high');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeydown);
      document.body.style.filter = 'none';
    };
  }, [user, settings.compliance.screenProtection, settings.compliance.screenshotControl]);

  // Simulation: Occasionally trigger a security alert for demo
  useEffect(() => {
    if (user && !activeAlert && Math.random() > 0.995) { // Reduced frequency
      const newAlert: AnomalyAlert = {
        id: 'alert-' + Date.now(),
        type: 'UNAUTHORIZED_ACCESS',
        severity: 'WARNING',
        agentName: 'Unknown Node',
        agentId: 'EXT-IP-102.14.55.2',
        timestamp: new Date().toLocaleTimeString(),
        details: 'Attempted SQL injection detected from external IP range. Geographic origin: Unknown.'
      };
      setActiveAlert(newAlert);
    }
  }, [user, activeAlert]);


  const handleClearLogs = useCallback(async () => {
    // In a real app, we'd call a service to delete all logs
    // For now, we clear local state to simulate it
    setLogs([]);
  }, []);

  const handleResetSystem = useCallback(async () => {
    // Master Core Re-initialization
    handleLogSecurity('SYSTEM_RESET', 'Master core re-initialization executed. Syncing with Supabase.', 'critical');
    await fetchData();
    alert('System Refresh Complete: All regional nodes re-synced with Supabase core.');
  }, [handleLogSecurity, fetchData]);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('app'); // Route to Login instead of Landing
  };

  const renderContent = () => {
    if (isGlobalLockdown && user?.role !== 'ADMIN') {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-center p-20 animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-rose-600 text-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-rose-600/30 animate-pulse">
            <Lock size={48} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">GLOBAL LOCKDOWN ACTIVE</h2>
          <p className="text-slate-500 mt-4 max-w-md font-medium text-lg italic">
            All node operations have been suspended by the Superadmin due to a security anomaly. Please contact the SOC for authorization.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return (
        <Dashboard
          settings={settings}
          portfolio={portfolio}
          activities={activities}
          systemUsers={systemUsers}
          currentUser={user!}
        />
      );
      case 'portfolio': return (
        <Portfolio
          portfolio={portfolio.filter(d => !activeCampaign || d.campaignId === activeCampaign.id)}
          activities={activities}
          onAddActivity={async (a) => {
            await supabaseService.addActivity(a);
            setActivities(prev => [a].concat(prev));
          }}
          settings={settings} onUpdateSettings={handleUpdateSettings}
          user={user!} systemUsers={systemUsers} onUpdateUser={(u) => setSystemUsers(prev => prev.map(usr => usr.id === u.id ? u : usr))}
          onImportPortfolio={(imp) => setPortfolio(prev => prev.concat(imp))}
          onSetPortfolio={(p) => setPortfolio(p)}
          onLogExport={() => { }}
          onBulkUpdateDebtors={(ids, updates) => setPortfolio(prev => prev.map(d => ids.includes(d.id) ? { ...d, ...updates } : d))}
          onBulkAssignDebtors={async (ids, aid) => {
            const error = await supabaseService.assignDebtors(ids, aid);
            if (!error) {
              const updatedPortfolio = await supabaseService.getDebtors();
              setPortfolio(updatedPortfolio);
              handleLogSecurity('Bulk Assignment', `Assigned ${ids.length} debtors to Agent ID ${aid}`, 'low');
            }
          }}
          onBulkStatusUpdate={async (ids, status) => {
            const { error } = await supabaseService.updateDebtorsStatus(ids, status);
            if (!error) {
              const updatedPortfolio = await supabaseService.getDebtors();
              setPortfolio(updatedPortfolio);
              handleLogSecurity('Bulk Status Change', `Updated ${ids.length} debtors to status: ${status}`, 'low');
            }
          }}

        />
      );

      case 'internal': return <InternalComms currentUser={user!} systemUsers={systemUsers} logs={logs} onLogComms={(a, d) => handleLogSecurity(a, d, 'low')} />;
      case 'voice_ops': return <VoiceOperationsCenter settings={settings} user={user!} onSaveRecording={async (r) => {
        const { error } = await supabaseService.saveCallRecording(r);
        if (!error) setRecordings(prev => [r, ...prev]);
      }} />;
      case 'legal': return <LegalModule settings={settings} />;
      case 'communications': return <OmnichannelHub onAddActivity={async (a) => {
        await supabaseService.addActivity(a);
        setActivities(prev => [a].concat(prev));
      }} user={user!} settings={settings} />;
      case 'field': return <FieldForce portfolio={portfolio} activities={activities} settings={settings} onSaveProof={async (a) => {
        await supabaseService.addActivity(a);
        setActivities(prev => [a].concat(prev));
      }} />;
      case 'skiptracing': return <SkipTracing onAddActivity={async (a) => {
        await supabaseService.addActivity(a);
        setActivities(prev => [a].concat(prev));
      }} user={user!} portfolio={portfolio} onUpdateDebtor={(upd) => setPortfolio(prev => prev.map(d => d.id === upd.id ? upd : d))} onLinkToOmnichannel={() => { }} settings={settings} />;
      case 'qa': return <QABotHub currentUser={user!} recordings={recordings} onUpdateRecording={(updated) => setRecordings(prev => prev.map(r => r.id === updated.id ? updated : r))} />;
      case 'settings': return (
        <Settings
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          systemUsers={systemUsers}
          currentUser={user!}
          onUpdateUser={(u) => setSystemUsers(prev => prev.map(usr => usr.id === u.id ? u : usr))}
          onImportUsers={() => { }}
          logs={logs}
          onSystemReset={() => { }}
          onSeedPortfolio={handleSeedPortfolio}
          campaigns={campaigns}
        />
      );
      case 'admin_panel': return (
        <AdminPanel
          user={user!}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          systemUsers={systemUsers}
          logs={logs}
          campaigns={campaigns}
          onSystemReset={handleResetSystem}
          onLogAction={handleLogSecurity}
          onClearLogs={handleClearLogs}
          onAddUser={(nu) => setSystemUsers(prev => prev.concat(nu))}
          onUpdateUser={(u) => setSystemUsers(prev => prev.map(usr => usr.id === u.id ? u : usr))}
          onDeleteUser={(id) => setSystemUsers(prev => prev.filter(u => u.id !== id))}
          onAddCampaign={handleAddCampaign}
          onUpdateCampaign={handleUpdateCampaign}
          onDeleteCampaign={handleDeleteCampaign}
        />
      );
      case 'campaigns': return <CampaignManager settings={settings} />;
      case 'comms_hub': return <CommunicationHub settings={settings} />;
      case 'grievances': return (
        <Grievances
          user={user!}
          debtorAccounts={portfolio}
        />
      );
      case 'strategies': return <CollectionFlows user={user!} settings={settings} />;
      case 'monitoring': return (
        <LiveMonitoring
          user={user!}
          settings={settings}
          systemUsers={systemUsers}
          portfolio={portfolio}
          activities={activities}
        />
      );

      case 'analytics': return <AnalyticsModule portfolio={portfolio} activities={activities} logs={logs} user={user!} settings={settings} />;
      default: return <Dashboard settings={settings} />;
    }
  };

  const handleSeedUsers = useCallback(async () => {
    const newUsers = generateDummyUsers();
    const { count, error } = await supabaseService.seedProfiles(newUsers);
    if (!error) {
      const refreshedUsers = await supabaseService.getProfiles();
      setSystemUsers(prev => {
        const existingIds = new Set(prev.map(u => u.id));
        const uniqueFromSupabase = refreshedUsers.filter(u => !existingIds.has(u.id));
        return [...prev, ...uniqueFromSupabase];
      });
      alert(`Successfully seeded ${count} users to Supabase.`);
    } else {
      alert(`Seeding failed: ${error.message || 'Unknown error'}`);
    }
  }, []);

  const handleSeedPortfolio = useCallback(async () => {
    const { count, error } = await supabaseService.seedPortfolio();
    if (!error) {
      const updatedPortfolio = await supabaseService.getDebtors();
      setPortfolio(updatedPortfolio);
      alert(`Seeded ${count} new debtor accounts into the database.`);
    } else {
      alert(`Seeding failed: ${error.message || 'Unknown error'}`);
    }
  }, []);

  if (view === 'landing') return <LandingPage settings={settings.landingPage || DEFAULT_LANDING_PAGE_CONFIG} onEnterSystem={() => setView('app')} />;
  if (!user) return <Login systemUsers={systemUsers} onLogin={setUser} onRecoveryRequest={() => { }} onBackToLanding={() => setView('landing')} onSeedUsers={handleSeedUsers} />;
  if (!isInitialized) return <SetupWizard onComplete={(c) => { setSystemUsers([c.admin]); setSettings(c.settings); localStorage.setItem('pccs_initialized', 'true'); setIsInitialized(true); }} />;

  // Campaign Enforcement Layer
  if (!activeCampaign && !['SUPER_ADMIN'].includes(user.role)) {
    return <CampaignSelector campaigns={campaigns.length > 0 ? campaigns : DUMMY_CLIENT_CAMPAIGNS} user={user} onSelect={setActiveCampaign} />;
  }

  return (
    <>
      <Layout
        activeTab={activeTab} setActiveTab={setActiveTab} user={user} settings={settings}
        notifications={[]} onMarkNotificationAsRead={() => { }} onMarkAllAsRead={() => { }} onLogout={handleLogout}
        activeCampaign={activeCampaign} onSwitchCampaign={() => setActiveCampaign(null)}
        attendance={attendance} onUpdateAttendance={handleUpdateAttendance}
      >
        {renderContent()}
      </Layout>

      {activeAlert && (
        <AnomalySentinel
          alert={activeAlert}
          onDismiss={() => setActiveAlert(null)}
          onAction={(action) => {
            handleLogSecurity('SENTINEL_ACTION', `Action: ${action} taken against ${activeAlert.agentId}`, 'high');
            setActiveAlert(null);
          }}
        />
      )}
    </>
  );
};

export default App;
