import * as React from 'react';
import { X, Clock, Monitor, Coffee, Utensils, Download } from 'lucide-react';
import { UserAttendance, User } from '../types';

const { useState } = React;

interface DutyLogMatrixModalProps {
    user: User;
    attendance: UserAttendance | null;
    onClose: () => void;
}

const DutyLogMatrixModal: React.FC<DutyLogMatrixModalProps> = ({ user, attendance, onClose }) => {
    const [dateFilter, setDateFilter] = useState(attendance?.date || new Date().toISOString().split('T')[0]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const totalPossibleWorkSec = (attendance?.totalWorkMinutes || 0) * 60;
    const totalBreakSec = (attendance?.totalBreakMinutes || 0) * 60;

    const generateCSV = () => {
        if (!attendance || !attendance.sessions || attendance.sessions.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = ['Session Type', 'Start Time', 'End Time', 'Duration (minutes)', 'Date'];
        const rows = attendance.sessions.map(session => {
            const duration = session.endTime
                ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
                : 'Ongoing';
            return [
                session.type,
                new Date(session.startTime).toLocaleString(),
                session.endTime ? new Date(session.endTime).toLocaleString() : 'Active',
                duration,
                attendance.date
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_report_${attendance.date}_${user.name.replace(/\s+/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900">Duty Log Matrix</h2>
                            <p className="text-sm text-slate-600 font-semibold mt-1">Attendance Timeline Report</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
                            title="Close"
                        >
                            <X size={24} className="text-slate-600" />
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-slate-700 mb-2 block">Date Filter</label>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="Select date"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={generateCSV}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                            >
                                <Download size={16} />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {(!attendance || !attendance.sessions || attendance.sessions.length === 0) ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <Clock size={36} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No Session Logs</h3>
                            <p className="text-slate-600">No attendance data for <strong>{dateFilter}</strong></p>
                            <p className="text-sm text-slate-500 mt-1">Try selecting a different date</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {attendance.sessions.map((session, idx) => (
                                <div key={session.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${session.type === 'WORK' ? 'bg-emerald-500' :
                                                session.type === 'BREAK' ? 'bg-amber-500' :
                                                    'bg-blue-500'
                                            }`}>
                                            {session.type === 'WORK' ? <Monitor size={24} className="text-white" /> :
                                                session.type === 'BREAK' ? <Coffee size={24} className="text-white" /> :
                                                    <Utensils size={24} className="text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-slate-900 mb-1">
                                                {session.type === 'WORK' ? 'Duty Protocol' :
                                                    session.type === 'BREAK' ? 'Short Interval' :
                                                        'Meal Buffer'}
                                            </h4>
                                            <p className="text-sm text-slate-600 font-medium">
                                                {session.endTime
                                                    ? `Duration: ${Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)} minutes`
                                                    : '🔴 Active Session'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg mb-1">
                                                {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {session.endTime && (
                                                <div className="text-xs font-mono text-slate-500">
                                                    → {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-white">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                            <p className="text-xs font-bold text-emerald-800 mb-1">TOTAL DUTY</p>
                            <p className="text-2xl font-black text-emerald-700 font-mono">{formatDuration(totalPossibleWorkSec)}</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                            <p className="text-xs font-bold text-amber-800 mb-1">TOTAL BREAK</p>
                            <p className="text-2xl font-black text-amber-700 font-mono">{formatDuration(totalBreakSec)}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                            <p className="text-xs font-bold text-blue-800 mb-1">PRODUCTIVITY</p>
                            <p className="text-2xl font-black text-blue-700">
                                {totalPossibleWorkSec > 0 ? (Math.min(100, (totalPossibleWorkSec / (totalPossibleWorkSec + totalBreakSec)) * 100).toFixed(1)) : '0.0'}%
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={generateCSV}
                        className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-colors"
                    >
                        <Download size={20} />
                        Generate & Download CSV Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DutyLogMatrixModal;
