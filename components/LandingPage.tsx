import * as React from 'react';
const { useState, useEffect } = React;
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Gavel,
  Globe,
  Smartphone,
  Bot,
  CheckCircle2,
  TrendingUp,
  Lock,
  BarChart3,
  MapPin,
  Mail,
  Phone,
  Scale,
  Building2,
  MessageSquare,
  MessageCircle,
  Shield,
  Rocket,
  ArrowUpRight,
  Target,
  Trophy,
  Activity,
  FileSearch,
  Headphones,
  Facebook,
  Linkedin,
  MapPinned,
  UserCheck,
  Briefcase,
  History,
  Stamp,
  Award,
  ChevronRight,
  Plus,
  Database,
  Loader2,
  BrainCircuit,
  Volume2,
  Fingerprint
} from 'lucide-react';
import PCCSLogo from './PCCSLogo';

import { LandingPageConfig } from '../types';

interface LandingPageProps {
  onEnterSystem: () => void;
  settings: LandingPageConfig;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterSystem, settings }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'Remedial Collections',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsSent(true);
    setFormState({ name: '', email: '', phone: '', type: 'Remedial Collections', message: '' });
    setTimeout(() => setIsSent(false), 5000);
  };

  const { branding, sections } = settings;

  // Helper to get matching icon
  const getIcon = (name: string) => {
    const icons: Record<string, any> = {
      Smartphone, Gavel, MapPinned, Database, Trophy, ShieldCheck, Zap, Users, Bot, Scale, Globe
    };
    const Icon = icons[name] || Zap;
    return <Icon size={28} />;
  };

  return (
    <div className="min-h-screen bg-white font-inter text-slate-900 selection:bg-blue-100 selection:text-blue-900 scroll-smooth text-left">
      {/* Top Bar */}
      <div className="hidden lg:block bg-slate-950 text-white py-2.5">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.15em]">
          <div className="flex gap-8">
            <span className="flex items-center gap-2 text-slate-400">
              <Phone size={12} className="text-blue-500" /> +63 2 8XXX XXXX
            </span>
            <span className="flex items-center gap-2 text-slate-400">
              <Mail size={12} className="text-blue-500" /> solutions@panliliocollections.com
            </span>
            <span className="flex items-center gap-2 text-slate-400">
              <MapPin size={12} className="text-blue-500" /> Metro Manila, Philippines
            </span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-blue-500 transition-colors" title="Facebook"><Facebook size={14} /></a>
            <a href="#" className="hover:text-blue-500 transition-colors" title="LinkedIn"><Linkedin size={14} /></a>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-[1000] bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PCCSLogo size={48} src={branding.logoImage} />
            <div className="text-left">
              <span className="text-xl font-black tracking-tighter text-slate-950 uppercase leading-none block">{branding.logoText}</span>
              <span className="text-[9px] font-black uppercase text-blue-600 tracking-[0.1em] block mt-1">{branding.companyName}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {['Home', 'Practice Areas', 'The Firm', 'Performance', 'Compliance', 'Contact'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(' ', '-')}`}
                className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors"
              >
                {link}
              </a>
            ))}
            <button
              onClick={onEnterSystem}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-slate-950 transition-all shadow-xl shadow-blue-500/10 active:scale-95 flex items-center gap-2"
            >
              <UserCheck size={14} /> Operational Portal
            </button>
          </div>

          <button className="lg:hidden p-3 bg-slate-100 rounded-xl text-slate-900" title="Toggle Menu">
            <Activity size={24} />
          </button>
        </div>
      </nav>

      {/* Hero Section: The Singularity */}
      {sections.hero.enabled && (
        <section id="home" className="relative min-h-[110vh] flex items-center pt-32 pb-48 px-6 overflow-hidden bg-slate-950">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <img
              src={sections.hero.bgImage || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"}
              className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale hue-rotate-180 scale-110"
              alt="Cyber Background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-blue-900/20"></div>

            {/* Animated Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[60rem] h-[60rem] bg-indigo-600/10 rounded-full blur-[180px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-blue-500/10 rounded-full blur-[140px] animate-pulse delay-700"></div>

            {/* Futuristic Grid */}
            <div className="absolute inset-0 bg-performance-grid opacity-20"></div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10 w-full">
            <div className="text-left space-y-12 animate-in slide-in-from-left-12 duration-1000">
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-blue-500/5 border border-blue-500/20 rounded-full text-blue-400 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Link Status: Optimal</span>
              </div>

              <div className="space-y-8">
                <h1 className="text-7xl md:text-[10rem] font-black text-white leading-[0.8] tracking-[ -0.05em]">
                  {sections.hero.title.split('.')[0]}.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 animate-gradient-x">{sections.hero.title.split('.')[1] || 'Digital Dominance.'}</span>
                </h1>
                <p className="text-xl md:text-3xl text-slate-400 font-medium leading-relaxed max-w-xl text-left border-l-2 border-blue-600/30 pl-8">
                  {sections.hero.subtitle}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-16 py-8 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-[0_0_50px_rgba(37,99,235,0.4)] hover:shadow-[0_0_80px_rgba(37,99,235,0.6)] hover:scale-105 transition-all flex items-center justify-center gap-4 active:scale-95 group overflow-hidden relative"
                  title="Initiate Project Uplink"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {sections.hero.primaryCta}
                  <Rocket size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-8">
                  <div className="text-left">
                    <p className="text-5xl font-black text-white tracking-tighter leading-none">99.8<span className="text-blue-500 text-lg">%</span></p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Precision Rate</p>
                  </div>
                  <div className="h-10 w-px bg-white/10"></div>
                  <div className="text-left">
                    <p className="text-5xl font-black text-white tracking-tighter leading-none">24<span className="text-indigo-500 text-lg">H</span></p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Active Cycle</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Futuristic Infographic HUD */}
            <div className="relative animate-in zoom-in-90 duration-1000 hidden lg:block">
              <div className="aspect-square bg-white/[0.02] backdrop-blur-[100px] p-16 rounded-[4rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative group">
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-600/20 rounded-[5rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                {/* Rotating Inner Ring */}
                <div className="absolute inset-10 border border-white/5 rounded-full animate-spin-slow opacity-20"></div>
                <div className="absolute inset-20 border border-dashed border-blue-500/20 rounded-full animate-spin-reverse opacity-40"></div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-600/40"><Activity size={32} /></div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">System Health</p>
                      <p className="text-2xl font-black text-white mt-1">100.00%</p>
                    </div>
                  </div>

                  <div className="space-y-12">
                    {[
                      { l: 'Neural Logic', v: 98, c: 'from-blue-400 to-blue-600' },
                      { l: 'Field Telemetry', v: 92, c: 'from-indigo-400 to-indigo-600' },
                      { l: 'Data Integrity', v: 100, c: 'from-emerald-400 to-emerald-600' }
                    ].map((m, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{m.l}</span>
                          <span className="text-lg font-black text-white font-mono">{m.v}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[2px]">
                          <div className={`h-full bg-gradient-to-r ${m.c} rounded-full transition-all duration-[3000ms] w-[${m.v}%]`}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-10 border-t border-white/5 grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</p>
                      <p className="text-xl font-black text-white">4,204 <span className="text-[10px] text-emerald-500">▲</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Latency Delay</p>
                      <p className="text-xl font-black text-white">0.00ms</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Infographic Stats: The Pulse */}
      <section className="py-32 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { label: 'Total Recovery Velocity', value: '₱24.2B', icon: Database, color: 'text-blue-500' },
            { label: 'Autonomous Success', value: '94.2%', icon: BrainCircuit, color: 'text-indigo-500' },
            { label: 'Global Compliance', value: 'LVL 4', icon: ShieldCheck, color: 'text-emerald-500' }
          ].map((stat, i) => (
            <div key={i} className="group p-10 bg-white/[0.03] border border-white/10 rounded-[4rem] hover:bg-white/[0.05] transition-all text-center relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                <stat.icon size={160} />
              </div>
              <div className={`w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto mb-8 ${stat.color}`}>
                <stat.icon size={32} />
              </div>
              <p className="text-6xl font-black text-white tracking-tighter mb-4">{stat.value}</p>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Trust Bar */}
      <div className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-12">RECOVERY PARTNERS FOR THE PHILIPPINES' LARGEST INSTITUTIONS</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-30 grayscale filter transition-all hover:grayscale-0 hover:opacity-100 duration-700">
            <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900 border-r border-slate-200 pr-12">METROBANK</div>
            <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900 border-r border-slate-200 pr-12">BDO UNIBANK</div>
            <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900 border-r border-slate-200 pr-12">BPI</div>
            <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900 border-r border-slate-200 pr-12">RCBC</div>
            <div className="flex items-center gap-3 font-black text-2xl tracking-tighter text-slate-900">SECURITY BANK</div>
          </div>
        </div>
      </div>

      {/* The Firm */}
      {sections.firm.enabled && (
        <section id="the-firm" className="py-32 px-6 bg-white overflow-hidden text-left">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
            <div className="lg:w-1/2 relative group">
              <div className="relative z-10 grid grid-cols-12 gap-6">
                <div className="col-span-12">
                  <div className="relative rounded-[4rem] overflow-hidden border border-slate-200 shadow-2xl h-[400px]">
                    <img src={sections.firm.mediationImage || "/assets/mediation.png"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Mediation" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                      <div className="space-y-2">
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">LIVE MEDIATION NODE</p>
                        <h4 className="text-2xl font-black text-white">Strategic Arbitration</h4>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 -mt-12 relative z-20">
                  <div className="bg-slate-950 p-8 rounded-[3rem] border border-white/10 shadow-2xl space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><Scale size={20} /></div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">
                      Ethical resolution is at the heart of our mission. Every engagement is logged and audited for compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 text-left space-y-10">
              <h3 className="text-blue-600 font-black text-[12px] uppercase tracking-[0.4em]">{sections.firm.subtitle}</h3>
              <h2 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-none">{sections.firm.title}</h2>
              <p className="text-xl text-slate-600 font-medium leading-relaxed italic border-l-4 border-blue-600 pl-6">
                "{sections.firm.content || "We don't just collect debt; we repair financial relationships and enforce legal obligations with surgical precision."}"
              </p>
              <button className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-blue-600 transition-all flex items-center gap-3 active:scale-95">
                Read Our Mission <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Performance */}
      {sections.performance.enabled && (
        <section id="performance" className="py-32 bg-slate-950 text-white relative overflow-hidden text-center">
          <div className="absolute inset-0 opacity-[0.05] bg-performance-grid"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="text-center space-y-6 mb-24">
              <h3 className="text-blue-400 font-black text-[12px] uppercase tracking-[0.5em]">SYSTEM PERFORMANCE</h3>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter">{sections.performance.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {sections.performance.items.map((m, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-6 p-8 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-xl group hover:bg-blue-600 transition-all duration-500">
                  <div className="p-4 rounded-2xl bg-blue-600/20 text-blue-400 group-hover:bg-white/20 group-hover:text-white transition-all">{getIcon(m.icon)}</div>
                  <div>
                    <p className="text-5xl font-black tracking-tighter mb-2 group-hover:scale-110 transition-transform">{m.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-blue-100">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Leadership */}
      {sections.leadership.enabled && (
        <section className="py-32 px-6 text-left">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-left space-y-6">
              <h3 className="text-blue-600 font-black text-[12px] uppercase tracking-[0.4em]">LEADERSHIP</h3>
              <h2 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-none">{sections.leadership.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {sections.leadership.members.map((person, i) => (
                <div key={i} className="bg-white rounded-[3.5rem] border border-slate-100 p-10 text-left shadow-sm group hover:shadow-2xl transition-all">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 mb-8 overflow-hidden border-4 border-white shadow-xl grayscale group-hover:grayscale-0 transition-all duration-700">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} className="w-full h-full object-cover" alt={person.name} />
                  </div>
                  <h4 className="text-2xl font-black text-slate-950 mb-2">{person.name}</h4>
                  <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">{person.role}</p>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed italic border-l-2 border-slate-100 pl-4">"{person.bio}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Futuristic Feature Node */}
      <section className="py-48 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12 text-left">
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-blue-50 border border-blue-100 rounded-full text-blue-600">
                <Fingerprint size={18} />
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Biometric-Linked Accuracy</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black text-slate-950 tracking-tighter leading-[0.9]">
                Beyond Linear<br />
                <span className="text-blue-600 italic">Recovery.</span>
              </h2>
              <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-xl">
                We've replaced traditional collection scripts with Generative Behavioral Models that adapt in real-time to debtor sentiment, ensuring compliance and maximizing PTP rates.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="p-8 bg-slate-50 rounded-[3rem] space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg"><Zap size={20} /></div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Smart Trigger</h4>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">AI identification of peak liquidity windows per subject.</p>
                </div>
                <div className="p-8 bg-slate-50 rounded-[3rem] space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg"><Globe size={20} /></div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Global Sync</h4>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Instant cross-node data replication for multi-account subjects.</p>
                </div>
              </div>
            </div>

            {/* Central Infographic Graphic */}
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-100 rounded-full blur-[120px] opacity-50"></div>
              <div className="relative z-10 bg-slate-950 p-12 rounded-[5rem] shadow-2xl border border-white/10 group cursor-crosshair">
                <div className="aspect-[4/5] flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mission Terminal V2.4</span>
                  </div>

                  {/* Interactive Wave Visualizer */}
                  <div className="flex-1 flex flex-col justify-center gap-12">
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase text-blue-400"><span>Voice Resonance</span><span>92.4% Match</span></div>
                      <div className="h-24 flex items-center gap-2">
                        {[40, 80, 60, 45, 95, 70, 30, 85, 50, 65, 40, 90, 20, 75, 55].map((h, i) => (
                          <div key={i} className={`flex-1 bg-blue-500/20 rounded-full relative overflow-hidden h-[${h}%]`}>
                            <div className={`absolute inset-0 bg-blue-500 animate-wave delay-[${(i * 80)}ms]`}></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {[
                        { label: 'Subject Intent', value: 'HOSTILE → RECEPTIVE', color: 'text-amber-400' },
                        { label: 'PTP Probability', value: '84.2%', color: 'text-emerald-400' }
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-white/5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{row.label}</span>
                          <span className={`text-xs font-black ${row.color}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Shield: Infographic HUD */}
      {sections.compliance.enabled && (
        <section id="compliance" className="py-48 bg-slate-950 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-950 p-20 rounded-[6rem] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-64 bg-blue-600 rounded-full blur-[180px] opacity-20"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
                <div className="text-left space-y-10">
                  <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_0_50px_rgba(37,99,235,0.4)] mb-12 animate-pulse">
                    <ShieldCheck size={48} />
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">{sections.compliance.title}</h2>
                  <p className="text-xl text-slate-400 font-medium leading-relaxed">
                    Our Compliance Engine is hard-coded into every node. Real-time audit trails, encrypted communication, and NPC-verified data protocols ensure zero reputational risk.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {['ISO 27001', 'NPC REGISTERED', 'BSP COMPLIANT', 'TLS 1.3 ENCRYPTED'].map((tag, i) => (
                      <span key={i} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-blue-400 tracking-widest">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {[
                    { l: 'Data Encryption', v: 100 },
                    { l: 'Subject Privacy', v: 100 },
                    { l: 'Regulatory Alignment', v: 100 }
                  ].map((item, i) => (
                    <div key={i} className="p-8 bg-slate-950/50 rounded-[3rem] border border-white/5 flex items-center justify-between group hover:border-blue-500/50 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:animate-ping"></div>
                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{item.l}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-emerald-500">SECURE</span>
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Contact */}
      {sections.contact.enabled && (
        <section id="contact" className="py-32 px-6 text-left">
          <div className="max-w-7xl mx-auto">
            <div className="bg-blue-600 rounded-[5rem] p-10 md:p-20 text-white relative overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 text-left">
                <div className="space-y-10 text-left">
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">{sections.contact.title}</h2>
                  <p className="text-blue-100 text-lg md:text-xl font-medium max-w-md leading-relaxed opacity-90">
                    Propel your portfolio back into liquidity. Join the Philippines' premier recovery network.
                  </p>
                  <button onClick={onEnterSystem} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white hover:text-blue-200 transition-colors">
                    <Lock size={16} className="text-blue-300" /> Operational Portal <ArrowRight size={14} />
                  </button>
                </div>
                <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 border border-white/10 shadow-2xl text-left">
                  {isSent ? (
                    <div className="py-20 text-center space-y-6">
                      <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/40"><ShieldCheck size={40} className="text-white" /></div>
                      <h3 className="text-2xl font-black text-white">Inquiry Transmitted</h3>
                    </div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
                      <input title="Name" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-blue-200/30" placeholder="Full Name" required />
                      <input type="email" title="Email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-blue-200/30" placeholder="Corporate Email" required />
                      <button type="submit" className="w-full py-5 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-[0.3em]">{isSubmitting ? 'Indexing...' : sections.contact.primaryCta || 'Submit inquiry'}</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Custom Dynamic Sections */}
      {sections.customSections?.map((section) => section.enabled && (
        <section
          key={section.id}
          className={`py-32 px-6 text-left ${section.theme === 'dark' ? 'bg-slate-950 text-white' :
            section.theme === 'glass' ? 'bg-slate-50/50 backdrop-blur-3xl' : 'bg-white'
            }`}
        >
          <div className="max-w-7xl mx-auto">
            <div className={`flex flex-col gap-20 items-center ${section.imagePosition === 'right' ? 'lg:flex-row' :
              section.imagePosition === 'left' ? 'lg:flex-row-reverse' : 'flex-col'
              }`}>
              <div className={`w-full ${section.imagePosition === 'full' ? 'text-center' : 'lg:w-1/2'} space-y-10 text-left`}>
                {section.subtitle && (
                  <h3 className={`font-black text-[12px] uppercase tracking-[0.4em] ${section.theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    {section.subtitle}
                  </h3>
                )}
                <h2 className={`text-5xl md:text-6xl font-black tracking-tight leading-none ${section.theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                  {section.title}
                </h2>
                <div className={`text-xl font-medium leading-relaxed ${section.theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {section.content}
                </div>
                {section.ctaLabel && (
                  <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-950 transition-all flex items-center gap-3">
                    {section.ctaLabel} <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {section.image && (
                <div className={`w-full ${section.imagePosition === 'full' ? 'max-w-4xl' : 'lg:w-1/2'}`}>
                  <div className={`relative rounded-[4rem] overflow-hidden border ${section.theme === 'dark' ? 'border-white/10' : 'border-slate-200'} shadow-2xl`}>
                    <img src={section.image} className="w-full h-full object-cover" alt={section.title} />
                    {section.theme === 'dark' && <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* Footer Branding */}
      <footer className="py-20 bg-white border-t border-slate-100 text-left">
        <div className="max-w-7xl mx-auto px-6 text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 text-left leading-none">
            <div className="flex items-center gap-4 text-left">
              <PCCSLogo size={64} src={branding.logoImage} />
              <div className="text-left">
                <p className="text-2xl font-black uppercase text-slate-950 tracking-tighter leading-none">{branding.logoText}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-2 leading-none">{branding.companyName}</p>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-40">© 2024 PCCS Philippines. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .animate-spin-slow { animation: spin 20s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .bg-performance-grid {
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(1.4); opacity: 1; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;