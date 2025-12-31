import React, { useState, useMemo } from 'react';
import {
   Fingerprint, Search, MapPin, Phone, Mail, Users, Globe, Facebook, Instagram,
   Linkedin, Twitter, Shield, ShieldCheck, AlertTriangle, CheckCircle2, X, Eye, ExternalLink,
   Clock, User, Building2, Home, Briefcase, GraduationCap, Heart, Camera,
   MessageCircle, Share2, TrendingUp, Activity, FileText, Lock, Info, Zap,
   Database, RefreshCw, Filter, ChevronRight, ChevronDown, AlertCircle, Award
} from 'lucide-react';
import { Debtor, SystemSettings, User as UserType } from '../types';

interface SkipTracingProps {
   portfolio: Debtor[];
   user: UserType;
   settings: SystemSettings;
}

interface SkipTraceResult {
   id: string;
   debtorId: string;
   debtorName: string;
   timestamp: string;
   performedBy: string;
   legalBasis: 'legitimate_interest' | 'consent' | 'legal_obligation';
   consentReference?: string;
   findings: {
      phones: PhoneContact[];
      emails: EmailContact[];
      addresses: AddressContact[];
      socialMedia: SocialMediaProfile[];
      employment: EmploymentInfo[];
      relatives: RelativeContact[];
      publicRecords: PublicRecord[];
   };
   dataPrivacyCompliance: {
      npcNotified: boolean;
      consentObtained: boolean;
      legitimateInterestDocumented: boolean;
      dataMinimizationApplied: boolean;
      retentionPeriod: string;
   };
   status: 'in_progress' | 'completed' | 'failed';
   confidenceScore: number;
}

interface PhoneContact {
   number: string;
   type: 'mobile' | 'landline' | 'voip';
   status: 'active' | 'inactive' | 'disconnected';
   carrier?: string;
   lastVerified: string;
   source: string;
   confidence: number;
}

interface EmailContact {
   address: string;
   status: 'valid' | 'invalid' | 'risky';
   lastActivity?: string;
   source: string;
   confidence: number;
}

interface AddressContact {
   fullAddress: string;
   type: 'residential' | 'business' | 'previous';
   city: string;
   province: string;
   zipCode?: string;
   verified: boolean;
   lastVerified: string;
   source: string;
   confidence: number;
}

interface SocialMediaProfile {
   platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok';
   profileUrl: string;
   username: string;
   displayName: string;
   lastActive?: string;
   followers?: number;
   verified: boolean;
   confidence: number;
}

interface EmploymentInfo {
   company: string;
   position?: string;
   industry?: string;
   location?: string;
   startDate?: string;
   current: boolean;
   source: string;
   confidence: number;
}

interface RelativeContact {
   name: string;
   relationship: string;
   phone?: string;
   email?: string;
   address?: string;
   source: string;
   confidence: number;
}

interface PublicRecord {
   type: 'business_registration' | 'property_ownership' | 'vehicle_registration' | 'court_record';
   description: string;
   date: string;
   source: string;
   confidence: number;
}

const DUMMY_SKIP_TRACE: SkipTraceResult = {
   id: 'ST-2025-001',
   debtorId: 'DBT-JON-001',
   debtorName: 'Armando De Jesus Santiago Jr.',
   timestamp: new Date().toISOString(),
   performedBy: 'System AI',
   legalBasis: 'legitimate_interest',
   consentReference: 'CONSENT-2024-001',
   findings: {
      phones: [
         { number: '+63 917 555 0123', type: 'mobile', status: 'active', carrier: 'Globe Postpaid', lastVerified: '2025-01-02', source: 'Telco API', confidence: 99 },
         { number: '+63 908 555 9876', type: 'mobile', status: 'active', carrier: 'Smart', lastVerified: '2024-12-29', source: 'E-Wallet Link', confidence: 85 },
      ],
      emails: [
         { address: 'jon.santiago@example.com', status: 'valid', lastActivity: '2025-01-02', source: 'Social Media', confidence: 95 },
         { address: 'armando.jr@business.ph', status: 'valid', lastActivity: '2024-12-15', source: 'LinkedIn', confidence: 90 }
      ],
      addresses: [
         { fullAddress: 'Unit 2501, The One Tower, Ayala Ave, Makati City', type: 'residential', city: 'Makati', province: 'NCR', zipCode: '1226', verified: true, lastVerified: '2025-01-01', source: 'Utility Bill (Meralco)', confidence: 98 },
         { fullAddress: '456 Tech Park, BGC, Taguig City', type: 'business', city: 'Taguig', province: 'NCR', verified: true, lastVerified: '2024-11-20', source: 'LinkedIn', confidence: 90 }
      ],
      socialMedia: [
         { platform: 'linkedin', profileUrl: 'https://linkedin.com/in/armandodejesussantiago', username: 'jon.santiago', displayName: 'Jon Santiago', lastActive: '2024-12-30', verified: true, confidence: 96 },
         { platform: 'facebook', profileUrl: 'https://facebook.com/jonsantiago', username: 'jonsantiago', displayName: 'Armando Santiago', lastActive: '2025-01-01', followers: 1250, verified: false, confidence: 88 }
      ],
      employment: [
         { company: 'Tech Innovations Phils.', position: 'Chief Technology Officer', industry: 'Software', location: 'BGC, Taguig', startDate: '2019-03', current: true, source: 'LinkedIn', confidence: 98 }
      ],
      relatives: [
         { name: 'Maria Santiago', relationship: 'Spouse', phone: '+63 917 555 4321', source: 'Insurance Policy', confidence: 92 }
      ],
      publicRecords: [
         { type: 'property_ownership', description: 'Residential Condominium - Eastwood City', date: '2023-05-10', source: 'LRA', confidence: 95 },
         { type: 'business_registration', description: 'AJ Santiago Consulting Services', date: '2021-02-15', source: 'DTI', confidence: 99 }
      ]
   },
   dataPrivacyCompliance: {
      npcNotified: true,
      consentObtained: true,
      legitimateInterestDocumented: true,
      dataMinimizationApplied: true,
      retentionPeriod: '5 years from debt settlement'
   },
   status: 'completed',
   confidenceScore: 96
};

const SkipTracing: React.FC<SkipTracingProps> = ({ portfolio, user, settings }) => {
   const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
   const [skipTraceResults, setSkipTraceResults] = useState<SkipTraceResult[]>([DUMMY_SKIP_TRACE]);
   const [showResults, setShowResults] = useState(false);
   const [isTracing, setIsTracing] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [legalBasis, setLegalBasis] = useState<'legitimate_interest' | 'consent' | 'legal_obligation'>('legitimate_interest');
   const [consentReference, setConsentReference] = useState('');
   const [expandedSections, setExpandedSections] = useState<string[]>(['phones', 'emails', 'addresses']);

   const sym = settings.localization.currencySymbol;

   const filteredPortfolio = useMemo(() => {
      return portfolio.filter(d =>
         d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         d.loanId.toLowerCase().includes(searchQuery.toLowerCase())
      );
   }, [portfolio, searchQuery]);

   const toggleSection = (section: string) => {
      setExpandedSections(prev =>
         prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
      );
   };

   const handleStartTrace = () => {
      if (!selectedDebtor) {
         alert('Please select a debtor to trace');
         return;
      }

      if (legalBasis === 'consent' && !consentReference) {
         alert('Please provide consent reference number');
         return;
      }

      setIsTracing(true);
      setTimeout(() => {
         setIsTracing(false);
         setShowResults(true);
         alert('Skip trace completed! Review findings below.');
      }, 3000);
   };

   const getPlatformIcon = (platform: string) => {
      switch (platform) {
         case 'facebook': return Facebook;
         case 'instagram': return Instagram;
         case 'linkedin': return Linkedin;
         case 'twitter': return Twitter;
         default: return Globe;
      }
   };

   const getConfidenceColor = (confidence: number) => {
      if (confidence >= 80) return 'text-emerald-600 bg-emerald-50';
      if (confidence >= 60) return 'text-amber-600 bg-amber-50';
      return 'text-rose-600 bg-rose-50';
   };

   const getStatusColor = (status: string) => {
      switch (status) {
         case 'active':
         case 'valid':
         case 'completed':
            return 'bg-emerald-50 text-emerald-600 border-emerald-100';
         case 'inactive':
         case 'risky':
         case 'in_progress':
            return 'bg-amber-50 text-amber-600 border-amber-100';
         case 'disconnected':
         case 'invalid':
         case 'failed':
            return 'bg-rose-50 text-rose-600 border-rose-100';
         default:
            return 'bg-slate-50 text-slate-600 border-slate-100';
      }
   };

   return (
      <div className="flex-1 flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
         {/* Left: Queue / Selection */}
         <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0 lg:h-[calc(100vh-180px)]">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30"><Fingerprint size={24} /></div>
                  <div>
                     <h2 className="text-xl font-black text-slate-900 tracking-tight">Digital Skip</h2>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OSINT Fusion Core</p>
                  </div>
               </div>

               <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                     type="text"
                     placeholder="Connect to ID Database..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-4 focus:ring-blue-500/10 text-sm font-bold outline-none transition-all"
                  />
               </div>

               <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  <button
                     onClick={() => {
                        // Mock selecting the "sample" account if clicked
                        const dummyDebtor = { ...portfolio[0], id: 'DBT-JON-001', name: 'Armando De Jesus Santiago Jr.', loanId: 'LN-2025-8888', amountDue: 154000 };
                        setSelectedDebtor(dummyDebtor);
                        setShowResults(false);
                        setSkipTraceResults([DUMMY_SKIP_TRACE]);
                     }}
                     className={`w-full p-4 rounded-[2rem] border-2 transition-all text-left group relative overflow-hidden ${selectedDebtor?.id === 'DBT-JON-001' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-dashed border-slate-200 hover:border-blue-400'}`}
                  >
                     {selectedDebtor?.id === 'DBT-JON-001' && <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-bl-[4rem]"></div>}
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Sample Data</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     </div>
                     <p className="text-sm font-black truncate">Armando De Jesus Santiago Jr.</p>
                     <p className="text-[10px] font-bold opacity-60 mt-1">ID: LN-2025-8888 • Active</p>
                  </button>

                  <div className="my-4 border-t border-slate-100"></div>

                  {filteredPortfolio.slice(0, 10).map(d => (
                     <button
                        key={d.id}
                        onClick={() => { setSelectedDebtor(d); setShowResults(false); }}
                        className={`w-full p-4 rounded-[2rem] border-2 transition-all text-left flex flex-col gap-2 ${selectedDebtor?.id === d.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-transparent hover:bg-slate-50'
                           }`}
                     >
                        <div className="flex justify-between items-start">
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-50">{d.loanId}</span>
                        </div>
                        <p className="text-sm font-black truncate">{d.name}</p>
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Right: Main Interface */}
         <div className="flex-1 flex flex-col gap-6 lg:h-[calc(100vh-180px)]">
            {selectedDebtor ? (
               showResults ? (
                  // RESULTS VIEW
                  <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                     <div className="bg-slate-900 text-white p-8 rounded-[3rem] relative overflow-hidden shadow-2xl">
                        <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12"><Fingerprint size={300} /></div>
                        <div className="relative z-10 flex justify-between items-start">
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                 <h2 className="text-3xl font-black tracking-tight">{selectedDebtor.name}</h2>
                                 <ShieldCheck className="text-emerald-400" size={24} />
                              </div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Footprint Analysis Complete</p>
                           </div>
                           <div className="text-right">
                              <p className="text-4xl font-black text-emerald-400">{DUMMY_SKIP_TRACE.confidenceScore}%</p>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Confidence Score</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                           {[
                              { label: 'Phones', count: DUMMY_SKIP_TRACE.findings.phones.length, icon: Phone },
                              { label: 'Emails', count: DUMMY_SKIP_TRACE.findings.emails.length, icon: Mail },
                              { label: 'Addresses', count: DUMMY_SKIP_TRACE.findings.addresses.length, icon: MapPin },
                              { label: 'Profiles', count: DUMMY_SKIP_TRACE.findings.socialMedia.length, icon: Globe },
                           ].map(s => (
                              <div key={s.label} className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                 <s.icon className="text-blue-400 mb-2" size={20} />
                                 <p className="text-2xl font-black">{s.count}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Info */}
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 px-4"><Phone size={16} className="text-blue-600" /> <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Verified Contacts</h4></div>
                           {DUMMY_SKIP_TRACE.findings.phones.map((p, i) => (
                              <div key={i} className="p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                 <div>
                                    <p className="text-lg font-black text-slate-900 font-mono">{p.number}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{p.type} • {p.carrier}</p>
                                 </div>
                                 <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getConfidenceColor(p.confidence)}`}>{p.confidence}% Valid</div>
                              </div>
                           ))}
                           {DUMMY_SKIP_TRACE.findings.emails.map((e, i) => (
                              <div key={i} className="p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-500/30 transition-all">
                                 <div>
                                    <p className="text-sm font-bold text-slate-900">{e.address}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{e.source}</p>
                                 </div>
                                 <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getConfidenceColor(e.confidence)}`}>{e.confidence}% Valid</div>
                              </div>
                           ))}
                        </div>

                        {/* Location & Social */}
                        <div className="space-y-6">
                           <div className="space-y-4">
                              <div className="flex items-center gap-2 px-4"><MapPin size={16} className="text-emerald-600" /> <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Location Intel</h4></div>
                              {DUMMY_SKIP_TRACE.findings.addresses.map((a, i) => (
                                 <div key={i} className="p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:border-emerald-500/30 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                       <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase">{a.type}</span>
                                       {a.verified && <CheckCircle2 size={16} className="text-emerald-500" />}
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 leading-tight">{a.fullAddress}</p>
                                 </div>
                              ))}
                           </div>

                           <div className="space-y-4">
                              <div className="flex items-center gap-2 px-4"><Globe size={16} className="text-indigo-600" /> <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Social Graph</h4></div>
                              <div className="grid grid-cols-1 gap-3">
                                 {DUMMY_SKIP_TRACE.findings.socialMedia.map((s, i) => (
                                    <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-500/30 transition-all">
                                       <div className="p-2 bg-slate-50 rounded-xl"><Globe size={16} /></div>
                                       <div className="flex-1 min-w-0">
                                          <p className="text-xs font-black text-slate-900 truncate">{s.displayName}</p>
                                          <a href={s.profileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline truncate block">{s.profileUrl}</a>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               ) : (
                  // CONFIGURATION VIEW
                  <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-slate-200 p-6 md:p-12 text-center shadow-sm overflow-y-auto">
                     <div className="w-40 h-40 bg-blue-50 rounded-full flex items-center justify-center mb-8 animate-pulse relative">
                        <Fingerprint size={80} className="text-blue-500" />
                        <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-20"></div>
                     </div>
                     <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Initialize Trace Protocol</h2>
                     <p className="text-slate-500 font-medium max-w-lg mx-auto mb-10 leading-relaxed">
                        You are about to initiate a Tier-1 OSINT scan for <strong>{selectedDebtor.name}</strong>.
                        This action uses 10 credits and requires specific legal basis declaration.
                     </p>

                     <div className="w-full max-w-md space-y-6 text-left bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Basis for Processing</label>
                           <select
                              title="Legal Basis"
                              value={legalBasis}
                              onChange={(e) => setLegalBasis(e.target.value as any)}
                              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all appearance-none"
                           >
                              <option value="legitimate_interest">Legitimate Interest (Debt Recovery)</option>
                              <option value="consent">Data Subject Consent</option>
                              <option value="legal_obligation">Legal Obligation</option>
                           </select>
                        </div>
                        {legalBasis === 'consent' && (
                           <div className="space-y-3 animate-in slide-in-from-top-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consent Reference No.</label>
                              <input
                                 type="text"
                                 value={consentReference}
                                 onChange={(e) => setConsentReference(e.target.value)}
                                 className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none border-l-4 border-l-blue-500"
                                 placeholder="e.g. CST-2024-XXXX"
                              />
                           </div>
                        )}
                        <div className="flex items-center gap-3 p-4 bg-blue-100/50 rounded-xl">
                           <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                           <p className="text-[10px] text-blue-800 font-bold leading-tight">Compliance logged under RA 10173. Audit trail active.</p>
                        </div>
                     </div>

                     <button
                        onClick={handleStartTrace}
                        disabled={isTracing}
                        className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-500 active:scale-95 transition-all shadow-xl shadow-blue-500/30 flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isTracing ? (
                           <>
                              <RefreshCw size={20} className="animate-spin" /> Scanning Digital Footprint...
                           </>
                        ) : (
                           <>
                              <Search size={20} /> Execute Trace
                           </>
                        )}
                     </button>
                  </div>
               )
            ) : (
               // EMPTY STATE
               <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                  <Fingerprint size={120} className="text-slate-300 mb-6" />
                  <h3 className="text-2xl font-black text-slate-900">Select Subject</h3>
                  <p className="text-slate-500 font-bold mt-2">Choose an account from the queue to begin skip tracing.</p>
               </div>
            )}
         </div>
      </div>
   );
};

export default SkipTracing;