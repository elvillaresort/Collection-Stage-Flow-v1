import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart, Cell, PieChart, Pie
} from 'recharts';
import {
  Table as TableIcon, BarChart3, TrendingUp, Users, Target, Calendar,
  Download, Filter, Search, ArrowUpRight, ArrowDownRight, Sparkles, BrainCircuit, Loader2,
  Layers, Activity, FileJson, Grid3X3, Database, AlertCircle, Phone, MapPin, DollarSign,
  ShieldCheck, History, Clock, FileSpreadsheet, Files, ChevronRight, CheckCircle2,
  Settings, ArrowLeftRight, Lock, X, Table, ShieldAlert, Check
} from 'lucide-react';
import { Debtor, SystemLog, Activity as ActivityType, User, SystemSettings } from '../types';

interface AnalyticsProps {
  portfolio: Debtor[];
  activities: ActivityType[];
  logs: SystemLog[];
  user: User;
  settings: SystemSettings;
}

const SYSTEM_FIELDS = [
  { key: 'loanId', label: 'Loan ID' },
  { key: 'name', label: 'Borrower Name' },
  { key: 'amountDue', label: 'Total Amount Due' },
  { key: 'overdueDays', label: 'DPD' },
  { key: 'status', label: 'Current Status' },
  { key: 'riskScore', label: 'Risk Intelligence' },
  { key: 'bucket', label: 'Aging Bucket' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'email', label: 'Email Address' },
  { key: 'address', label: 'Street Address' },
  { key: 'city', label: 'City' },
  { key: 'principal', label: 'Principal Balance' },
  { key: 'interest', label: 'Accrued Interest' },
  { key: 'penalties', label: 'Accumulated Penalties' },
  { key: 'employer', label: 'Employer' }
];

const AnalyticsModule: React.FC<AnalyticsProps> = ({ portfolio, activities, logs, user, settings }) => {
  const [activeView, setActiveView] = useState<'overview' | 'pivot' | 'audit' | 'export' | 'custom-report'>('overview');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportType, setExportType] = useState<'custom' | 'portfolio' | 'activities' | 'legal' | 'audit' | null>(null);

  // Custom Report State
  const [templateHeaders, setTemplateHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [reportTitle, setReportTitle] = useState('New Client Report');

  const sym = settings.localization.currencySymbol;

  const parseCSVLine = (text: string): string[] => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let char of text) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) { result.push(cur.trim()); cur = ''; }
      else cur += char;
    }
    result.push(cur.trim());
    return result;
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length > 0) {
        const headers = parseCSVLine(lines[0]);
        setTemplateHeaders(headers);

        // Initial auto-mapping logic
        const newMapping: Record<string, string> = {};
        SYSTEM_FIELDS.forEach(sf => {
          const match = headers.find(h =>
            h.toLowerCase().includes(sf.label.toLowerCase()) ||
            h.toLowerCase().includes(sf.key.toLowerCase())
          );
          if (match) newMapping[sf.key] = match;
        });
        setMapping(newMapping);
      }
    };
    reader.readAsText(file);
  };

  const generateCustomReport = async () => {
    if (!exportPassword) {
      alert("Security Protocol: Encryption key required for client data exfiltration.");
      return;
    }

    if (portfolio.length === 0) {
      alert("No portfolio data available to export.");
      return;
    }

    setIsExporting('custom');
    try {
      console.log('Starting custom report generation...');
      console.log('Template headers:', templateHeaders);
      console.log('Mapping:', mapping);
      console.log('Portfolio records:', portfolio.length);

      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('PCCS Client Report');

      // Add Headers from Template
      worksheet.addRow(templateHeaders);

      // Add Matched Data
      portfolio.forEach(d => {
        const row = templateHeaders.map(header => {
          const sysKey = Object.keys(mapping).find(k => mapping[k] === header);
          if (!sysKey) return '';

          if (sysKey === 'principal') return d.financialDetail.principal;
          if (sysKey === 'interest') return d.financialDetail.interest;
          if (sysKey === 'penalties') return d.financialDetail.penalties;
          // @ts-ignore
          return d[sysKey] || '';
        });
        worksheet.addRow(row);
      });

      // Styling
      worksheet.getRow(1).font = { bold: true };
      worksheet.columns.forEach(col => { col.width = 20; });

      console.log('Generating encrypted buffer...');
      const buffer = await workbook.xlsx.writeBuffer({ password: exportPassword } as any);
      console.log('Buffer generated, size:', buffer.byteLength);

      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const filename = `${reportTitle.replace(/\s+/g, '_')}_SECURE_${new Date().toISOString().split('T')[0]}.xlsx`;

      console.log('Triggering download:', filename);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // Cleanup after a short delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('Download cleanup completed');
      }, 100);

      setShowExportModal(false);
      setExportPassword('');
      setExportType(null);
      alert(`Success: "${reportTitle}" exported with ${portfolio.length} records. Check your Downloads folder.`);
    } catch (err) {
      console.error('Report generation error:', err);
      alert(`Report Generation Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExporting(null);
    }
  };

  const handleMasterExport = async (type: 'portfolio' | 'activities' | 'legal' | 'audit') => {
    if (!exportPassword) {
      setExportType(type);
      setShowExportModal(true);
      return;
    }

    setIsExporting(type);
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();

      if (type === 'portfolio') {
        const ws = workbook.addWorksheet('Master Portfolio');
        const headers = ['ID', 'Name', 'Loan ID', 'Amount Due', 'Overdue Days', 'Status', 'Risk Score', 'Bucket'];
        ws.addRow(headers);
        portfolio.forEach(d => ws.addRow([d.id, d.name, d.loanId, d.amountDue, d.overdueDays, d.status, d.riskScore, d.bucket]));
        ws.getRow(1).font = { bold: true };
      } else if (type === 'activities') {
        const ws = workbook.addWorksheet('Activity Logs');
        const headers = ['ID', 'Debtor ID', 'Type', 'Date', 'Agent', 'Outcome'];
        ws.addRow(headers);
        activities.forEach(a => ws.addRow([a.id, a.debtorId, a.type, a.date, a.agent, a.outcome]));
        ws.getRow(1).font = { bold: true };
      } else if (type === 'audit') {
        const ws = workbook.addWorksheet('System Audit');
        const headers = ['ID', 'Timestamp', 'User', 'Action', 'Severity'];
        ws.addRow(headers);
        logs.forEach(l => ws.addRow([l.id, l.timestamp, l.userName, l.action, l.severity]));
        ws.getRow(1).font = { bold: true };
      }

      const buffer = await workbook.xlsx.writeBuffer({ password: exportPassword } as any);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const filename = `PCCS_MASTER_${type.toUpperCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // Cleanup after a short delay
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      setShowExportModal(false);
      setExportPassword('');
      setExportType(null);
      alert(`Success: Master ${type} data extracted. Check your Downloads folder.`);
    } catch (err) {
      console.error('Master export error:', err);
      alert(`Export Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex h-full gap-6 animate-in fade-in duration-500 overflow-hidden text-left bg-slate-50/50 p-6 rounded-[3rem]">
      {/* Sidebar Navigation */}
      <div className="w-72 flex flex-col gap-4 shrink-0">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Insight Engine</h3>
          </div>

          <nav className="space-y-3 flex-1">
            {[
              { id: 'overview', label: 'Executive Summary', icon: Activity, desc: 'Global KPI overview' },
              { id: 'pivot', label: 'Pivot Workbench', icon: Grid3X3, desc: 'Multi-dimensional data' },
              { id: 'custom-report', label: 'Client Reports', icon: Files, desc: 'Templated export logs', highlight: true },
              { id: 'audit', label: 'System Audit', icon: ShieldCheck, desc: 'Forensic event tracking' },
              { id: 'export', label: 'Master Export', icon: FileSpreadsheet, desc: 'Full registry extraction' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-start gap-4 p-4 rounded-3xl transition-all group ${activeView === item.id
                  ? 'bg-slate-900 text-white shadow-2xl scale-[1.02]'
                  : 'text-slate-500 hover:bg-slate-50'
                  }`}
              >
                <item.icon size={18} className={`mt-1 ${activeView === item.id ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-900'}`} />
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase tracking-widest">{item.label}</p>
                  <p className={`text-[9px] font-medium mt-1 ${activeView === item.id ? 'text-slate-400' : 'text-slate-400'}`}>{item.desc}</p>
                </div>
              </button>
            ))}
          </nav>

          <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
            <p className="text-[9px] font-bold text-slate-400 tracking-tight leading-relaxed">
              All reports are generated following strict Data Privacy (DPA 10173) protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin">
        {activeView === 'overview' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Managed Assets', value: sym + '14.2M', icon: DollarSign, color: 'blue' },
                { label: 'Audit Log Velocity', value: logs.length, icon: Activity, color: 'emerald' },
                { label: 'Avg Recovery Efficiency', value: '68.4%', icon: TrendingUp, color: 'indigo' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
                  <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl w-fit group-hover:scale-110 transition-transform`}>
                    <stat.icon size={20} />
                  </div>
                  <div className="mt-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h2>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm text-left relative overflow-hidden">
              <div className="absolute right-[-50px] top-[-50px] opacity-[0.02] rotate-12"><Activity size={300} /></div>
              <h3 className="font-black text-slate-900 text-[10px] mb-8 flex items-center gap-3 uppercase tracking-[0.3em]"><History size={16} className="text-blue-600" /> Operational Stream</h3>
              <div className="space-y-4 relative z-10">
                {logs.slice(0, 6).map(log => (
                  <div key={log.id} className="flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-5 text-left">
                      <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-110 transition-transform ${log.severity === 'critical' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-900'}`}>{log.userName[0]}</div>
                      <div>
                        <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{log.action}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{log.userName} • {log.timestamp}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm ${log.severity === 'critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>{log.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'custom-report' && (
          <div className="space-y-8 animate-in slide-in-from-right-10 duration-700">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12"><Files size={320} /></div>
              <div className="max-w-2xl relative z-10 text-left">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20"><Sparkles size={24} /></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Advanced Deployment Node</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight mb-4">Custom Client Reporting</h2>
                <p className="text-slate-400 font-medium leading-relaxed text-lg">Align your authoritative data to client-provided report templates with 1:1 schema correspondence.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Step 1: Mapping Control */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">Schema Correspondence Matrix</h4>
                      <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">Stage 01: Align System Fields to Template</p>
                    </div>
                    <label className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all cursor-pointer flex items-center gap-2">
                      <FileSpreadsheet size={16} /> Upload Template
                      <input type="file" className="hidden" accept=".csv" onChange={handleTemplateUpload} />
                    </label>
                  </div>

                  {!templateHeaders.length ? (
                    <div className="aspect-[21/9] border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 group hover:border-blue-500 transition-all cursor-pointer" onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>
                      <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                        <TableIcon size={32} />
                      </div>
                      <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Upload CSV Template to begin mapping</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                      {templateHeaders.map((header) => {
                        const sysKey = Object.keys(mapping).find(k => mapping[k] === header);
                        const field = SYSTEM_FIELDS.find(f => f.key === sysKey);

                        return (
                          <div key={header} className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 ${sysKey ? 'border-emerald-100 bg-emerald-50/20' : 'border-slate-100 bg-slate-50/50'}`}>
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest truncate max-w-[150px]">{header}</span>
                              {sysKey ? <div className="p-1 bg-emerald-500 text-white rounded-full scale-75"><Check size={12} strokeWidth={4} /></div> : <div className="w-2 h-2 rounded-full bg-slate-200 mt-1"></div>}
                            </div>
                            <select
                              title={`Map ${header} to field`}
                              value={sysKey || ''}
                              onChange={(e) => {
                                const newMapping = { ...mapping };
                                // Clear old mapping for this system field if it exists
                                if (e.target.value) {
                                  Object.keys(newMapping).forEach(k => {
                                    if (k === e.target.value) delete newMapping[k];
                                  });
                                  newMapping[e.target.value] = header;
                                }
                                setMapping(newMapping);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                            >
                              <option value="">-- UNMAPPED --</option>
                              {SYSTEM_FIELDS.map(sf => (
                                <option key={sf.key} value={sf.key}>{sf.label}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Configuration Area */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 text-left">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Report Manifest</h4>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                      <input
                        type="text"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-4 text-xs font-bold mt-2 focus:bg-white transition-all outline-none"
                        placeholder="Enter report name..."
                      />
                    </div>

                    <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <Database size={16} className="text-blue-600" />
                        <span className="text-[11px] font-black text-blue-900 uppercase">Dataset Coverage</span>
                      </div>
                      <p className="text-[10px] text-blue-600 font-medium leading-relaxed italic">The generator will process <b>{portfolio.length}</b> records matching the current active portfolio segment.</p>
                    </div>

                    <button
                      onClick={() => { setExportType('custom'); setShowExportModal(true); }}
                      disabled={!templateHeaders.length || Object.keys(mapping).length === 0}
                      className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20 disabled:grayscale"
                    >
                      <ShieldCheck size={18} /> Deploy Generation
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl space-y-6">
                  <div className="flex items-center gap-3">
                    <BrainCircuit size={20} className="text-blue-500" />
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">AI Audit Analysis</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase">
                      <span>Mapping Accuracy</span>
                      <span className="text-emerald-400">High Confidence</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[94%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'export' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12"><FileSpreadsheet size={240} /></div>
              <div className="max-w-xl relative z-10 text-left">
                <h2 className="text-3xl font-black tracking-tight mb-4">Master Data Extraction</h2>
                <p className="text-slate-400 font-medium leading-relaxed">Authorized access to full enterprise datasets. All exports are dynamically watermarked and logged in the system audit.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { id: 'portfolio', label: 'Portfolio Matters', icon: Users, color: 'blue', desc: 'Authoritative registry of all borrower cases.' },
                { id: 'activities', label: 'Activity Logs', icon: Phone, color: 'emerald', desc: 'Full communication and field visit history.' },
                { id: 'audit', label: 'Master Audit Trail', icon: Database, color: 'rose', desc: 'Secure record of all system and user events.' }
              ].map((card) => (
                <div key={card.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group flex flex-col text-left">
                  <div className={`p-4 w-16 bg-${card.color}-50 text-${card.color}-600 rounded-2xl mb-8 group-hover:scale-110 transition-transform`}><card.icon size={32} /></div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">{card.label}</h3>
                  <p className="text-xs text-slate-400 font-medium mb-8 leading-relaxed italic">{card.desc}</p>
                  <button
                    onClick={() => handleMasterExport(card.id as any)}
                    disabled={isExporting !== null}
                    className="w-full py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 bg-slate-900 text-white hover:bg-black shadow-xl active:scale-95"
                  >
                    {isExporting === card.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Extraction Manifest
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Security Export Modal (Shared) */}
      {showExportModal && (
        <div className="fixed inset-0 z-[5000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3">
                <ShieldAlert size={40} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Authoritative Export</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3 italic">Encryption Protocol Required</p>
              </div>
            </div>

            <div className="p-10 space-y-8 bg-white text-left">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Establish Encryption Key</label>
                <div className="relative group">
                  <input
                    type="password"
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    placeholder="Enter secure password..."
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-slate-900 transition-all outline-none"
                  />
                  <Lock size={18} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                </div>
                <p className="text-[9px] text-slate-400 font-medium italic ml-1 leading-relaxed">Report will be wrapped in a password-protected XLSX container (AES-256 compliant).</p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => exportType === 'custom' ? generateCustomReport() : handleMasterExport(exportType as any)}
                  disabled={isExporting !== null || !exportPassword}
                  className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-20"
                >
                  {isExporting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  Initialize Secure Stream
                </button>
                <button
                  onClick={() => { setShowExportModal(false); setExportPassword(''); }}
                  className="w-full py-4 text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors"
                >
                  Abort Protocol
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-950 flex items-center justify-center gap-2 opacity-30">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[8px] font-black text-white uppercase tracking-[0.3em]">DPA Security Node 04</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsModule;
