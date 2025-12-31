
import * as React from 'react';
import { 
  ShieldAlert, 
  ShieldOff, 
  X, 
  Zap, 
  Terminal, 
  Fingerprint, 
  UserX, 
  Search, 
  Activity,
  Scan,
  ShieldCheck,
  Cpu,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { AnomalyAlert } from '../types';

interface AnomalySentinelProps {
  alert: AnomalyAlert;
  onDismiss: () => void;
  onAction: (action: string) => void;
}

const AnomalySentinel: React.FC<AnomalySentinelProps> = ({ alert, onDismiss, onAction }) => {
  const [isScanning, setIsScanning] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const getTypeIcon = () => {
    switch (alert.type) {
      case 'EXFILTRATION': return <Zap className="text-amber-500" size={32} />;
      case 'UNAUTHORIZED_ACCESS': return <ShieldAlert className="text-rose-500" size={32} />;
      case 'BEHAVIORAL': return <Fingerprint className="text-purple-500" size={32} />;
      case 'SENSITIVE_MODIFICATION': return <Terminal className="text-blue-500" size={32} />;
      default: return <AlertCircle className="text-slate-500" size={32} />;
    }
  };

  const getSeverityColor = () => {
    return alert.severity === 'CRITICAL' ? 'from-rose-600 to-rose-900' : 'from-amber-500 to-amber-700';
  };

  return (
    <div className="fixed inset-0 z-[10002] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-500">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#ff0000 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_0_100px_rgba(244,63,94,0.3)] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
        {/* Header Section */}
        <div className={`p-8 bg-gradient-to-r ${getSeverityColor()} text-white flex justify-between items-center relative overflow-hidden`}>
          <div className="absolute right-[-20px] top-[-20px] opacity-20 rotate-12">
            <Scan size={180} />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
              {getTypeIcon()}
            </div>
            <div className="text-left">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Nexus Sentinel Detection</h3>
              <h2 className="text-2xl font-black tracking-tight">{alert.severity} System Anomaly</h2>
            </div>
          </div>
          <button onClick={onDismiss} className="p-3 bg-black/20 hover:bg-black/40 rounded-2xl transition-all relative z-10">
            <X size={24} />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-10 flex-1 overflow-y-auto">
          {isScanning ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="text-rose-500 animate-pulse" size={32} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Performing Behavioral Analysis...</p>
                <p className="text-[10px] font-bold text-slate-300 mt-1">Cross-referencing historical patterns</p>
              </div>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-1 text-left">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entity Flagged</span>
                   <p className="text-sm font-black text-slate-900">{alert.agentName}</p>
                   <p className="text-[10px] font-bold text-slate-500 font-mono">{alert.agentId}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col gap-1 text-left">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Detected</span>
                   <p className="text-sm font-black text-slate-900">{alert.timestamp}</p>
                   <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Live Monitor Active</p>
                </div>
              </div>

              <div className="p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100 text-left">
                <div className="flex items-start gap-4">
                  <div className="mt-1"><AlertCircle className="text-rose-600" size={20} /></div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-black text-rose-900">Incident Details</h4>
                    <p className="text-sm text-rose-700/80 leading-relaxed font-medium">
                      {alert.details}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Immediate Tactical Response</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    onClick={() => onAction('FREEZE_ACCOUNT')}
                    className="p-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-3 hover:bg-black transition-all group"
                  >
                    <UserX size={20} className="group-hover:scale-110 transition-transform" />
                    Suspend Access
                  </button>
                  <button 
                    onClick={() => onAction('INVESTIGATE_LOGS')}
                    className="p-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-3 hover:border-blue-600 hover:text-blue-600 transition-all group"
                  >
                    <Search size={20} className="group-hover:rotate-12 transition-transform" />
                    Deep Audit
                  </button>
                  <button 
                    onClick={() => onAction('LOCK_TERMINAL')}
                    className="p-4 bg-rose-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-3 hover:bg-rose-700 shadow-xl shadow-rose-500/20 transition-all group"
                  >
                    <Lock size={20} className="group-hover:animate-bounce" />
                    Kill Switch
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-400">
            <ShieldCheck size={16} className="text-emerald-500" />
            <p className="text-[9px] font-bold uppercase tracking-widest leading-none">Automated threat mitigation logic enabled</p>
          </div>
          <button onClick={onDismiss} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1">
            Monitor Remotely <ArrowRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnomalySentinel;
