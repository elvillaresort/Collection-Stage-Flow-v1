
import * as React from 'react';
import {
  FileText,
  Table as TableIcon,
  StickyNote,
  X,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  Save,
  Bold,
  Italic,
  List,
  ChevronRight,
  Sparkles,
  Command,
  PlusCircle,
  Download,
  Share2,
  MoreHorizontal,
  Calculator,
  RefreshCw,
  Search,
  CheckCircle2
} from 'lucide-react';
import { QuickNote } from '../types';

const { useState, useEffect, useRef, useMemo } = React;

interface QuickWorkspaceProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

const QuickWorkspace: React.FC<QuickWorkspaceProps> = ({ isOpen, onToggle }) => {
  const [activeTool, setActiveTool] = useState<'notes' | 'docs' | 'sheets'>('notes');
  const [isMaximized, setIsMaximized] = useState(false);

  // Notes State
  const [notes, setNotes] = useState<QuickNote[]>(() => {
    const saved = localStorage.getItem('pccs_workspace_notes');
    return saved ? JSON.parse(saved) : [{ id: '1', content: 'Operational reminder: Cross-reference L-9081 employer link in OSINT.', timestamp: new Date().toLocaleString() }];
  });
  const [newNoteText, setNewNoteText] = useState('');

  // Docs State
  const [docContent, setDocContent] = useState(() => {
    return localStorage.getItem('pccs_workspace_doc') || 'Dear [Debtor Name],\n\nThis is a courtesy reminder regarding your outstanding liability of [Amount]...';
  });

  // Sheets State
  const [sheetData, setSheetData] = useState<string[][]>(() => {
    const saved = localStorage.getItem('pccs_workspace_sheet');
    return saved ? JSON.parse(saved) : Array(12).fill(null).map(() => Array(6).fill(''));
  });

  useEffect(() => {
    localStorage.setItem('pccs_workspace_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('pccs_workspace_doc', docContent);
  }, [docContent]);

  useEffect(() => {
    localStorage.setItem('pccs_workspace_sheet', JSON.stringify(sheetData));
  }, [sheetData]);

  const addNote = () => {
    if (!newNoteText.trim()) return;
    const note: QuickNote = {
      id: Date.now().toString(),
      content: newNoteText,
      timestamp: new Date().toLocaleString(),
    };
    setNotes([note, ...notes]);
    setNewNoteText('');
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const updateSheetCell = (row: number, col: number, value: string) => {
    setSheetData(prev => {
      const next = prev.map((r, ri) => ri === row ? r.map((c, ci) => ci === col ? value : c) : r);
      return next;
    });
  };

  const autoSumColumnA = () => {
    const sum = sheetData.reduce((acc, row) => {
      const val = parseFloat(row[0]) || 0;
      return acc + val;
    }, 0);
    alert(`Column A (Index 0) Total: ${sum}`);
  };

  const wordCount = useMemo(() => docContent.split(/\s+/).filter(Boolean).length, [docContent]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-8 right-8 z-[9000] bg-white rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-slate-200 overflow-hidden flex flex-col transition-all duration-500 animate-in zoom-in-95 ${isMaximized ? 'inset-10 bottom-10 right-10 w-auto h-auto' : 'w-[450px] h-[650px]'
        }`}
    >
      {/* Workspace Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTool('notes')}
            className={`p-2 rounded-xl transition-all ${activeTool === 'notes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
            title="Sticky Notes"
          >
            <StickyNote size={18} />
          </button>
          <button
            onClick={() => setActiveTool('docs')}
            className={`p-2 rounded-xl transition-all ${activeTool === 'docs' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
            title="PCCS Docs"
          >
            <FileText size={18} />
          </button>
          <button
            onClick={() => setActiveTool('sheets')}
            className={`p-2 rounded-xl transition-all ${activeTool === 'sheets' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
            title="PCCS Ledger"
          >
            <TableIcon size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
            title={isMaximized ? "Minimize Workspace" : "Maximize Workspace"}
            aria-label={isMaximized ? "Minimize Workspace" : "Maximize Workspace"}
          >
            {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={() => onToggle(false)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Close Workspace" aria-label="Close Workspace">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Tool Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative">

        {activeTool === 'notes' && (
          <div className="flex-1 flex flex-col p-8 space-y-8 animate-in fade-in duration-300">
            <div className="text-left">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Nexus Notes</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Transient Operational Workspace</p>
            </div>

            <div className="relative group">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Draft a quick insight..."
                className="w-full h-32 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all resize-none"
              />
              <button
                onClick={addNote}
                className="absolute bottom-4 right-4 p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95"
                title="Save Operational Note"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {notes.map((note) => (
                <div key={note.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm relative group hover:border-blue-200 transition-all text-left animate-in slide-in-from-top-2">
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed pr-8">{note.content}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-300 uppercase">{note.timestamp}</span>
                    <button onClick={() => deleteNote(note.id)} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all" title="Delete Note">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTool === 'docs' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-white rounded-lg text-slate-500" title="Bold"><Bold size={16} /></button>
                <button className="p-2 hover:bg-white rounded-lg text-slate-500" title="Italic"><Italic size={16} /></button>
                <button className="p-2 hover:bg-white rounded-lg text-slate-500" title="Bullet List"><List size={16} /></button>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <button
                  onClick={() => alert("AI is analyzing text for recovery optimization...")}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm hover:bg-blue-100"
                  title="AI Text Refinement"
                >
                  <Sparkles size={12} /> AI Refine
                </button>
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase mr-4">Auto-Saving...</div>
            </div>
            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Draft settlement document or legal warning..."
              className="flex-1 p-10 text-base font-medium text-slate-700 leading-relaxed outline-none resize-none scrollbar-thin bg-white"
            />
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Document Status: Draft</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{wordCount} Words • {docContent.length} Chars</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all" title="Download Document">
                <Save size={14} /> Export to Dossier
              </button>
            </div>
          </div>
        )}

        {activeTool === 'sheets' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex gap-2">
                <button onClick={autoSumColumnA} className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm transition-all">
                  <Calculator size={12} /> Sum Col A
                </button>
                <button onClick={() => setSheetData(Array(12).fill(null).map(() => Array(6).fill('')))} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Clear Grid Data"><RefreshCw size={14} /></button>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase mr-4">Reactive Grid Hub</span>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-slate-50/50">
              <div className="inline-grid grid-cols-[40px_repeat(6,120px)] border-l border-t border-slate-200 bg-white">
                {/* Headers */}
                <div className="bg-slate-100 border-r border-b border-slate-200 h-10 flex items-center justify-center text-[10px] font-black text-slate-400">#</div>
                {['A', 'B', 'C', 'D', 'E', 'F'].map(h => (
                  <div key={h} className="bg-slate-100 border-r border-b border-slate-200 h-10 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{h}</div>
                ))}

                {/* Grid Cells */}
                {sheetData.map((row, rIdx) => (
                  <React.Fragment key={rIdx}>
                    <div className="bg-slate-100 border-r border-b border-slate-200 h-10 flex items-center justify-center text-[10px] font-black text-slate-400">{rIdx + 1}</div>
                    {row.map((cell, cIdx) => (
                      <input
                        key={`${rIdx}-${cIdx}`}
                        value={cell}
                        onChange={(e) => updateSheetCell(rIdx, cIdx, e.target.value)}
                        className="border-r border-b border-slate-200 h-10 px-3 text-xs font-bold text-slate-900 outline-none focus:bg-blue-50/50 focus:ring-1 focus:ring-inset focus:ring-blue-600"
                        title={`Cell ${String.fromCharCode(65 + cIdx)}${rIdx + 1}`}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-slate-900" title="Download Grid Data"><Download size={18} /></button>
                <button className="p-2 text-slate-400 hover:text-slate-900" title="Share Ledger Content"><Share2 size={18} /></button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Sync Active</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default QuickWorkspace;
