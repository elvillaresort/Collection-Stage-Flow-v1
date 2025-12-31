
import * as React from 'react';
import {
   Settings as SettingsIcon, Zap, ShieldCheck, History, Users, Plus, Shield, X, UserPlus, Search, Power, ChevronRight, Loader2, UserCog, ShieldAlert, FileUp, LayoutGrid, Building2, Trash2, Save, Globe, PlusCircle, Database, Link as LinkIcon, ShieldX, Gauge, Lock, Clock, EyeOff, UserCheck, AlertTriangle, Flame, Fingerprint, Activity, Edit3, RefreshCw, Key, MoreVertical, Terminal, Cpu, CloudLightning, ShieldQuestion, Server, LockKeyhole, Monitor, User as UserIcon, ArrowRight, Rocket, Stamp, Smartphone, Gavel, MapPinned, Trophy, Image, Hash, Upload, ChevronUp, ChevronDown, CameraOff, Scissors, Binary, Target
} from 'lucide-react';
import { SystemSettings, User, UserRole, SystemLog, ClientCampaign, AegisSecurityConfig, LandingPageConfig, LandingPageFeature } from '../types';

const { useState, useMemo, useEffect } = React;

interface SettingsProps {
   settings: SystemSettings;
   onUpdateSettings: (newSettings: SystemSettings) => void;
   systemUsers: User[];
   currentUser: User;
   onUpdateUser: (user: User) => void;
   onImportUsers: (users: User[]) => void;
   logs: SystemLog[];
   onSystemReset: () => void;
   campaigns: ClientCampaign[];
   onSeedPortfolio?: () => void;
}

const ROLES: UserRole[] = [
   'SUPER_ADMIN', 'ADMIN', 'AGENT', 'FIELD_AGENT', 'CAMPAIGN_ADMIN', 'TEAM_LEADER',
   'OPERATIONS_MANAGER', 'HEAD_OF_OPERATIONS', 'TEAM_MANAGER',
   'COMPLIANCE_OFFICER', 'ASSISTANT_TEAM_LEADER'
];

/**
 * Helper component for Image Upload with annotations
 */
const ImageUploader: React.FC<{
   label: string;
   value: string;
   onChange: (url: string) => void;
   dimensions: string;
   description: string;
}> = ({ label, value, onChange, dimensions, description }) => {
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            onChange(reader.result as string);
         };
         reader.readAsDataURL(file);
      }
   };

   return (
      <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-200 text-left">
         <div className="flex justify-between items-start">
            <div className="text-left">
               <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block mb-1">{label}</label>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{description}</p>
            </div>
            <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest">{dimensions}</div>
         </div>

         <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 group relative">
               {value ? (
                  <img src={value} className="w-full h-full object-cover" alt="Preview" />
               ) : (
                  <Image size={24} className="text-slate-200" />
               )}
               <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload size={20} className="text-white" />
               </div>
               <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title={`Upload ${label}`}
               />
            </div>

            <div className="flex-1 space-y-2">
               <div className="relative">
                  <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                     type="text"
                     value={value}
                     onChange={(e) => onChange(e.target.value)}
                     placeholder="Or paste asset URL..."
                     className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-mono outline-none focus:border-blue-600"
                     title={`${label} URL`}
                  />
               </div>
               <p className="text-[8px] text-slate-400 font-medium leading-relaxed italic">
                  * PNG with transparency recommended for logos. High-clarity WebP for hero assets.
               </p>
            </div>
         </div>
      </div>
   );
};

const Settings: React.FC<SettingsProps> = ({
   settings, onUpdateSettings, systemUsers, currentUser,
   onUpdateUser, logs, campaigns, onSeedPortfolio
}) => {
   const [activeView, setActiveView] = useState<'security' | 'aegis' | 'landing' | 'cyber'>('security');
   const [landingSubTab, setLandingSubTab] = useState<'branding' | 'hero' | 'sections' | 'fabricator'>('branding');
   const [openMenuId, setOpenMenuId] = useState<string | null>(null);

   useEffect(() => {
      const handleClickOutside = () => setOpenMenuId(null);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
   }, []);



   const updateLanding = (path: string, value: any) => {
      const newSettings = JSON.parse(JSON.stringify(settings));
      const parts = path.split('.');
      let current = newSettings.landingPage;
      for (let i = 0; i < parts.length - 1; i++) {
         current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      onUpdateSettings(newSettings);
   };

   const updateAegis = (updates: Partial<AegisSecurityConfig>) => {
      onUpdateSettings({ ...settings, aegis: { ...settings.aegis, ...updates } });
   };

   const updateCompliance = (updates: Partial<typeof settings.compliance>) => {
      onUpdateSettings({ ...settings, compliance: { ...settings.compliance, ...updates } });
   };



   return (
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20 text-left">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
            <div className="text-left">
               <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <SettingsIcon size={32} className="text-blue-600" /> Admin Control Center
               </h1>
               <p className="text-slate-500 mt-1 font-medium italic">Operational command for personnel, identity, and data sovereignty.</p>
            </div>
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-wrap">
               {[
                  { id: 'security', label: 'Data Matrix', icon: ShieldCheck },
                  { id: 'aegis', label: 'Aegis Isolation', icon: CloudLightning },
                  { id: 'cyber', label: 'Cyber Sentinel', icon: ShieldAlert },
                  { id: 'landing', label: 'Landing Control', icon: Monitor }
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveView(tab.id as any)}
                     className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeView === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                  >
                     <tab.icon size={14} />
                     <span>{tab.label}</span>
                  </button>
               ))}
            </div>
         </div>

         {activeView === 'security' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
               <div className="bg-emerald-600 p-10 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
                  <div className="absolute right-[-20px] top-[-20px] opacity-10"><ShieldCheck size={200} /></div>
                  <div className="relative z-10">
                     <h2 className="text-3xl font-black">Data Sovereignty Matrix</h2>
                     <p className="text-emerald-50 mt-4 max-w-2xl font-medium leading-relaxed italic opacity-80">
                        "Enforce absolute data protection across the ecosystem. Prevent screenshots, block password sharing, and neutralize leakage vectors instantly."
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Endpoint Protection */}
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                     <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><CameraOff size={24} className="text-rose-600" /> Leakage Prevention</h3>
                     <div className="space-y-4">
                        {[
                           { key: 'screenshotControl', label: 'Block Screenshots', desc: 'Prevent system-level OCR and screen capture.', icon: CameraOff },
                           { key: 'screenProtection', label: 'Screen Blur on Blur', desc: 'Blurs the application when the tab is inactive.', icon: EyeOff },
                           { key: 'copyPaste', label: 'Clipboard Firewall', desc: 'Blocks Copy/Paste operations for sensitive data.', icon: Scissors }
                        ].map((item) => (
                           <div key={item.key} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all">
                              <div className="text-left">
                                 <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    {item.label}
                                 </p>
                                 <p className="text-[9px] text-slate-500 font-medium mt-1">{item.desc}</p>
                              </div>
                              <button
                                 onClick={() => updateCompliance({ [item.key]: !settings.compliance[item.key as keyof typeof settings.compliance] })}
                                 className={`w-12 h-6 rounded-full transition-all relative ${settings.compliance[item.key as keyof typeof settings.compliance] ? 'bg-emerald-600' : 'bg-slate-300'}`}
                                 title={`Toggle ${item.label}`}
                              >
                                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.compliance[item.key as keyof typeof settings.compliance] ? 'right-1' : 'left-1'}`} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Auth & Session Sovereignty */}
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                     <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Key size={24} className="text-indigo-600" /> Auth Sovereignty</h3>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-all">
                           <div className="text-left">
                              <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Anti-Password Sharing</p>
                              <p className="text-[9px] text-slate-500 font-medium mt-1">Kill duplicate sessions from different IP addresses.</p>
                           </div>
                           <button
                              onClick={() => updateCompliance({ passwordSharingProtection: !settings.compliance.passwordSharingProtection })}
                              className={`w-12 h-6 rounded-full transition-all relative ${settings.compliance.passwordSharingProtection ? 'bg-indigo-600' : 'bg-slate-300'}`}
                              title="Toggle Password Sharing Protection"
                           >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.compliance.passwordSharingProtection ? 'right-1' : 'left-1'}`} />
                           </button>
                        </div>

                        {/* Forensic Watermark Controls */}
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                           <div className="flex justify-between items-center">
                              <div className="text-left">
                                 <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Forensic Watermark</p>
                                 <p className="text-[9px] text-slate-500 font-medium">Inject persistent user-identity overlays.</p>
                              </div>
                              <button
                                 onClick={() => updateCompliance({ watermarkEnabled: !settings.compliance.watermarkEnabled })}
                                 className={`w-12 h-6 rounded-full transition-all relative ${settings.compliance.watermarkEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                                 title="Toggle Forensic Watermark"
                              >
                                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.compliance.watermarkEnabled ? 'right-1' : 'left-1'}`} />
                              </button>
                           </div>

                           {settings.compliance.watermarkEnabled && (
                              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                 <div className="space-y-2">
                                    <div className="flex justify-between">
                                       <label className="text-[9px] font-black text-slate-400 uppercase">Opacity Index</label>
                                       <span className="text-[9px] font-mono font-bold text-blue-600">{(settings.compliance.watermarkOpacity * 100).toFixed(0)}%</span>
                                    </div>
                                    <input
                                       type="range" min="0.01" max="0.3" step="0.01"
                                       value={settings.compliance.watermarkOpacity}
                                       onChange={(e) => updateCompliance({ watermarkOpacity: parseFloat(e.target.value) })}
                                       className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                       title="Watermark Opacity"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <div className="flex justify-between">
                                       <label className="text-[9px] font-black text-slate-400 uppercase">Grid Density</label>
                                       <span className="text-[9px] font-mono font-bold text-blue-600">{settings.compliance.watermarkDensity}x</span>
                                    </div>
                                    <input
                                       type="range" min="4" max="20" step="1"
                                       value={settings.compliance.watermarkDensity}
                                       onChange={(e) => updateCompliance({ watermarkDensity: parseInt(e.target.value) })}
                                       className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                       title="Watermark Density"
                                    />
                                 </div>
                              </div>
                           )}
                        </div>

                        <div className="space-y-3 p-5 bg-slate-50 rounded-2xl">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Force Session Timeout (Min)</label>
                           <div className="relative">
                              <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                 type="number"
                                 title="Session Timeout"
                                 value={settings.compliance.sessionTimeout}
                                 onChange={(e) => updateCompliance({ sessionTimeout: parseInt(e.target.value) || 30 })}
                                 className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-600"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Encryption & Integrity */}
                  <div className="bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
                     <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><Binary size={150} /></div>
                     <h3 className="text-xl font-black text-white flex items-center gap-3"><Monitor size={24} className="text-amber-400" /> Data Integrity</h3>
                     <div className="space-y-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                           <div className="flex items-center gap-3 mb-3">
                              <ShieldCheck size={20} className="text-emerald-400" />
                              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">TLS 1.3 End-to-End</h4>
                           </div>
                           <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                              All data at rest and in transit is encrypted with Poly1305 + AES-256-GCM hardware acceleration.
                           </p>
                        </div>
                        <button
                           title="Rotate Security Keys"
                           className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95"
                        >
                           Rotate Security Keys
                        </button>
                     </div>
                  </div>

                  {/* Data Simulation */}
                  {onSeedPortfolio && (
                     <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Database size={24} className="text-purple-600" /> Data Simulation</h3>
                        <div className="space-y-4">
                           <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
                              <p className="text-[10px] text-purple-700 leading-relaxed font-medium mb-4">
                                 Inject dummy debtor accounts for system load testing and feature verification.
                              </p>
                              <button
                                 onClick={onSeedPortfolio}
                                 title="Seed Portfolio Database with Dummy Data"
                                 className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                              >
                                 <PlusCircle size={14} /> Seed Portfolio Database
                              </button>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         )}


         {activeView === 'aegis' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
               <div className="bg-slate-900 p-10 rounded-[3rem] text-white overflow-hidden relative shadow-2xl">
                  <div className="absolute right-[-20px] top-[-20px] opacity-10"><CloudLightning size={200} /></div>
                  <div className="relative z-10">
                     <h2 className="text-3xl font-black">Aegis Air-Gap Isolation</h2>
                     <p className="text-slate-400 mt-4 max-w-2xl font-medium leading-relaxed italic">
                        Configure the isolated browsing environment. All agent interactions are pixel-streamed through an ephemeral Linux node to prevent local data leakage.
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                     <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><LockKeyhole size={24} className="text-indigo-600" /> Hardening Protocols</h3>
                     <div className="space-y-4">
                        {[
                           { key: 'browserIsolation', label: 'Remote Browser Isolation', desc: 'Execute all web sessions in a sandboxed cloud container.' },
                           { key: 'disableCopyPaste', label: 'Clipboard Sanitation', desc: 'Prevent copying sensitive data from the app to local machine.' },
                           { key: 'disableFileUpload', label: 'Upload Firewall', desc: 'Block all unauthorized file uploads to external domains.' },
                           { key: 'credentialTheftProtection', label: 'Anti-Phishing Shield', desc: 'Detect and block credential harvesting attempts.' }
                        ].map((item) => (
                           <div key={item.key} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                              <div className="text-left">
                                 <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.label}</p>
                                 <p className="text-[9px] text-slate-500 font-medium">{item.desc}</p>
                              </div>
                              <button
                                 onClick={() => updateAegis({ [item.key]: !settings.aegis[item.key as keyof AegisSecurityConfig] })}
                                 className={`w-12 h-6 rounded-full transition-all relative ${settings.aegis[item.key as keyof AegisSecurityConfig] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                 title={`Toggle ${item.label}`}
                              >
                                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.aegis[item.key as keyof AegisSecurityConfig] ? 'right-1' : 'left-1'}`} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                     <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Monitor size={24} className="text-blue-600" /> Rendering Quality</h3>
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pixel Stream Latency</label>
                           <div className="grid grid-cols-3 gap-2">
                              {['low', 'medium', 'high'].map((q) => (
                                 <button
                                    key={q}
                                    onClick={() => updateAegis({ pixelStreamQuality: q as any })}
                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.aegis.pixelStreamQuality === q ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                    title={`Set Quality to ${q}`}
                                 >
                                    {q}
                                 </button>
                              ))}
                           </div>
                        </div>
                        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                           <div className="flex items-center gap-3 mb-2">
                              <ShieldCheck size={20} className="text-blue-600" />
                              <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Aegis Status: VERIFIED</h4>
                           </div>
                           <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                              Your current session is being routed through PH-CENTRAL-01 node. Bitrate: 4.2 Mbps. Encryption: AES-256-GCM.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeView === 'cyber' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
               <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute right-[-20px] top-[-20px] opacity-10"><ShieldAlert size={200} /></div>
                  <div className="relative z-10">
                     <h2 className="text-3xl font-black">Cyber Sentinel AI</h2>
                     <p className="text-blue-100 mt-4 max-w-2xl font-medium leading-relaxed italic">
                        Real-time threat detection and behavioral analytics. Sentinel AI monitors every packet to ensure zero-day protection against internal and external breaches.
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                     <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Fingerprint size={24} className="text-blue-600" /> Sentinel Guard</h3>
                     <div className="space-y-4">
                        {[
                           { key: 'enabled', label: 'AI Monitoring', val: settings.sentinel.enabled },
                           { key: 'autoFreezeOnCritical', label: 'Auto-Containment', val: settings.sentinel.autoFreezeOnCritical },
                           { key: 'exfiltrationDetection', label: 'DLP Engine', val: settings.sentinel.exfiltrationDetection },
                           { key: 'behavioralAnalytics', label: 'Behavioral Radar', val: settings.sentinel.behavioralAnalytics }
                        ].map((s) => (
                           <div key={s.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                              <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{s.label}</span>
                              <button
                                 onClick={() => onUpdateSettings({ ...settings, sentinel: { ...settings.sentinel, [s.key]: !s.val } })}
                                 className={`w-10 h-5 rounded-full relative transition-all ${s.val ? 'bg-blue-600' : 'bg-slate-300'}`}
                                 title={`Toggle ${s.label}`}
                              >
                                 <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${s.val ? 'right-0.5' : 'left-0.5'}`} />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                     <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Globe size={24} className="text-emerald-600" /> Compliance Axis</h3>
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">IP Whitelist</label>
                           <div className="flex flex-wrap gap-2">
                              {settings.compliance.ipWhitelist.map(ip => (
                                 <span key={ip} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-mono font-bold text-slate-600 border border-slate-200">{ip}</span>
                              ))}
                              <button className="p-1.5 bg-slate-950 text-white rounded-lg" title="Add IP"><Plus size={12} /></button>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Authorized SSID</label>
                           <div className="flex flex-wrap gap-2">
                              {settings.compliance.allowedSSID.map(ssid => (
                                 <span key={ssid} className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200">{ssid}</span>
                              ))}
                              <button className="p-1.5 bg-slate-950 text-white rounded-lg" title="Add SSID"><Plus size={12} /></button>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
                     <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><ShieldCheck size={150} /></div>
                     <h3 className="text-xl font-black flex items-center gap-3"><Zap size={24} className="text-amber-400" /> Threat Matrix</h3>
                     <div className="space-y-6">
                        <div className="text-center p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Global Threat Level</p>
                           <h2 className={`text-4xl font-black ${settings.sentinel.threatLevel === 'NORMAL' ? 'text-emerald-400' : 'text-rose-500'}`}>{settings.sentinel.threatLevel}</h2>
                        </div>
                        <button
                           onClick={() => onUpdateSettings({ ...settings, recovery: { ...settings.recovery, globalLockdown: !settings.recovery.globalLockdown } })}
                           className={`w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${settings.recovery.globalLockdown ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white shadow-xl shadow-rose-600/30'}`}
                           title="Global Lockdown Switch"
                        >
                           {settings.recovery.globalLockdown ? 'Release System' : 'EXECUTE LOCKDOWN'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeView === 'landing' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left leading-none">
               <div className="bg-slate-950 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl text-left">
                  <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12"><Rocket size={200} /></div>
                  <div className="relative z-10 text-left">
                     <h2 className="text-3xl font-black flex items-center gap-4">Landing Ecosystem Override</h2>
                     <p className="text-slate-400 font-bold mt-4 leading-relaxed italic max-w-2xl text-left">
                        "Full real-time control over branding, section visibility, and visual assets for the client-facing portal. Toggle nodes and re-sync across the edge network instantly."
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                  <div className="lg:col-span-1 space-y-2">
                     {[
                        { id: 'branding', label: 'Branding & Identity', icon: Stamp },
                        { id: 'hero', label: 'Hero Projection', icon: Rocket },
                        { id: 'sections', label: 'Operational Nodes', icon: LayoutGrid },
                        { id: 'fabricator', label: 'Module Fabricator', icon: Cpu }
                     ].map(sub => (
                        <button
                           key={sub.id}
                           onClick={() => setLandingSubTab(sub.id as any)}
                           className={`w-full text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${landingSubTab === sub.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
                           title={`Go to ${sub.label}`}
                        >
                           <sub.icon size={16} /> {sub.label}
                        </button>
                     ))}
                  </div>

                  <div className="lg:col-span-3 space-y-8 text-left">
                     {landingSubTab === 'branding' && (
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10 text-left animate-in fade-in duration-300">
                           <div className="flex items-center gap-4 mb-4 text-left">
                              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Stamp size={24} /></div>
                              <div className="text-left">
                                 <h3 className="text-xl font-black text-slate-900 tracking-tight">System Identity</h3>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Brand Values</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                              <div className="space-y-4 text-left">
                                 <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Logo Primary Text</label>
                                    <input
                                       title="Logo Text"
                                       value={settings.landingPage?.branding.logoText}
                                       onChange={(e) => updateLanding('branding.logoText', e.target.value)}
                                       className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600"
                                    />
                                 </div>
                                 <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Entity Full Name</label>
                                    <input
                                       title="Company Name"
                                       value={settings.landingPage?.branding.companyName}
                                       onChange={(e) => updateLanding('branding.companyName', e.target.value)}
                                       className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-600"
                                    />
                                 </div>
                              </div>
                              <ImageUploader
                                 label="Entity Master Logo"
                                 description="Displayed in Nav and Footer"
                                 dimensions="512x512px"
                                 value={settings.landingPage?.branding.logoImage || ''}
                                 onChange={(url) => updateLanding('branding.logoImage', url)}
                              />
                           </div>
                        </div>
                     )}

                     {landingSubTab === 'hero' && (
                        <div className="space-y-8 text-left animate-in fade-in duration-300">
                           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10 text-left">
                              <div className="flex items-center justify-between text-left">
                                 <div className="flex items-center gap-4 text-left">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center"><Rocket size={24} /></div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Hero Projection</h3>
                                 </div>
                                 <button
                                    onClick={() => updateLanding('sections.hero.enabled', !settings.landingPage?.sections.hero.enabled)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settings.landingPage?.sections.hero.enabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}
                                    title="Toggle Hero Visibility"
                                 >
                                    {settings.landingPage?.sections.hero.enabled ? 'Section Active' : 'Section Offline'}
                                 </button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                                 <div className="space-y-6 text-left">
                                    <div className="space-y-2 text-left">
                                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Main Headline</label>
                                       <input
                                          title="Headline"
                                          value={settings.landingPage?.sections.hero.title}
                                          onChange={(e) => updateLanding('sections.hero.title', e.target.value)}
                                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold"
                                       />
                                    </div>
                                    <div className="space-y-2 text-left">
                                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Support Narrative</label>
                                       <textarea
                                          title="Subtitle" rows={3}
                                          value={settings.landingPage?.sections.hero.subtitle}
                                          onChange={(e) => updateLanding('sections.hero.subtitle', e.target.value)}
                                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium resize-none"
                                       />
                                    </div>
                                 </div>
                                 <ImageUploader
                                    label="Hero Background Projection"
                                    description="Main background for the landing page"
                                    dimensions="1920x1080px"
                                    value={settings.landingPage?.sections.hero.bgImage || ''}
                                    onChange={(url) => updateLanding('sections.hero.bgImage', url)}
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                     {landingSubTab === 'sections' && (
                        <div className="space-y-8 text-left animate-in fade-in duration-300">
                           {Object.entries(settings.landingPage?.sections || {}).filter(([k]) => k !== 'hero' && k !== 'customSections').map(([key, section]: [string, any]) => (
                              <div key={key} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10 text-left">
                                 <div className="flex items-center justify-between text-left">
                                    <div className="flex items-center gap-4 text-left">
                                       <div className="w-10 h-10 rounded-xl bg-slate-50 text-blue-600 flex items-center justify-center uppercase font-black text-[10px]">{key.slice(0, 1)}</div>
                                       <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">{key} Node</h3>
                                    </div>
                                    <button
                                       onClick={() => updateLanding(`sections.${key}.enabled`, !section.enabled)}
                                       className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${section.enabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}
                                       title={`Toggle ${key} Visibility`}
                                    >
                                       {section.enabled ? 'Active' : 'Offline'}
                                    </button>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                                    <div className="space-y-6 text-left">
                                       {section.title !== undefined && (
                                          <div className="space-y-2 text-left">
                                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Display Title</label>
                                             <input
                                                title="Title" value={section.title}
                                                onChange={(e) => updateLanding(`sections.${key}.title`, e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                             />
                                          </div>
                                       )}
                                       {section.subtitle !== undefined && (
                                          <div className="space-y-2 text-left">
                                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Subtitle Node</label>
                                             <input
                                                title="Subtitle" value={section.subtitle}
                                                onChange={(e) => updateLanding(`sections.${key}.subtitle`, e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                             />
                                          </div>
                                       )}
                                    </div>
                                    {key === 'core' && (
                                       <div className="space-y-6 text-left">
                                          <ImageUploader
                                             label="Field Asset" description="Human grit visual" dimensions="1200x800px"
                                             value={section.fieldImage || ''} onChange={(url) => updateLanding('sections.core.fieldImage', url)}
                                          />
                                          <ImageUploader
                                             label="AI Asset" description="Machine flow visual" dimensions="1200x800px"
                                             value={section.aiImage || ''} onChange={(url) => updateLanding('sections.core.aiImage', url)}
                                          />
                                       </div>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {landingSubTab === 'fabricator' && (
                        <div className="space-y-8 text-left animate-in fade-in duration-300">
                           <div className="bg-slate-950 p-12 rounded-[4rem] text-center space-y-6 relative overflow-hidden shadow-2xl transition-all hover:shadow-blue-600/10 border border-white/5">
                              <Cpu size={48} className="text-blue-500 mx-auto animate-pulse" />
                              <h3 className="text-3xl font-black text-white tracking-tight">Node Fabricator Alpha</h3>
                              <button
                                 onClick={() => {
                                    const newSection = {
                                       id: `custom-${Date.now()}`,
                                       enabled: true,
                                       title: 'New Operational Node',
                                       subtitle: 'CUSTOM MODULE',
                                       content: 'Configure this module to display custom data on your landing page.',
                                       imagePosition: 'right',
                                       theme: 'dark'
                                    };
                                    updateLanding('sections.customSections', [...(settings.landingPage?.sections.customSections || []), newSection]);
                                 }}
                                 className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 mx-auto shadow-2xl shadow-blue-600/30 active:scale-95 transition-all"
                                 title="Synthesize New Node"
                              >
                                 <Plus size={18} /> Synthesize New Node
                              </button>
                           </div>

                           {settings.landingPage?.sections.customSections?.map((section, idx) => (
                              <div key={section.id} className="bg-white border border-slate-100 p-10 rounded-[3rem] space-y-10 text-left shadow-sm relative group overflow-hidden">
                                 <div className="flex items-center justify-between text-left">
                                    <div className="flex items-center gap-4 text-left">
                                       <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg"><Cpu size={20} /></div>
                                       <h3 className="text-xl font-black text-slate-900 tracking-tight">{section.title || 'Custom Node'}</h3>
                                    </div>
                                    <button
                                       onClick={() => {
                                          const newSections = (settings.landingPage?.sections.customSections || []).filter(s => s.id !== section.id);
                                          updateLanding('sections.customSections', newSections);
                                       }}
                                       className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                       title="Remove Node"
                                    >
                                       <Trash2 size={20} />
                                    </button>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
                                    <div className="space-y-6 text-left">
                                       <div className="grid grid-cols-2 gap-4 text-left">
                                          <div className="space-y-2 text-left">
                                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Headline</label>
                                             <input
                                                title="Title" value={section.title}
                                                onChange={(e) => {
                                                   const newSections = [...(settings.landingPage?.sections.customSections || [])];
                                                   newSections[idx].title = e.target.value;
                                                   updateLanding('sections.customSections', newSections);
                                                }}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                             />
                                          </div>
                                          <div className="space-y-2 text-left">
                                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sub-identifier</label>
                                             <input
                                                title="Subtitle" value={section.subtitle}
                                                onChange={(e) => {
                                                   const newSections = [...(settings.landingPage?.sections.customSections || [])];
                                                   newSections[idx].subtitle = e.target.value;
                                                   updateLanding('sections.customSections', newSections);
                                                }}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                             />
                                          </div>
                                       </div>
                                       <div className="space-y-2 text-left">
                                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Narrative Content</label>
                                          <textarea
                                             title="Content" rows={4}
                                             value={section.content}
                                             onChange={(e) => {
                                                const newSections = [...(settings.landingPage?.sections.customSections || [])];
                                                newSections[idx].content = e.target.value;
                                                updateLanding('sections.customSections', newSections);
                                             }}
                                             className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium resize-none"
                                          />
                                       </div>
                                    </div>
                                    <ImageUploader
                                       label="Node Visual Core" description="Primary module asset" dimensions="1280x720px"
                                       value={section.image || ''}
                                       onChange={(url) => {
                                          const newSections = [...(settings.landingPage?.sections.customSections || [])];
                                          newSections[idx].image = url;
                                          updateLanding('sections.customSections', newSections);
                                       }}
                                    />
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}

      </div>
   );
};

export default Settings;