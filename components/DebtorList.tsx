
import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { Debtor, CaseStatus, User, SystemSettings } from '../types';
import { 
  Eye, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  ChevronDown,
  CheckSquare,
  Square,
  Lock,
  MinusSquare,
  ShieldAlert,
  Clock,
  History,
  Rocket,
  Calculator,
  Gavel,
  MapPin,
  Fingerprint,
  Scale,
  ShieldCheck
} from 'lucide-react';

interface DebtorListProps {
  debtors: Debtor[];
  onViewDetails: (debtor: Debtor) => void;
  onAnalyze: (debtor: Debtor) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  currentUser: User;
  systemUsers?: User[];
  settings: SystemSettings;
}

const riskPriority: Record<string, number> = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };

const DebtorList: React.FC<DebtorListProps> = ({ debtors, onViewDetails, onAnalyze, onSelectionChange, currentUser, settings }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Debtor, direction: 'asc' | 'desc' | null }>({ key: 'name', direction: 'asc' });
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'All'>('All');
  const [riskFilter, setRiskFilter] = useState<string | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAdmin = currentUser.role === 'ADMIN';
  const sym = settings.localization.currencySymbol;
  
  const handleSort = useCallback((key: keyof Debtor) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key, direction: null };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const renderSortIcon = (key: keyof Debtor) => {
    if (sortConfig.key !== key || sortConfig.direction === null) {
      return <ArrowUpDown size={12} className="text-slate-300 opacity-40 group-hover:opacity-100 transition-opacity ml-1.5 shrink-0" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp size={12} className="text-blue-600 ml-1.5 shrink-0" />;
    }
    return <ArrowDown size={12} className="text-blue-600 ml-1.5 shrink-0" />;
  };

  const processedDebtors = useMemo(() => {
    let list = debtors.slice();
    if (!isAdmin) {
      const assignedIds = currentUser.assignedDebtorIds || [];
      list = list.filter(d => assignedIds.includes(d.id));
    }

    const filtered = list.filter(d => {
      const sMatch = statusFilter === 'All' || d.status === statusFilter;
      const rMatch = riskFilter === 'All' || d.riskScore === riskFilter;
      const qMatch = !searchTerm || (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (d.loanId || '').toLowerCase().includes(searchTerm.toLowerCase());
      return sMatch && rMatch && qMatch;
    });

    if (sortConfig.direction) {
      filtered.sort((a, b) => {
        let vA: any = a[sortConfig.key] ?? '';
        let vB: any = b[sortConfig.key] ?? '';
        
        if (sortConfig.key === 'riskScore') { 
          vA = riskPriority[vA as string] || 0; 
          vB = riskPriority[vB as string] || 0; 
        }

        if (typeof vA === 'string') vA = vA.toLowerCase();
        if (typeof vB === 'string') vB = vB.toLowerCase();

        if (vA < vB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (vA > vB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [debtors, statusFilter, riskFilter, sortConfig, searchTerm, currentUser, isAdmin]);

  useEffect(() => { onSelectionChange?.(selectedIds); }, [selectedIds, onSelectionChange]);

  const toggleSelectAll = () => {
    const visibleIds = processedDebtors.map(d => d.id);
    if (visibleIds.every(id => selectedIds.includes(id))) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const getStatusColor = (s: CaseStatus) => {
    switch(s) {
      case CaseStatus.PENDING: return 'bg-slate-100 text-slate-600 border-slate-200';
      case CaseStatus.PROMISE_TO_PAY: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case CaseStatus.BROKEN_PROMISE: return 'bg-rose-50 text-rose-700 border-rose-100';
      case CaseStatus.LEGAL: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  /**
   * Fixed workflow icons by wrapping them in spans to handle tooltips correctly.
   * Lucide icons do not support the 'title' attribute directly.
   */
  const renderWorkflowIcons = (nodes: Debtor['workflowNodes']) => {
    if (!nodes) return null;
    return (
      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
        {nodes.campaign && <span title={`Campaign: ${nodes.campaign}`}><Rocket size={12} className="text-blue-500" /></span>}
        {nodes.settlement && <span title={`Settlement: ${nodes.settlement}`}><Calculator size={12} className="text-emerald-500" /></span>}
        {nodes.legal && <span title={`Legal: ${nodes.legal}`}><Gavel size={12} className="text-rose-500" /></span>}
        {nodes.field && <span title={`Field: ${nodes.field}`}><MapPin size={12} className="text-amber-500" /></span>}
        {nodes.skiptracing && <span title={`Skip Tracing: ${nodes.skiptracing}`}><Fingerprint size={12} className="text-indigo-500" /></span>}
        {nodes.dispute && <span title={`Dispute: ${nodes.dispute}`}><Scale size={12} className="text-purple-500" /></span>}
        {nodes.qa && <span title={`QA: ${nodes.qa}`}><ShieldCheck size={12} className="text-blue-600" /></span>}
      </div>
    );
  };

  return (
    <div className="space-y-4 transition-all duration-300 text-left">
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input type="text" placeholder="Search accounts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400" />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-[9px] font-black uppercase outline-none active:scale-95 transition-all">
            <option value="All">Status</option>
            {Object.values(CaseStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-xl px-3 py-2 text-[9px] font-black uppercase outline-none active:scale-95 transition-all">
            <option value="All">Risk</option>
            <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[1.8rem] sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto scrollbar-none">
          <table className="w-full text-left min-w-[700px] sm:min-w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="active:scale-90 transition-all p-1">
                    {processedDebtors.every(d => selectedIds.includes(d.id)) ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} className="text-slate-300" />}
                  </button>
                </th>
                <th className="px-4 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer group whitespace-nowrap" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Borrower
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer group text-right whitespace-nowrap" onClick={() => handleSort('amountDue')}>
                  <div className="flex items-center justify-end">
                    Balance
                    {renderSortIcon('amountDue')}
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">
                  Nodes
                </th>
                <th className="px-4 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer group text-center whitespace-nowrap" onClick={() => handleSort('overdueDays')}>
                  <div className="flex items-center justify-center">
                    DPD
                    {renderSortIcon('overdueDays')}
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer group text-left whitespace-nowrap" onClick={() => handleSort('lastContactDate')}>
                   <div className="flex items-center">
                    <History size={12} className="mr-1.5 shrink-0" /> Activity
                    {renderSortIcon('lastContactDate')}
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {processedDebtors.map((d) => (
                <tr key={d.id} className={`hover:bg-slate-50/50 transition-all group border-l-4 ${selectedIds.includes(d.id) ? 'bg-blue-50/40 border-blue-600' : 'border-transparent'}`}>
                  <td className="px-6 py-4 text-center"><button className="active:scale-90 transition-all p-1" onClick={() => setSelectedIds(prev => prev.includes(d.id) ? prev.filter(id => id !== d.id) : [...prev, d.id])}>{selectedIds.includes(d.id) ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} className="text-slate-200" />}</button></td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-[11px] border shrink-0 ${d.riskScore === 'Critical' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                         {d.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] sm:text-xs font-black text-slate-900 leading-none truncate max-w-[120px]">{d.name}</p>
                        <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-tighter truncate">Ref: {d.loanId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                     <p className="text-[11px] sm:text-xs font-black text-slate-900 leading-none whitespace-nowrap">{sym}{d.amountDue.toLocaleString()}</p>
                     <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded mt-1 border inline-block whitespace-nowrap ${getStatusColor(d.status)}`}>{d.status}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center">
                    {renderWorkflowIcons(d.workflowNodes)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center">
                     <p className="text-[11px] sm:text-xs font-black text-slate-700 leading-none">{d.overdueDays}d</p>
                     <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest whitespace-nowrap">{d.bucket}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                     <div className="flex flex-col min-w-[80px]">
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 truncate">{d.lastContactDate ? "Connected" : "Idle"}</span>
                        <span className="text-[8px] sm:text-[9px] text-slate-400 truncate mt-0.5">{d.lastContactDate || 'Pending'}</span>
                     </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <button 
                      onClick={() => onViewDetails(d)} 
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-blue-600 transition-all active:scale-95 whitespace-nowrap"
                    >
                      Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {processedDebtors.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center animate-in fade-in duration-500">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert size={32} className="text-slate-200" />
             </div>
             <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">No active accounts matched</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(DebtorList);
