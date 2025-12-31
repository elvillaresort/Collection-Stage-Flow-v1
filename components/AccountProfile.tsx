
import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Shield,
  Key,
  History,
  Save,
  Camera,
  LogOut,
  Smartphone,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Terminal,
  Activity
} from 'lucide-react';
import { User } from '../types';

interface AccountProfileProps {
  user: User;
  onLogout: () => void;
}

const AccountProfile: React.FC<AccountProfileProps> = ({ user, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    employeeId: user.employeeId
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      // In a real app, we'd call an update function here
    }, 1000);
  };

  const loginSessions = [
    { id: 1, device: 'Chrome on macOS', location: 'Manila, PH', time: 'Active Now', status: 'current' },
    { id: 2, device: 'Safari on iPhone 15', location: 'Quezon City, PH', time: '3 hours ago', status: 'past' },
    { id: 3, device: 'Chrome on Windows', location: 'Makati, PH', time: 'Yesterday, 14:20', status: 'past' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <UserIcon size={32} className="text-blue-600" />
            My Account
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Manage your profile, security settings and active sessions.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-50 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all"
            >
              Update Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {isSaving ? <span className="animate-spin mr-2">●</span> : <Save size={18} />}
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-32 bg-slate-900 relative">
              <div className="absolute -bottom-12 left-10">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[2rem] border-4 border-white bg-slate-100 overflow-hidden shadow-xl">
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-transform">
                    <Camera size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-16 pb-10 px-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                      {user.role.replace('_', ' ')}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-400">Employee ID: {user.employeeId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verified Account</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                    <div className="relative">
                      <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        readOnly={!isEditing}
                        value={formData.name}
                        onChange={(e) => setFormData(Object.assign({}, formData, { name: e.target.value }))}
                        className={"w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all text-sm font-bold " + (isEditing ? 'bg-slate-50 border-blue-200 outline-none focus:ring-4 focus:ring-blue-500/10' : 'bg-transparent border-transparent text-slate-700')}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        readOnly={true}
                        value={user.employeeId.toLowerCase() + "@pccs.ph"}
                        className="w-full pl-12 pr-4 py-3.5 bg-transparent border-transparent rounded-2xl text-sm font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee Reference</label>
                    <div className="relative">
                      <Terminal size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        readOnly={!isEditing}
                        value={formData.employeeId}
                        onChange={(e) => setFormData(Object.assign({}, formData, { employeeId: e.target.value }))}
                        className={"w-full pl-12 pr-4 py-3.5 rounded-2xl border transition-all text-sm font-bold " + (isEditing ? 'bg-slate-50 border-blue-200 outline-none focus:ring-4 focus:ring-blue-500/10' : 'bg-transparent border-transparent text-slate-700')}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        readOnly={true}
                        value="+63 917 123 4567"
                        className="w-full pl-12 pr-4 py-3.5 bg-transparent border-transparent rounded-2xl text-sm font-bold text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity size={14} className="text-blue-600" /> Personal Action Audit
              </h3>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View Full Log</button>
            </div>
            <div className="p-4 space-y-2">
              {[
                { action: 'Updated Portfolio Status', target: 'L-9081 (John Doe)', time: '10:45 AM', outcome: 'Success' },
                { action: 'Generated Legal Notice', target: 'Global Tech Corp', time: 'Yesterday, 16:20', outcome: 'Sent' },
                { action: 'Modified System Setting', target: 'DNA Optimization', time: 'Nov 12, 09:15', outcome: 'Authorized' }
              ].map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{log.action}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{log.target}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-900">{log.time}</p>
                    <p className="text-[9px] font-black text-emerald-500 uppercase">{log.outcome}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">Security Center</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enhanced Protection</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">Two-Factor Auth</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Enabled via App</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">Last Password Change</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">32 days ago</p>
                </div>
                <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline">Change</button>
              </div>
              <button className="w-full mt-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Key size={14} className="text-blue-400" /> Reset Auth Token
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <History size={14} className="text-blue-600" /> Active Sessions
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {loginSessions.map(session => (
                <div key={session.id} className="flex gap-4">
                  <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " + (session.status === 'current' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400')}>
                    <Smartphone size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{session.device}</p>
                    <p className="text-[10px] font-medium text-slate-500">{session.location} • {session.time}</p>
                  </div>
                  {session.status === 'past' && (
                    <button className="text-[9px] font-black text-rose-500 uppercase tracking-widest self-center opacity-0 hover:opacity-100">Terminate</button>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                Terminate All Other Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;
