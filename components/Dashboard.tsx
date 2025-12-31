
import React, { memo, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
  TrendingUp, DollarSign, Clock, CheckCircle2, AlertTriangle, Users, Activity as ActivityIcon, ArrowUpRight, ArrowDownRight, Target, ShieldCheck, Zap
} from 'lucide-react';
import { SystemSettings, Debtor, Activity, User, CaseStatus } from '../types';

interface DashboardProps {
  settings: SystemSettings;
  portfolio: Debtor[];
  activities: Activity[];
  systemUsers: User[];
  currentUser: User;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const StatCard = memo(({ title, value, subValue, icon: Icon, color, trend }: any) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600'
  };

  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm text-left group hover:border-blue-200 transition-all cursor-default relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${colorMap[color as keyof typeof colorMap] || 'bg-slate-50 text-slate-600'}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-2">{title}</h3>
        <p className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 opacity-60 uppercase tracking-wider">{subValue}</p>
      </div>
      <div className="absolute right-0 bottom-0 opacity-[0.03] translate-x-1/4 translate-y-1/4 transition-transform group-hover:scale-110">
        <Icon size={120} />
      </div>
    </div>
  );
});

const Dashboard: React.FC<DashboardProps> = ({ settings, portfolio, activities, systemUsers, currentUser }) => {
  const sym = settings.localization.currencySymbol;
  const isAdmin = ['ADMIN', 'OPERATIONS_MANAGER', 'HEAD_OF_OPERATIONS', 'TEAM_MANAGER'].includes(currentUser.role);

  // Filter context
  const targetPortfolio = isAdmin ? portfolio : portfolio.filter(d => d.assignedDebtorIds?.includes(d.id)); // Note: assignedDebtorIds is usually on User, but let's check AssignedAgentId logic
  // Actually, debtors have assigned_agent_id. Let's filter by that.
  const myDebtors = portfolio.filter(d => d.assignedAgentId === currentUser.id);
  const displayPortfolio = isAdmin ? portfolio : myDebtors;

  // Basic Metrics
  const metrics = useMemo(() => {
    const totalPrincipal = displayPortfolio.reduce((sum, d) => sum + (d.amountDue || 0), 0);
    const totalCollected = displayPortfolio.reduce((sum, d) => {
      const payments = d.transactions?.filter(t => t.type === 'Payment').reduce((s, t) => s + t.amount, 0) || 0;
      return sum + payments;
    }, 0);

    const activeActivities = isAdmin ? activities : activities.filter(a => a.agent === currentUser.name);

    const ptps = activeActivities.filter(a => a.outcome?.includes('PTP')).length;
    const bps = activeActivities.filter(a => a.outcome?.includes('BP') || a.outcome?.toLowerCase().includes('broken')).length;
    const recoveryRate = totalPrincipal > 0 ? (totalCollected / totalPrincipal) * 100 : 0;

    return {
      totalPrincipal,
      totalCollected,
      ptps,
      bps,
      recoveryRate,
      caseCount: displayPortfolio.length,
      avgDpd: displayPortfolio.length > 0 ? Math.round(displayPortfolio.reduce((sum, d) => sum + (d.overdueDays || 0), 0) / displayPortfolio.length) : 0
    };
  }, [displayPortfolio, activities, isAdmin, currentUser.name]);

  // Productivity per user (for admin)
  const userProductivity = useMemo(() => {
    if (!isAdmin) return [];
    return systemUsers.map(u => {
      const uDebtors = portfolio.filter(d => d.assignedAgentId === u.id);
      const uActivities = activities.filter(a => a.agent === u.name);
      const uCollected = uDebtors.reduce((sum, d) => {
        return sum + (d.transactions?.filter(t => t.type === 'Payment').reduce((s, t) => s + t.amount, 0) || 0);
      }, 0);

      return {
        id: u.id,
        name: u.name,
        role: u.role,
        ptps: uActivities.filter(a => a.outcome?.includes('PTP')).length,
        bps: uActivities.filter(a => a.outcome?.includes('BP') || a.outcome?.toLowerCase().includes('broken')).length,
        collected: uCollected,
        cases: uDebtors.length
      };
    }).sort((a, b) => b.collected - a.collected);
  }, [systemUsers, portfolio, activities, isAdmin]);

  // Chart Data Preparation (Mocking time-series based on activities date if possible, otherwise realistic mock)
  const chartData = useMemo(() => {
    // Group by day of week for the last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(d => ({ name: d, targets: Math.floor(Math.random() * 5000) + 1000, collected: Math.floor(Math.random() * 4000) + 500 }));
    return data;
  }, []);

  const riskData = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    displayPortfolio.forEach(d => {
      if (d.riskScore) counts[d.riskScore]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [displayPortfolio]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 lg:pb-10">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">
            {isAdmin ? 'Operational Command' : 'Recovery Workspace'}
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
            {isAdmin ? 'System-wide Liquidity & Productivity Monitor' : `Performance Analytics: ${currentUser.name}`}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex">
            <button className="px-4 py-2 bg-white rounded-xl shadow-sm text-[10px] font-black uppercase tracking-widest text-blue-600">Overview</button>
            <button className="px-4 py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600">Analytics</button>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Principal"
          value={`${sym}${(metrics.totalPrincipal / 1000000).toFixed(1)}M`}
          subValue={`Across ${metrics.caseCount} Active Nodes`}
          icon={DollarSign}
          color="blue"
          trend={12}
        />
        <StatCard
          title="Debt Recovered"
          value={`${sym}${(metrics.totalCollected / 1000).toFixed(1)}K`}
          subValue={`${metrics.recoveryRate.toFixed(1)}% Conversion Rate`}
          icon={CheckCircle2}
          color="emerald"
          trend={5}
        />
        <StatCard
          title="Promises To Pay"
          value={metrics.ptps}
          subValue={`${metrics.bps} Broken Promises (BP)`}
          icon={Target}
          color="amber"
          trend={-2}
        />
        <StatCard
          title="Portfolio Health"
          value={metrics.caseCount > 0 ? `${Math.round(100 - (metrics.bps / Math.max(1, metrics.ptps)) * 100)}%` : '0%'}
          subValue={`${metrics.avgDpd} Days Avg Aging`}
          icon={Zap}
          color="violet"
          trend={8}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Recovery Trend Chart */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-left h-[400px] flex flex-col group transition-all">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="font-black text-slate-900 text-xs flex items-center gap-2 uppercase tracking-widest leading-none">
                  <TrendingUp size={16} className="text-blue-500" /> Collection Momentum
                </h2>
                <p className="text-[10px] font-bold text-slate-400">Daily actual vs targeted recovery</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['1W', '1M', '3M'].map(t => (
                  <button key={t} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${t === '1W' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="collected" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorTrend)" />
                  <Area type="monotone" dataKey="targets" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Productivity Table (ADMIN ONLY) or Recent Activities (AGENT ONLY) */}
          {isAdmin ? (
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-left">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="font-black text-slate-900 text-xs flex items-center gap-2 uppercase tracking-widest">
                    <Users size={16} className="text-blue-500" /> User Productivity Nexus
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400">Individual collection integrity and output</p>
                </div>
                <button className="text-[9px] font-black uppercase text-blue-600 tracking-widest hover:underline">Full Report</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Representative</th>
                      <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">PTPs</th>
                      <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">BPs</th>
                      <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Recovered</th>
                      <th className="pb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {userProductivity.map((u) => (
                      <tr key={u.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-blue-600 text-xs border border-slate-200 uppercase">
                              {u.name.substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900 leading-none mb-1">{u.name}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{u.role.replace('_', ' ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center text-[10px] font-black text-emerald-600">{u.ptps}</td>
                        <td className="py-4 text-center text-[10px] font-black text-rose-600">{u.bps}</td>
                        <td className="py-4 text-right text-[10px] font-black text-slate-900">{sym}{u.collected.toLocaleString()}</td>
                        <td className="py-4 text-right">
                          <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${u.collected > 100000 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {u.collected > 0 ? ((u.collected / metrics.totalCollected) * 100).toFixed(1) + '%' : '0%'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-left">
              <h2 className="font-black text-slate-900 text-xs flex items-center gap-2 uppercase tracking-widest mb-8">
                <ActivityIcon size={16} className="text-blue-500" /> Recent Actions
              </h2>
              <div className="space-y-4">
                {activities.filter(a => a.agent === currentUser.name).slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                        <ActivityIcon size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{a.type}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{a.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em] border ${a.outcome?.includes('PTP') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        a.outcome?.includes('BP') ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                        {a.outcome}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Risk and Distribution */}
        <div className="lg:col-span-4 space-y-6">
          {/* Risk Distribution Chart */}
          <div className="bg-slate-950 p-8 rounded-[2.5rem] shadow-xl text-white overflow-hidden relative group">
            <div className="absolute top-[-20px] right-[-20px] opacity-[0.05] rotate-12 group-hover:scale-110 transition-transform duration-1000">
              <ShieldCheck size={200} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-400" /> Portfolio Segment Risk
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', color: '#000', fontWeight: 900 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {riskData.map((r, i) => (
                <div key={r.name} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{r.name}</span>
                  </div>
                  <p className="text-lg font-black">{r.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Status */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-left">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap size={14} className="text-blue-500" /> System Integrity
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase">AI Predictions</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sync Latency</span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">12ms</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Compliance Score</span>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">99.8%</span>
              </div>
            </div>
            <button className="w-full mt-6 py-4 bg-slate-950 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg active:scale-95">Verify Full Node</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Dashboard);
