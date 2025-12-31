
import * as React from 'react';
import { Clock, Coffee, Utensils, LogOut, Play, Pause, History, Monitor, Calculator } from 'lucide-react';
import { User, UserAttendance, AttendanceSession, AttendanceSessionType } from '../types';

const { useState, useEffect, useRef, useMemo } = React;

interface AttendancePanelProps {
    user: User;
    attendance: UserAttendance | null;
    onUpdateAttendance: (attendance: UserAttendance) => void;
}

const AttendancePanel: React.FC<AttendancePanelProps> = ({ user, attendance, onUpdateAttendance }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const currentSession = useMemo(() => {
        if (!attendance || attendance.sessions.length === 0) return null;
        const last = attendance.sessions[attendance.sessions.length - 1];
        return last.endTime ? null : last;
    }, [attendance]);

    const elapsedTime = useMemo(() => {
        if (!currentSession) return 0;
        const start = new Date(currentSession.startTime).getTime();
        return Math.floor((currentTime.getTime() - start) / 1000);
    }, [currentSession, currentTime]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAction = (type: AttendanceSessionType | 'CLOCK_OUT') => {
        const now = new Date().toISOString();
        const newAttendance: UserAttendance = attendance ? { ...attendance } : {
            userId: user.id,
            date: new Date().toISOString().split('T')[0],
            sessions: [],
            status: 'OFFLINE',
            totalWorkMinutes: 0,
            totalBreakMinutes: 0
        };

        // Close current session if any
        if (currentSession) {
            const updatedSessions = [...newAttendance.sessions];
            const lastSessionIndex = updatedSessions.length - 1;
            const lastSession = { ...updatedSessions[lastSessionIndex], endTime: now };

            // Calculate duration for the finished session
            const start = new Date(lastSession.startTime).getTime();
            const end = new Date(now).getTime();
            const diffMinutes = Math.floor((end - start) / 60000);

            if (lastSession.type === 'WORK') {
                newAttendance.totalWorkMinutes += diffMinutes;
            } else {
                newAttendance.totalBreakMinutes += diffMinutes;
            }

            updatedSessions[lastSessionIndex] = lastSession;
            newAttendance.sessions = updatedSessions;
        }

        if (type === 'CLOCK_OUT') {
            newAttendance.status = 'OFFLINE';
        } else {
            const newSession: AttendanceSession = {
                id: `sess-${Date.now()}`,
                userId: user.id,
                type,
                startTime: now
            };
            newAttendance.sessions.push(newSession);
            newAttendance.status = type === 'WORK' ? 'WORKING' : type === 'BREAK' ? 'ON_BREAK' : 'ON_LUNCH';
        }

        onUpdateAttendance(newAttendance);
    };

    const statusColors = {
        OFFLINE: 'bg-slate-500',
        WORKING: 'bg-emerald-500',
        ON_BREAK: 'bg-amber-500',
        ON_LUNCH: 'bg-blue-500'
    };

    const statusLabels = {
        OFFLINE: 'Offline',
        WORKING: 'On Duty',
        ON_BREAK: 'Short Break',
        ON_LUNCH: 'Meal Break'
    };

    const totalPossibleWorkSec = (attendance?.totalWorkMinutes || 0) * 60 + (attendance?.status === 'WORKING' ? elapsedTime : 0);
    const totalBreakSec = (attendance?.totalBreakMinutes || 0) * 60 + (['ON_BREAK', 'ON_LUNCH'].includes(attendance?.status || '') ? elapsedTime : 0);

    return (
        <div className="flex flex-col gap-4">
            {/* HUD Bar */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-4 flex items-center justify-between shadow-2xl border border-white/5 min-w-[400px]">
                <div className="flex items-center gap-4 px-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[attendance?.status || 'OFFLINE']} animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]`}></div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shift Status</p>
                        <p className="text-xs font-black uppercase">{statusLabels[attendance?.status || 'OFFLINE']}</p>
                    </div>
                </div>

                <div className="h-8 w-px bg-white/10 mx-2"></div>

                <div className="flex-1 px-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Elapsed</p>
                    <p className="text-xl font-mono font-black tracking-tighter text-blue-400">
                        {formatDuration(elapsedTime)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {(!attendance || attendance.status === 'OFFLINE') ? (
                        <button
                            onClick={() => handleAction('WORK')}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                            title="Time In"
                        >
                            <Play size={14} fill="currentColor" /> Clock In
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            {attendance.status === 'WORKING' ? (
                                <>
                                    <button
                                        onClick={() => handleAction('BREAK')}
                                        className="p-3 bg-white/5 hover:bg-amber-500/20 text-amber-500 rounded-xl transition-all border border-amber-500/20"
                                        title="Take Break"
                                    >
                                        <Coffee size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleAction('LUNCH')}
                                        className="p-3 bg-white/5 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-all border border-blue-500/20"
                                        title="Meal Break"
                                    >
                                        <Utensils size={18} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => handleAction('WORK')}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-900/20 flex items-center gap-2"
                                    title="Resume Work"
                                >
                                    <Pause size={14} fill="currentColor" /> Resume
                                </button>
                            )}
                            <button
                                onClick={() => handleAction('CLOCK_OUT')}
                                className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20"
                                title="Clock Out"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="ml-4 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all"
                    title="View Productivity Logs"
                >
                    <History size={18} />
                </button>
            </div>

            {/* Stats Mini Panel */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Calculator size={10} className="text-blue-500" /> Rendered Hrs
                    </p>
                    <p className="text-lg font-black text-slate-900 tracking-tight">{formatDuration(totalPossibleWorkSec)}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Coffee size={10} className="text-amber-500" /> Break Time
                    </p>
                    <p className="text-lg font-black text-slate-900 tracking-tight">{formatDuration(totalBreakSec)}</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Monitor size={10} className="text-emerald-500" /> Productivity
                    </p>
                    <p className="text-lg font-black text-emerald-600 tracking-tight">
                        {totalPossibleWorkSec > 0 ? (Math.min(100, (totalPossibleWorkSec / (totalPossibleWorkSec + totalBreakSec)) * 100).toFixed(1)) : '0.0'}%
                    </p>
                </div>
            </div>

            {/* History Popup (Overlaid via state) */}
            {showHistory && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 sm:p-20">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowHistory(false)}></div>
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-full border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Daily Activity Node</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Timeline Analytics // {attendance?.date || 'No Data'}</p>
                            </div>
                            <button onClick={() => setShowHistory(false)} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-all" title="Close Logs"><X size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {(!attendance || !attendance.sessions || attendance.sessions.length === 0) ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 opacity-50">
                                        <Clock size={32} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No active sessions logs found for today.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {attendance.sessions.map((session, idx) => (
                                        <div key={session.id} className="group relative flex items-start gap-6">
                                            {idx < attendance.sessions.length - 1 && <div className="absolute left-[23px] top-12 bottom-0 w-[2px] bg-slate-100 group-last:hidden"></div>}
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border-4 border-white ${session.type === 'WORK' ? 'bg-emerald-500 text-white' : session.type === 'BREAK' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'}`}>
                                                {session.type === 'WORK' ? <Monitor size={20} /> : session.type === 'BREAK' ? <Coffee size={20} /> : <Utensils size={20} />}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{session.type === 'WORK' ? 'Duty Cycle' : session.type === 'BREAK' ? 'Short Interval' : 'Meal Break'}</p>
                                                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        {session.endTime ? (
                                                            `Active for ${Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)} minutes`
                                                        ) : (
                                                            'Session currently active'
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex gap-10">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aggregate Duty</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">{formatDuration(totalPossibleWorkSec)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aggregate Break</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter">{formatDuration(totalBreakSec)}</p>
                                </div>
                            </div>
                            <button className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-black active:scale-95 transition-all">
                                Generate Daily Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const X: React.FC<{ size?: number }> = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default AttendancePanel;
