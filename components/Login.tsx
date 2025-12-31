
import React, { useState } from 'react';
import { Shield, Lock, User as UserIcon, CheckCircle, ArrowRight, Smartphone, Bot, AlertCircle, Mail, MessageSquare, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { User, UserRole } from '../types';
import PCCSLogo from './PCCSLogo';

interface LoginProps {
  systemUsers: User[];
  onLogin: (user: User) => void;
  onRecoveryRequest: (details: { name: string, email: string, issue: string }) => void;
  onBackToLanding?: () => void;
  onSeedUsers?: () => void;
}

import { supabaseService } from '../services/supabaseService';

const Login: React.FC<LoginProps> = ({ systemUsers, onLogin, onRecoveryRequest, onBackToLanding, onSeedUsers }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  // Recovery form state
  const [recoveryData, setRecoveryData] = useState({ name: '', email: '', issue: 'forgot_password' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Use Supabase Auth with demo fallback
    try {
      const cleanEmail = email.trim().toLowerCase();

      // DEVELOPMENT BYPASS: Allow local login if Supabase isn't reachable or for specific demo account
      if ((cleanEmail === 'admin' || cleanEmail === 'admin@pccs.ph') && password === 'superadmin') {
        const demoUser: User = {
          id: 'admin-1',
          name: 'System Superadmin',
          employeeId: 'superadmin',
          role: 'ADMIN',
          avatar: 'https://picsum.photos/seed/superadmin/100/100',
          isActive: true,
          status: 'online'
        };
        onLogin(demoUser);
        setIsLoading(false);
        return;
      }

      // If it's not the bypass, we try Supabase
      const { user, error } = await supabaseService.login(cleanEmail, password);

      if (error) {
        setError(typeof error === 'string' ? error : error.message || 'Authentication Failed');
      } else if (user) {
        onLogin(user);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('System connection error. Use admin/superadmin to bypass.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      onRecoveryRequest({
        name: recoveryData.name,
        email: recoveryData.email,
        issue: recoveryData.issue === 'forgot_id' ? 'Forgotten Employee ID' : 'Forgotten Password'
      });
      setIsLoading(false);
      setRecoverySent(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-inter text-white">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>

      {/* Floating External Link */}
      {onBackToLanding && (
        <div className="absolute top-10 left-10 z-[100] animate-in slide-in-from-left-8 duration-1000">
          <button
            onClick={onBackToLanding}
            className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center gap-3 text-blue-400 hover:bg-white/20 hover:text-white transition-all shadow-2xl group active:scale-95"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Panliliocollections.com</span>
          </button>
        </div>
      )}

      <div className="w-full max-w-[800px] flex bg-slate-900/50 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-700">

        {/* LEFT: Branding Side */}
        <div className="hidden lg:flex flex-col justify-between w-[280px] p-8 bg-white relative overflow-hidden border-r border-slate-100 text-slate-900">
          <div className="absolute inset-0 opacity-5">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 0 L100 100 M100 0 L0 100" stroke="#701d63" strokeWidth="0.5" fill="none" />
            </svg>
          </div>

          <div className="relative z-10">
            <PCCSLogo size={40} className="mb-4" />
            <h1 className="text-xl font-black text-slate-900 mt-2 tracking-tighter leading-none">PCCS Collection Stage Flow</h1>
            <p className="text-slate-500 mt-2 text-[11px] font-medium leading-relaxed">The unified platform for intelligent, multi-role debt recovery operations.</p>
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2.5 text-slate-600">
              <CheckCircle size={16} className="text-blue-600" />
              <span className="text-[11px] font-bold">Encrypted Audit Logs</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <CheckCircle size={16} className="text-blue-600" />
              <span className="text-[11px] font-bold">Real-time Field Tracking</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <CheckCircle size={16} className="text-blue-600" />
              <span className="text-[11px] font-bold">AI Strategy Optimization</span>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-100 flex flex-col gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Status: Online</p>
          </div>
        </div>

        {/* RIGHT: Form Side */}
        <div className="flex-1 p-8 lg:p-10 relative">
          {!isRecoveryMode ? (
            <div className="max-w-sm mx-auto animate-in fade-in slide-in-from-right-4 duration-500 text-left">
              <h2 className="text-lg font-black text-white tracking-tight">Access Control</h2>
              <p className="text-slate-400 mt-1 text-[13px] font-medium">Please enter your system-provided credentials.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold animate-in shake duration-300">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="relative group">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder="Email or ID"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-[13px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-500"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      autoComplete="current-password"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold text-[13px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsRecoveryMode(true)}
                    className="text-xs font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                  >
                    Forgot Credentials?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[13px] shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Initialize Session
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="text-center pt-1 space-y-2">
                  <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Unauthorized Access is Prohibited</p>
                  <button
                    type="button"
                    onClick={() => { setEmail('admin'); setPassword('superadmin'); }}
                    className="block mx-auto text-[8px] font-black text-rose-500/50 hover:text-rose-500 uppercase tracking-[0.2em] transition-all"
                  >
                    Load Demo Credentials
                  </button>
                </div>
              </form>

              {/* Quick Login Section */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Quick Login</h3>
                  {onSeedUsers && (
                    <button
                      onClick={onSeedUsers}
                      className="text-[9px] font-black text-blue-400 border border-blue-400/30 px-2 py-1 rounded hover:bg-blue-400/10 uppercase tracking-wider transition-all"
                    >
                      + Seed Users
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {systemUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => onLogin(u)}
                      className="w-full flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/5 transition-all group text-left"
                    >
                      <img src={u.avatar} alt="" className="w-6 h-6 rounded-md object-cover border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white truncate group-hover:text-blue-300 transition-colors">{u.name}</p>
                        <p className="text-[8px] text-slate-500 uppercase tracking-wider truncate">{u.role} • {u.employeeId}</p>
                      </div>
                      <ArrowRight size={10} className="text-slate-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                  {systemUsers.length === 0 && (
                    <p className="text-[10px] text-slate-600 italic text-center py-2">No active users found.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto animate-in fade-in slide-in-from-left-4 duration-500 text-left">
              <button
                onClick={() => { setIsRecoveryMode(false); setRecoverySent(false); }}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
              >
                <ChevronLeft size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Back to Login</span>
              </button>

              {!recoverySent ? (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight">Recovery Cluster</h2>
                      <p className="text-slate-400 font-medium">Verify identity for credential reset.</p>
                    </div>
                  </div>

                  <form onSubmit={handleRecoverySubmit} className="mt-10 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Registered Name</label>
                        <div className="relative group">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                          <input
                            type="text"
                            required
                            value={recoveryData.name}
                            onChange={(e) => setRecoveryData(Object.assign({}, recoveryData, { name: e.target.value }))}
                            placeholder="e.g. Johnathan Doe"
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                          <input
                            type="email"
                            required
                            value={recoveryData.email}
                            onChange={(e) => setRecoveryData(Object.assign({}, recoveryData, { email: e.target.value }))}
                            placeholder="user@pccs.ph"
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Issue</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setRecoveryData(Object.assign({}, recoveryData, { issue: 'forgot_password' }))}
                            className={`p-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${recoveryData.issue === 'forgot_password' ? 'border-blue-600 bg-blue-600/10 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}
                          >
                            Forgot Password
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecoveryData(Object.assign({}, recoveryData, { issue: 'forgot_id' }))}
                            className={`p-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${recoveryData.issue === 'forgot_id' ? 'border-blue-600 bg-blue-600/10 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}
                          >
                            Forgot ID
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Request Admin Review <Sparkles size={18} className="text-blue-600" /></>}
                    </button>

                    <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-slate-400 font-bold leading-relaxed italic text-center">
                        Requests are routed to the Recovery Admin Node. You will be contacted via internal comms or phone for verification.
                      </p>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 border border-emerald-500/30">
                    <CheckCircle size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Request Dispatched</h3>
                    <p className="text-slate-400 mt-2 font-medium">Your recovery ticket has been routed to the Administrative Cluster.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-left space-y-3">
                    <div className="flex justify-between items-center"><span className="text-[9px] font-black text-slate-500 uppercase">Ticket ID</span><span className="text-xs font-black text-white font-mono uppercase">REC-{(Math.random() * 10000).toFixed(0)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[9px] font-black text-slate-500 uppercase">Routing</span><span className="text-xs font-black text-blue-400 uppercase">Admin HQ Node</span></div>
                    <div className="flex justify-between items-center"><span className="text-[9px] font-black text-slate-500 uppercase">Priority</span><span className="text-xs font-black text-emerald-500 uppercase">Urgent (4h)</span></div>
                  </div>
                  <button
                    onClick={() => { setIsRecoveryMode(false); setRecoverySent(false); }}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Close & Go Back
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
