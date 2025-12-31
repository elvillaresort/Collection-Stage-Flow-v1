
import * as React from 'react';
import { Clock, Coffee, Utensils, LogOut, Play } from 'lucide-react';
import { User, UserAttendance, AttendanceSession, AttendanceSessionType } from '../types';

const { useState, useEffect, useMemo } = React;

interface AttendancePanelSidebarProps {
    user: User;
    attendance: UserAttendance | null;
    onUpdateAttendance: (attendance: UserAttendance) => void;
    onShowHistory: () => void;
    isCollapsed?: boolean;
}

const AttendancePanelSidebar: React.FC<AttendancePanelSidebarProps> = ({ user, attendance, onUpdateAttendance, onShowHistory, isCollapsed }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

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

        if (currentSession) {
            const updatedSessions = [...newAttendance.sessions];
            const lastSessionIndex = updatedSessions.length - 1;
            const lastSession = { ...updatedSessions[lastSessionIndex], endTime: now };
            const start = new Date(lastSession.startTime).getTime();
            const end = new Date(now).getTime();
            const diffMinutes = Math.floor((end - start) / 60000);
            if (lastSession.type === 'WORK') newAttendance.totalWorkMinutes += diffMinutes;
            else newAttendance.totalBreakMinutes += diffMinutes;
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
        ON_BREAK: 'Break',
        ON_LUNCH: 'Meal'
    };

    const totalPossibleWorkSec = (attendance?.totalWorkMinutes || 0) * 60 + (attendance?.status === 'WORKING' ? elapsedTime : 0);
    const totalBreakSec = (attendance?.totalBreakMinutes || 0) * 60 + (['ON_BREAK', 'ON_LUNCH'].includes(attendance?.status || '') ? elapsedTime : 0);

    if (isCollapsed) {
        return (
            <div className="flex flex-col items-center gap-3 py-4 border-y border-white/5 bg-slate-950/30">
                <div className={`w-3 h-3 rounded-full ${statusColors[attendance?.status || 'OFFLINE']} animate-pulse shadow-sm`}></div>
                <button
                    onClick={onShowHistory}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                    title="Attendance History"
                >
                    <Clock size={18} />
                </button>
                {(!attendance || attendance.status === 'OFFLINE') ? (
                    <button onClick={() => handleAction('WORK')} className="p-3 bg-emerald-600 rounded-xl text-white shadow-lg" title="Clock In"><Play size={16} fill="currentColor" /></button>
                ) : (
                    <button onClick={() => handleAction('CLOCK_OUT')} className="p-3 bg-rose-600 rounded-xl text-white shadow-lg" title="Clock Out"><LogOut size={16} /></button>
                )}
            </div>
        );
    }

    return (
        <div className="px-5 py-6 space-y-4 border-b border-white/5 bg-slate-950/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${statusColors[attendance?.status || 'OFFLINE']} animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]`}></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{statusLabels[attendance?.status || 'OFFLINE']}</span>
                </div>
                <button onClick={onShowHistory} className="text-[10px] font-bold text-blue-400 hover:underline uppercase tracking-widest" title="View History">History</button>
            </div>

            <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Session Duration</p>
                <p className="text-2xl font-mono font-black text-blue-400 tracking-tighter leading-none">{formatDuration(elapsedTime)}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {(!attendance || attendance.status === 'OFFLINE') ? (
                    <button
                        onClick={() => handleAction('WORK')}
                        className="col-span-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
                        title="Start Shift"
                    >
                        <Play size={14} fill="currentColor" /> Clock In
                    </button>
                ) : (
                    <>
                        {attendance.status === 'WORKING' ? (
                            <>
                                <button onClick={() => handleAction('BREAK')} className="py-2.5 bg-white/5 hover:bg-amber-500/20 text-amber-500 rounded-xl transition-all border border-amber-500/20 flex flex-col items-center gap-1" title="Short Break">
                                    <Coffee size={14} />
                                    <span className="text-[7px] font-black uppercase tracking-widest">Break</span>
                                </button>
                                <button onClick={() => handleAction('LUNCH')} className="py-2.5 bg-white/5 hover:bg-blue-500/20 text-blue-500 rounded-xl transition-all border border-blue-500/20 flex flex-col items-center gap-1" title="Meal Break">
                                    <Utensils size={14} />
                                    <span className="text-[7px] font-black uppercase tracking-widest">Lunch</span>
                                </button>
                            </>
                        ) : (
                            <button onClick={() => handleAction('WORK')} className="col-span-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2" title="Resume Duty">
                                <Play size={14} fill="currentColor" /> Resume
                            </button>
                        )}
                        <button onClick={() => handleAction('CLOCK_OUT')} className="col-span-2 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2" title="End Shift">
                            <LogOut size={14} /> Clock Out
                        </button>
                    </>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-3 bg-slate-900/30 rounded-xl border border-white/5">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Duty Hrs</p>
                    <p className="text-xs font-black text-slate-300 font-mono">{formatDuration(totalPossibleWorkSec)}</p>
                </div>
                <div className="p-3 bg-slate-900/30 rounded-xl border border-white/5">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Break</p>
                    <p className="text-xs font-black text-slate-300 font-mono">{formatDuration(totalBreakSec)}</p>
                </div>
            </div>
        </div>
    );
};

export default AttendancePanelSidebar;
