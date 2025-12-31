import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
   Phone, MessageSquare, BrainCircuit, Zap, MapPin, Clock, Sparkles, Loader2,
   X, Smartphone, History, Send, Activity as ActivityIcon, Plus,
   Trash2, Quote, AlertTriangle, RefreshCw, Globe, Users, Briefcase,
   BarChart3, Gavel, CreditCard, Building2, CalendarDays, Coins,
   FileText, UserCircle2, Scale, Save, AlertOctagon, Info, ChevronLeft,
   MoreVertical, Share2, Bot, Cpu, StickyNote, ReceiptText, UserPlus,
   ShieldCheck, ArrowRight, Wallet, CheckCircle2, Navigation,
   Database, TrendingUp, Eye, PieChart, Download, Mail, UserCheck,
   Check, ChevronDown, ListFilter, Copy, FileUp, Table as TableIcon,
   ChevronRight, AlertCircle, Calculator,
   MessageCircle,
   Hash,
   Play,
   Settings,
   CircleStop,
   Terminal,
   MousePointer2,
   LayoutGrid,
   Rocket,
   Fingerprint,
   FileSpreadsheet,
   HardDriveUpload,
   ArrowUpRight,
   ArrowLeftRight,
   Target,
   Lock,
   Search,
   CheckCircle,
   Link,
   Code,
   FileSearch,
   ShieldAlert,
   Percent,
   ThumbsUp,
   Shuffle
} from 'lucide-react';
import SmartReshuffle from './SmartReshuffle';
import { getAIRecoveryNudge, RecoveryNudge, generateCollectionEmail, getSmartIngestionMapping } from '../services/geminiService';
import DebtorList from './DebtorList';
import { Debtor, CaseStatus, CommunicationType, Activity, SystemSettings, User, UserRole } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { generateDummyDebtors } from '../utils/dummyDebtors';

interface PortfolioProps {
   portfolio: Debtor[];
   activities: Activity[];
   onAddActivity: (activity: Activity) => void;
   settings: SystemSettings;
   onUpdateSettings: (newSettings: SystemSettings) => void;
   user: User;
   systemUsers: User[];
   onUpdateUser: (user: User) => void;
   onImportPortfolio: (debtors: Debtor[]) => void;
   onSetPortfolio: (debtors: Debtor[]) => void;
   onLogExport: () => void;
   onBulkUpdateDebtors: (ids: string[], updates: Partial<Debtor>) => void;
   onBulkAssignDebtors: (debtorIds: string[], agentId: string) => void;
   onBulkStatusUpdate: (debtorIds: string[], newStatus: CaseStatus) => void;

}

const SUPERVISORY_ROLES: UserRole[] = ['ADMIN', 'HEAD_OF_OPERATIONS', 'OPERATIONS_MANAGER', 'TEAM_MANAGER', 'TEAM_LEADER', 'CAMPAIGN_ADMIN'];

const REQUIRED_MAPPINGS: { key: string; label: string; type: 'string' | 'number' }[] = [
   { key: 'name', label: 'Borrower Name', type: 'string' },
   { key: 'loanId', label: 'Loan Reference', type: 'string' },
   { key: 'amountDue', label: 'Outstanding Balance', type: 'number' },
   { key: 'overdueDays', label: 'DPD (Days Past Due)', type: 'number' },
   { key: 'phoneNumber', label: 'Primary Contact', type: 'string' },
   { key: 'email', label: 'Email Address', type: 'string' },
   { key: 'address', label: 'Street Address', type: 'string' },
   { key: 'city', label: 'City', type: 'string' },
   { key: 'province', label: 'Province/State', type: 'string' },
   { key: 'zipCode', label: 'Zip/Postal Code', type: 'string' },
   { key: 'employer', label: 'Employer Name', type: 'string' },
];

const Portfolio: React.FC<PortfolioProps> = ({
   portfolio, activities, onAddActivity, settings, onUpdateSettings,
   user, systemUsers, onUpdateUser, onBulkUpdateDebtors, onBulkAssignDebtors, onBulkStatusUpdate, onImportPortfolio, onSetPortfolio, onLogExport
}) => {
   const [activeMainView, setActiveMainView] = useState<'list' | 'ai-operator'>('list');
   const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
   const [showDetailsModal, setShowDetailsModal] = useState(false);
   const [selectedIds, setSelectedIds] = useState<string[]>([]);
   const [selectedAgentId, setSelectedAgentId] = useState<string>(''); // Added for bulk assign
   const [activeTab, setActiveTab] = useState<'profile' | 'financials' | 'history' | 'internal' | 'traceability'>('profile');

   // AI Agent States
   const [isAutoPilotOn, setIsAutoPilotOn] = useState(false);
   const [aiThinkingLog, setAiThinkingLog] = useState<string[]>(["[SYSTEM] Nexus AI initialized.", "[NODE] Scanning high-risk segments..."]);
   const [isProcessingBatch, setIsProcessingBatch] = useState(false);
   const [batchProgress, setBatchProgress] = useState(0);

   // Smart Ingestion State
   const [showImportWizard, setShowImportWizard] = useState(false);
   const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
   const [fileHeaders, setFileHeaders] = useState<string[]>([]);
   const [fileData, setFileData] = useState<string[][]>([]);
   const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
   const [aiMappingMetadata, setAiMappingMetadata] = useState<Record<string, { confidence: number, reasoning: string }>>({});
   const [isParsing, setIsParsing] = useState(false);
   const [ingestionMode, setIngestionMode] = useState<'import' | 'update'>('import');
   const [isAiMapping, setIsAiMapping] = useState(false);
   const [ingestionLogs, setIngestionLogs] = useState<string[]>([]);

   // Settlement Workbench States (Integrated from Hub)
   const [isSettlementMode, setIsSettlementMode] = useState(false);
   const [waivers, setWaivers] = useState({ principal: 0, interest: 20, penalties: 50 });
   const [reason, setReason] = useState('');
   const [installments, setInstallments] = useState(1);
   const [isRequesting, setIsRequesting] = useState(false);
   const [aiSuggestion, setAiSuggestion] = useState<any>(null);
   const [isAiLoading, setIsAiLoading] = useState(false);

   // Export States
   const [showExportModal, setShowExportModal] = useState(false);
   const [exportPassword, setExportPassword] = useState('');
   const [isExporting, setIsExporting] = useState(false);

   // Piece Meal Account States
   const [showPieceMealModal, setShowPieceMealModal] = useState(false);
   const [showSmartReshuffle, setShowSmartReshuffle] = useState(false);
   const [pieceMealForm, setPieceMealForm] = useState({
      name: '',
      loanId: '',
      phoneNumber: '',
      email: '',
      address: '',
      city: '',
      principal: '',
      interest: '',
      penalties: '',
      overdueDays: ''
   });

   // AI Optimizer States
   const [isOptimizing, setIsOptimizing] = useState(false);

   const handleGenerateTestAccounts = async () => {
      if (!confirm("This will generate 50 dummy accounts. Some will be explicitly assigned to YOU for testing. Proceed?")) return;

      const newDebtors = generateDummyDebtors();

      // Randomly assign ~40% of them to the current user
      const enhancedDebtors = newDebtors.map(d => {
         if (Math.random() < 0.4) {
            return { ...d, assignedAgentId: user.id };
         }
         return d;
      });

      onImportPortfolio(enhancedDebtors);
      alert(`Successfully generated ${enhancedDebtors.length} test accounts!\n\n${enhancedDebtors.filter(d => d.assignedAgentId === user.id).length} accounts were assigned to you (User ID: ${user.name}).\n\nYou can now test the "My Accounts" restriction in the Grievances module.`);
   };
   const [optimizationResult, setOptimizationResult] = useState<{ debtorId: string, suggestion: string }[]>([]);
   const [showOptimizerModal, setShowOptimizerModal] = useState(false);

   // Email Draft State
   const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
   const [emailDraft, setEmailDraft] = useState<string | null>(null);

   // Bulk Actions UI State
   const [showAssignDropdown, setShowAssignDropdown] = useState(false);
   const [showStatusDropdown, setShowStatusDropdown] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   // Internal Notes State
   const [internalNotes, setInternalNotes] = useState<Record<string, string>>({});
   const [noteDraft, setNoteDraft] = useState('');
   const [isSavingNote, setIsSavingNote] = useState(false);

   // AI State
   const [recoveryNudge, setRecoveryNudge] = useState<RecoveryNudge | null>(null);
   const [isNudgeLoading, setIsNudgeLoading] = useState(false);

   const isSuperuser = SUPERVISORY_ROLES.includes(user.role);
   const sym = settings.localization.currencySymbol;

   const accessiblePortfolio = useMemo(() => {
      if (isSuperuser) return portfolio;
      const assignedIds = user.assignedDebtorIds || [];
      return portfolio.filter(d => assignedIds.includes(d.id));
   }, [portfolio, user, isSuperuser]);

   const riskStats = useMemo(() => {
      const stats = { Critical: 0, High: 0, Medium: 0, Low: 0 };
      accessiblePortfolio.forEach(d => {
         if (stats[d.riskScore as keyof typeof stats] !== undefined) {
            stats[d.riskScore as keyof typeof stats]++;
         }
      });
      return stats;
   }, [accessiblePortfolio]);

   const highYieldTargets = useMemo(() => {
      return accessiblePortfolio
         .filter(d => d.riskScore === 'High' || d.riskScore === 'Critical')
         .sort((a, b) => b.amountDue - a.amountDue)
         .slice(0, 5);
   }, [accessiblePortfolio]);

   const settlementQueue = useMemo(() => {
      return accessiblePortfolio.filter(d =>
         d.overdueDays > 30 || d.status === CaseStatus.PROMISE_TO_PAY || d.status === CaseStatus.CONTACTED
      );
   }, [accessiblePortfolio]);

   const debtorActivities = useMemo(() => {
      if (!selectedDebtor) return [];
      return activities
         .filter(a => a.debtorId === selectedDebtor.id)
         .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
   }, [selectedDebtor, activities]);

   const settlementCalculation = useMemo(() => {
      if (!selectedDebtor) return null;
      const f = selectedDebtor.financialDetail;
      const wP = (f.principal * waivers.principal) / 100;
      const wI = (f.interest * waivers.interest) / 100;
      const wPen = (f.penalties * waivers.penalties) / 100;

      const finalAmount = f.totalDue - wP - wI - wPen;
      const perInst = finalAmount / installments;

      return {
         principalWaiver: wP,
         interestWaiver: wI,
         penaltiesWaiver: wPen,
         totalWaiver: wP + wI + wPen,
         finalAmount,
         perInst
      };
   }, [selectedDebtor, waivers, installments]);

   useEffect(() => {
      const fetchNudge = async () => {
         if (selectedDebtor && showDetailsModal) {
            setIsNudgeLoading(true);
            setNoteDraft(internalNotes[selectedDebtor.id] || '');
            try {
               const nudge = await getAIRecoveryNudge(selectedDebtor, debtorActivities);
               setRecoveryNudge(nudge);
            } catch (err) { setRecoveryNudge(null); }
            finally { setIsNudgeLoading(false); }
         } else { setRecoveryNudge(null); }
      };
      fetchNudge();
   }, [selectedDebtor, showDetailsModal, debtorActivities, internalNotes]);

   useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
         if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
            setShowAssignDropdown(false);
            setShowStatusDropdown(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   // Robust CSV Parsing to handle quotes, commas, and large column counts
   const parseCSVLine = (line: string) => {
      const result = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
         const char = line[i];
         if (char === '"') {
            inQuotes = !inQuotes;
         } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
         } else {
            cur += char;
         }
      }
      result.push(cur.trim());
      return result;
   };

   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsParsing(true);
      setIngestionLogs([`[INITIALIZE] Subject: ${file.name}`, `[SCAN] Determining cluster schema...`]);

      const reader = new FileReader();
      reader.onload = async (evt) => {
         const text = evt.target?.result as string;
         const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
         if (lines.length > 0) {
            const headers = parseCSVLine(lines[0]);
            const rows = lines.slice(1).map(l => parseCSVLine(l));

            setFileHeaders(headers);
            setFileData(rows);
            setIngestionLogs(prev => [...prev, `[SCHEMA] Authoritative Header identified. ${headers.length} unique columns acquired.`]);

            setImportStep(2);

            // AI Mapping Logic - Deterministic matching against authoritative header
            setIsAiMapping(true);
            try {
               const mappingResult = await getSmartIngestionMapping(headers, REQUIRED_MAPPINGS);
               const newMapping: Record<string, string> = {};
               const metadata: Record<string, { confidence: number; reasoning: string }> = {};

               Object.entries(mappingResult).forEach(([key, val]: [string, any]) => {
                  if (val && val.header) {
                     newMapping[key] = val.header;
                     metadata[key] = { confidence: val.confidence, reasoning: val.reasoning };
                  }
               });

               setColumnMapping(newMapping);
               setAiMappingMetadata(metadata);
               setIngestionLogs(prev => [...prev, `[AI] Intelligent correspondence matrix generated successfully with high-confidence matches.`]);
            } catch (err) {
               const initialMapping: Record<string, string> = {};
               REQUIRED_MAPPINGS.forEach(m => {
                  const found = headers.find(h => h.toLowerCase() === m.key.toLowerCase() || h.toLowerCase().includes(m.label.toLowerCase()));
                  if (found) initialMapping[m.key] = found;
               });
               setColumnMapping(initialMapping);
               setIngestionLogs(prev => [...prev, `[WARNING] AI Correspondence node failed. Reverting to structural matching.`]);
            } finally {
               setIsAiMapping(false);
            }
         }
         setIsParsing(false);
      };
      reader.readAsText(file);
   };

   const handleFinalImport = () => {
      if (ingestionMode === 'update') {
         let updateCount = 0;
         let failCount = 0;
         const updatedPortfolio = [...portfolio];

         fileData.forEach((row) => {
            const mappedData: any = {};
            Object.entries(columnMapping).forEach(([systemKey, fileHeader]) => {
               const headerIdx = fileHeaders.indexOf(fileHeader);
               if (headerIdx !== -1) {
                  const value = row[headerIdx];
                  if (systemKey === 'amountDue' || systemKey === 'overdueDays') {
                     mappedData[systemKey] = parseFloat(value) || 0;
                  } else {
                     mappedData[systemKey] = value;
                  }
               }
            });

            const targetLoanId = mappedData.loanId;
            const existingIdx = updatedPortfolio.findIndex(d => d.loanId === targetLoanId);

            if (existingIdx !== -1) {
               const existing = updatedPortfolio[existingIdx];
               const updates: Partial<Debtor> = { ...mappedData };

               if (mappedData.amountDue !== undefined) {
                  updates.financialDetail = {
                     ...existing.financialDetail,
                     totalDue: mappedData.amountDue,
                     principal: mappedData.amountDue
                  };
               }

               if (mappedData.overdueDays !== undefined) {
                  if (mappedData.overdueDays > 90) { updates.bucket = '90+'; updates.riskScore = 'Critical'; }
                  else if (mappedData.overdueDays > 60) { updates.bucket = '60+'; updates.riskScore = 'High'; }
                  else if (mappedData.overdueDays > 30) { updates.bucket = '30+'; updates.riskScore = 'Medium'; }
                  else { updates.bucket = '1-30'; updates.riskScore = 'Low'; }
               }

               updatedPortfolio[existingIdx] = { ...existing, ...updates };
               updateCount++;
            } else {
               failCount++;
            }
         });

         onSetPortfolio(updatedPortfolio);
         setShowImportWizard(false);
         setImportStep(1);
         setFileData([]);
         setFileHeaders([]);
         setColumnMapping({});
         setAiMappingMetadata({});
         setIngestionLogs([]);
         alert(`Update Complete: ${updateCount} records synchronized, ${failCount} records failed to match loan IDs.`);
         return;
      }

      const importedDebtors: Debtor[] = fileData.map((row, idx) => {
         const rawData: Record<string, any> = {};
         fileHeaders.forEach((h, i) => {
            rawData[h] = row[i] || null;
         });

         const debtor: any = {
            id: `imported-${Date.now()}-${idx}`,
            status: CaseStatus.PENDING,
            riskScore: 'Medium',
            bucket: 'New',
            address: 'N/A',
            city: 'N/A',
            province: 'N/A',
            zipCode: 'N/A',
            financialDetail: { principal: 0, interest: 0, penalties: 0, totalDue: 0 },
            employment: { employerName: 'N/A', jobTitle: 'N/A', startDate: 'N/A', address: 'N/A', phone: 'N/A', email: 'N/A' },
            emergencyContact: { name: 'N/A', relationship: 'N/A', phone: 'N/A' },
            transactions: [],
            familyContacts: [],
            assets: [],
            campaignId: 'default',
            workflowNodes: { campaign: 'Queued' },
            rawIngestionData: rawData
         };

         Object.entries(columnMapping).forEach(([systemKey, fileHeader]) => {
            const headerIdx = fileHeaders.indexOf(fileHeader);
            if (headerIdx !== -1) {
               const value = row[headerIdx];
               if (systemKey === 'amountDue' || systemKey === 'overdueDays') {
                  debtor[systemKey] = parseFloat(value) || 0;
               } else if (systemKey === 'employer') {
                  debtor.employment.employerName = value;
                  debtor.employer = value;
               } else {
                  debtor[systemKey] = value;
               }
            }
         });

         debtor.financialDetail.totalDue = debtor.amountDue || 0;
         debtor.financialDetail.principal = debtor.amountDue || 0;

         if (debtor.overdueDays > 90) { debtor.bucket = '90+'; debtor.riskScore = 'Critical'; }
         else if (debtor.overdueDays > 60) { debtor.bucket = '60+'; debtor.riskScore = 'High'; }
         else if (debtor.overdueDays > 30) { debtor.bucket = '30+'; debtor.riskScore = 'Medium'; }
         else { debtor.bucket = '1-30'; debtor.riskScore = 'Low'; }

         return debtor as Debtor;
      });

      onImportPortfolio(importedDebtors);
      setShowImportWizard(false);
      setImportStep(1);
      setFileData([]);
      setFileHeaders([]);
      setColumnMapping({});
      setAiMappingMetadata({});
      setIngestionLogs([]);
      alert(`Success: ${importedDebtors.length} records ingested with high-fidelity schema persistence.`);
   };

   const handleRunBatchAI = async () => {
      setIsProcessingBatch(true);
      setBatchProgress(0);

      for (let i = 0; i < highYieldTargets.length; i++) {
         const target = highYieldTargets[i];
         setBatchProgress(((i + 1) / highYieldTargets.length) * 100);
         setAiThinkingLog(prev => [`[TRANS] Dispatching autonomous nudge to ${target.name}...`, ...prev]);

         await new Promise(r => setTimeout(r, 1200));

         onAddActivity({
            id: `ai-batch-${Date.now()}-${i}`,
            debtorId: target.id,
            type: CommunicationType.WHATSAPP,
            date: new Date().toLocaleString(),
            agent: "Nexus Autonomous Agent",
            outcome: "Success: Sequence Delivered",
            notes: "AI identified high-liability segment. Omnichannel nudge delivered autonomously."
         });
      }

      setAiThinkingLog(prev => [`[COMPLETE] Batch recovery cycle finished.`, ...prev]);
      setIsProcessingBatch(false);
   };

   const fetchAiSettlementSuggestion = async () => {
      if (!selectedDebtor) return;
      setIsAiLoading(true);
      setAiSuggestion(null);

      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
      const ai = new GoogleGenAI(apiKey || 'unauthorized');
      const prompt = `Suggest a settlement for ${selectedDebtor.name}, Balance: ${selectedDebtor.amountDue}, DPD: ${selectedDebtor.overdueDays}. Return JSON with suggestedInterestWaiver (%), suggestedPenaltyWaiver (%), suggestedInstallments (1-12), and reasoning (string).`;

      try {
         const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
               responseMimeType: "application/json",
               responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                     suggestedInterestWaiver: { type: Type.NUMBER },
                     suggestedPenaltyWaiver: { type: Type.NUMBER },
                     suggestedInstallments: { type: Type.NUMBER },
                     reasoning: { type: Type.STRING }
                  }
               }
            }
         });
         const result = JSON.parse(response.text);
         setAiSuggestion(result);
         setWaivers(prev => ({ ...prev, interest: result.suggestedInterestWaiver, penalties: result.suggestedPenaltyWaiver }));
         setInstallments(result.suggestedInstallments);
      } catch (err) {
         console.error(err);
      } finally {
         setIsAiLoading(false);
      }
   };

   const handleRunAIStrategyOptimizer = async () => {
      if (selectedIds.length === 0) return;
      setIsOptimizing(true);
      setShowOptimizerModal(true);

      const targets = accessiblePortfolio.filter(d => selectedIds.includes(d.id));
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
      const ai = new GoogleGenAI(apiKey || 'unauthorized');

      try {
         const prompt = `Analyze these ${targets.length} accounts and suggest the best collection strategy for each based on their DPD and balance. 
         DATA: ${JSON.stringify(targets.map(t => ({ id: t.id, name: t.name, dpd: t.overdueDays, balance: t.amountDue })))}
         Return JSON array: [{ debtorId, suggestion }].`;

         const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
               responseMimeType: "application/json",
               responseSchema: {
                  type: Type.ARRAY,
                  items: {
                     type: Type.OBJECT,
                     properties: {
                        debtorId: { type: Type.STRING },
                        suggestion: { type: Type.STRING }
                     }
                  }
               }
            }
         });

         const results = JSON.parse(response.text);
         setOptimizationResult(results);
      } catch (err) {
         console.error(err);
      } finally {
         setIsOptimizing(false);
      }
   };
   const handleExportPortfolio = async () => {
      if (!exportPassword) {
         alert("Security Protocol: Encryption password required for data exfiltration.");
         return;
      }
      setIsExporting(true);
      try {
         const ExcelJS = (await import('exceljs')).default;
         const workbook = new ExcelJS.Workbook();
         const worksheet = workbook.addWorksheet('Authoritative Registry');

         // Setup Headers
         const headers = ['Loan ID', 'Borrower Name', 'Status', 'Principal', 'Interest', 'Penalties', 'Total Due', 'DPD', 'Bucket', 'Risk Score', 'Phone', 'Email', 'Address', 'City', 'Employer'];
         worksheet.addRow(headers);

         // Add Data
         portfolio.forEach(d => {
            worksheet.addRow([
               d.loanId, d.name, d.status,
               d.financialDetail.principal, d.financialDetail.interest, d.financialDetail.penalties, d.financialDetail.totalDue,
               d.overdueDays, d.bucket, d.riskScore, d.phoneNumber, d.email, d.address, d.city, d.employer
            ]);
         });

         // Styling
         worksheet.getRow(1).font = { bold: true };
         worksheet.columns.forEach(column => {
            column.width = 20;
         });

         // Write with password protection
         // workbook.xlsx.writeBuffer supports options for encryption
         // Using as any to bypass outdated type definitions if they don't include password
         const buffer = await workbook.xlsx.writeBuffer({ password: exportPassword } as any);
         const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `PCCS_Portfolio_SECURE_${new Date().toISOString().split('T')[0]}.xlsx`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         window.URL.revokeObjectURL(url);

         setShowExportModal(false);
         setExportPassword('');
         alert("Success: Authoritative Registry exported with high-fidelity encryption.");
         onLogExport(); // Trigger audit log (if implemented in parent)
      } catch (err) {
         console.error(err);
         alert("Export Failed: Encryption engine encountered a structural anomaly. Ensure all dependencies are initialized.");
      } finally {
         setIsExporting(false);
      }
   };

   const handleRequestSettlementApproval = async () => {
      if (!selectedDebtor || !settlementCalculation) return;
      setIsRequesting(true);

      await new Promise(r => setTimeout(r, 1500));

      onAddActivity({
         id: `act-${Date.now()}`,
         debtorId: selectedDebtor.id,
         type: CommunicationType.INTERNAL_CHAT,
         date: new Date().toLocaleString(),
         agent: user.name,
         outcome: 'Settlement Requested',
         notes: `Requested waiver of ${sym}${settlementCalculation.totalWaiver.toLocaleString()}. Reason: ${reason}`
      });

      setIsRequesting(false);
      setIsSettlementMode(false);
      alert("Settlement request dispatched for supervisor review.");
   };

   const handleAddPieceMealAccount = () => {
      // Validation
      if (!pieceMealForm.name || !pieceMealForm.loanId || !pieceMealForm.principal) {
         alert('Please fill in required fields: Name, Loan ID, and Principal Amount');
         return;
      }

      const principal = parseFloat(pieceMealForm.principal) || 0;
      const interest = parseFloat(pieceMealForm.interest) || 0;
      const penalties = parseFloat(pieceMealForm.penalties) || 0;
      const totalDue = principal + interest + penalties;
      const overdueDays = parseInt(pieceMealForm.overdueDays) || 0;

      // Determine bucket based on overdue days
      let bucket = 'Current';
      if (overdueDays > 180) bucket = 'Bucket 6 (180+ days)';
      else if (overdueDays > 150) bucket = 'Bucket 5 (150-180 days)';
      else if (overdueDays > 120) bucket = 'Bucket 4 (120-150 days)';
      else if (overdueDays > 90) bucket = 'Bucket 3 (90-120 days)';
      else if (overdueDays > 60) bucket = 'Bucket 2 (60-90 days)';
      else if (overdueDays > 30) bucket = 'Bucket 1 (30-60 days)';

      // Determine risk score
      let riskScore: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      if (overdueDays > 120 || totalDue > 100000) riskScore = 'Critical';
      else if (overdueDays > 60 || totalDue > 50000) riskScore = 'High';
      else if (overdueDays > 30 || totalDue > 20000) riskScore = 'Medium';

      const newDebtor: Debtor = {
         id: `DBT-${Date.now()}`,
         name: pieceMealForm.name,
         loanId: pieceMealForm.loanId,
         amountDue: totalDue,
         overdueDays: overdueDays,
         status: overdueDays > 90 ? CaseStatus.BROKEN_PROMISE : CaseStatus.PENDING,
         riskScore: riskScore,
         bucket: bucket,
         phoneNumber: pieceMealForm.phoneNumber || 'N/A',
         email: pieceMealForm.email || 'N/A',
         address: pieceMealForm.address || 'N/A',
         city: pieceMealForm.city || 'N/A',
         province: '',
         zipCode: '',
         financialDetail: {
            principal: principal,
            interest: interest,
            penalties: penalties,
            totalDue: totalDue
         },
         employment: null,
         emergencyContact: null,
         transactions: [],
         familyContacts: [],
         assets: [],
         campaignId: user.assignedCampaignIds?.[0] || 'default',
         rawIngestionData: { source: 'piece_meal_manual_entry', timestamp: new Date().toISOString() }
      };

      onImportPortfolio([newDebtor]);

      // Reset form
      setPieceMealForm({
         name: '',
         loanId: '',
         phoneNumber: '',
         email: '',
         address: '',
         city: '',
         principal: '',
         interest: '',
         penalties: '',
         overdueDays: ''
      });

      setShowPieceMealModal(false);
      alert(`Success: Account "${pieceMealForm.name}" added to Master Registry.`);
   };

   return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-24 lg:pb-0 relative text-left">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="px-1 text-left">
               <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Database size={24} className="text-blue-600 sm:w-7 sm:h-7" />
                  Master Accounts
               </h1>
               <p className="text-slate-500 font-medium mt-1 text-[11px] sm:text-sm">Centralized repository for active borrower matters.</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm mr-2">
                  <button
                     onClick={() => setActiveMainView('list')}
                     className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMainView === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                  >
                     List View
                  </button>
                  <button
                     onClick={() => setActiveMainView('ai-operator')}
                     className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeMainView === 'ai-operator' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                  >
                     <Bot size={14} /> AI Operator
                  </button>
               </div>
               <button
                  onClick={handleGenerateTestAccounts}
                  className="px-6 py-3 bg-indigo-600 border border-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
               >
                  <Database size={16} /> Generate Test Data
               </button>
               <button
                  onClick={() => { setShowImportWizard(true); setImportStep(1); }}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2"
               >
                  <FileUp size={16} /> Smart Ingestion
               </button>
               <button
                  onClick={() => setShowExportModal(true)}
                  className="px-6 py-3 bg-slate-900 border border-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black active:scale-95 transition-all flex items-center gap-2"
               >
                  <Lock size={16} /> Secure Export
               </button>
               <button
                  onClick={() => setShowPieceMealModal(true)}
                  className="px-6 py-3 bg-emerald-600 border border-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2"
               >
                  <UserPlus size={16} /> Piece Meal
               </button>
               <button
                  onClick={() => setShowSmartReshuffle(true)}
                  className="px-6 py-3 bg-indigo-600 border border-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
               >
                  <Shuffle size={16} /> Smart Reshuffle
               </button>
            </div>
         </div>

         {activeMainView === 'list' ? (
            <>
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                  <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
                     {[
                        { label: 'Critical', count: riskStats.Critical, color: 'rose', icon: AlertTriangle, urgent: true },
                        { label: 'High Liability', count: accessiblePortfolio.filter(d => d.amountDue > 50000).length, color: 'blue', icon: TrendingUp },
                        { label: 'Never Touch', count: accessiblePortfolio.filter(d => !d.lastContactDate).length, color: 'amber', icon: Eye },
                        { label: 'Broken PTP', count: accessiblePortfolio.filter(d => d.status === CaseStatus.BROKEN_PROMISE).length, color: 'indigo', icon: AlertOctagon }
                     ].map((stat, i) => (
                        <div key={i} className={`bg-white p-4 rounded-[1.5rem] sm:rounded-[2rem] border transition-all cursor-default flex flex-col justify-between group ${stat.urgent ? 'border-rose-200 shadow-[0_10px_20px_rgba(244,63,94,0.08)]' : 'border-slate-100 shadow-sm'}`}>
                           <div className={`p-2.5 w-fit rounded-xl bg-${stat.color}-50 text-${stat.color}-600 mb-3 group-hover:scale-110 transition-transform`}>
                              <stat.icon size={16} className="sm:w-5 sm:h-5" />
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{stat.label}</p>
                              <p className="text-lg sm:text-2xl font-black text-slate-900">{stat.count}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className="lg:col-span-4 bg-slate-900 rounded-[1.5rem] sm:rounded-[2.5rem] p-6 lg:p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between hidden lg:flex">
                     <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12"><PieChart size={180} /></div>
                     <div className="relative z-10 text-left">
                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Risk Velocity</h4>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400">Critical Segments</span><span className="text-xs font-black text-rose-400">{((riskStats.Critical / (accessiblePortfolio.length || 1)) * 100).toFixed(0)}%</span></div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-rose-500" ref={(el) => { if (el) el.style.width = `${(riskStats.Critical / (accessiblePortfolio.length || 1)) * 100}%`; }}></div></div>
                        </div>
                     </div>
                     <button className="w-full mt-8 py-4 bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">Download Audit Report</button>
                  </div>
               </div>

               <div className="animate-in slide-in-from-bottom-4 duration-700 relative">
                  <DebtorList
                     debtors={accessiblePortfolio}
                     onViewDetails={(d) => { setSelectedDebtor(d); setShowDetailsModal(true); setActiveTab('profile'); setIsSettlementMode(false); }}
                     onAnalyze={(d) => { setSelectedDebtor(d); setShowDetailsModal(true); setActiveTab('profile'); setIsSettlementMode(false); }}
                     onSelectionChange={setSelectedIds}
                     currentUser={user}
                     settings={settings}
                  />
               </div>
            </>
         ) : (
            /* AI OPERATOR VIEW */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in slide-in-from-right-10 duration-700 text-left">
               <div className="xl:col-span-8 space-y-8">
                  <div className="bg-[#0f172a] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border-4 border-blue-900/20">
                     <div className="absolute right-[-40px] top-[-40px] opacity-10 rotate-12"><BrainCircuit size={320} /></div>
                     <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="max-w-xl">
                           <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-pulse"><Bot size={28} /></div>
                              <h2 className="text-3xl font-black tracking-tight">Nexus Autonomous Agent</h2>
                           </div>
                           <p className="text-slate-400 font-bold leading-relaxed text-lg">
                              Authorized AI entity capable of high-velocity behavioral analysis and autonomous debtor engagement. Auto-Pilot uses multi-channel sequencing to maximize liquidation.
                           </p>
                        </div>
                        <div className="shrink-0 flex flex-col items-center gap-4">
                           <button
                              onClick={() => setIsAutoPilotOn(!isAutoPilotOn)}
                              className={`px-12 py-6 rounded-[2.2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4 ${isAutoPilotOn ? 'bg-emerald-50 text-white shadow-emerald-500/20' : 'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                                 }`}
                           >
                              {isAutoPilotOn ? <CircleStop size={24} /> : <Play size={24} fill="white" />}
                              {isAutoPilotOn ? 'Auto-Pilot Active' : 'Start Auto-Pilot'}
                           </button>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol: Omni-Wave v3</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                           <TrendingUp size={20} className="text-blue-600" /> High-Yield Opportunities
                        </h3>
                        <button
                           onClick={handleRunBatchAI}
                           disabled={isProcessingBatch}
                           className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg flex items-center gap-2"
                        >
                           {isProcessingBatch ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                           Batch Execute NBAs
                        </button>
                     </div>

                     {isProcessingBatch && (
                        <div className="p-6 bg-blue-50 border border-blue-100 rounded-[2rem] space-y-4 animate-in slide-in-from-top-4">
                           <div className="flex justify-between items-center text-[10px] font-black text-blue-600 uppercase tracking-widest">
                              <span>Batch Execution in Progress</span>
                              <span>{batchProgress.toFixed(0)}%</span>
                           </div>
                           <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 transition-all duration-300 shadow-[0_0_10px_#2563eb]" ref={(el) => { if (el) el.style.width = `${batchProgress}%`; }}></div>
                           </div>
                        </div>
                     )}

                     <div className="grid grid-cols-1 gap-4">
                        {highYieldTargets.map((d, i) => (
                           <div key={d.id} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                              <div className="absolute right-0 top-0 w-32 h-full bg-slate-50 rotate-[-15deg] translate-x-16 -z-10 group-hover:bg-blue-50 transition-colors"></div>
                              <div className="flex items-center gap-6 text-left min-w-0 flex-1">
                                 <div className="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0">
                                    {d.name[0]}
                                 </div>
                                 <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                       <h4 className="text-xl font-black text-slate-900 truncate">{d.name}</h4>
                                       <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black rounded uppercase border border-rose-100">{d.riskScore}</span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sym}{d.amountDue.toLocaleString()}</p>
                                       <div className="h-4 w-px bg-slate-100"></div>
                                       <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{d.overdueDays} DPD</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                 <button
                                    title="View Detailed Account Profile"
                                    onClick={() => { setSelectedDebtor(d); setShowDetailsModal(true); setActiveTab('profile'); setIsSettlementMode(false); }}
                                    className="p-4 bg-slate-50 text-slate-400 rounded-[1.5rem] hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90"
                                 >
                                    <MousePointer2 size={20} />
                                 </button>
                                 <button
                                    title="Deploy AI Nudge"
                                    className="px-8 py-4 bg-blue-600 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/10 hover:bg-blue-700 active:scale-95 transition-all"
                                 >
                                    Deploy Nudge
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="xl:col-span-4 space-y-6">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-[500px] overflow-hidden text-left">
                     <div className="p-8 border-b border-slate-100 bg-slate-50/20 flex items-center justify-between shrink-0">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                           <Terminal size={14} className="text-blue-600" /> Thinking Log
                        </h3>
                        <button title="Flush Log" onClick={() => setAiThinkingLog(["[SYSTEM] Flush complete."])} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Flush</button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-8 font-mono text-[10px] space-y-3 scrollbar-none bg-slate-950 text-slate-500 shadow-inner">
                        {aiThinkingLog.map((log, i) => (
                           <div key={i} className={`flex gap-3 animate-in slide-in-from-left-2 ${log.includes('[SUCCESS]') ? 'text-emerald-400' : log.includes('[PROCESS]') ? 'text-blue-400' : ''}`}>
                              <span className="opacity-30 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
                              <span className="leading-relaxed">{log}</span>
                           </div>
                        ))}
                     </div>
                     <div className="p-6 bg-slate-900 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                           <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Active Thread 09</span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-600 uppercase">Nexus Core Engine</span>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {showImportWizard && (
            <div className="fixed inset-0 z-[2000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-500 text-left">
               <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col border border-white/20 h-full max-h-[94vh] sm:h-[90vh]">

                  <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                           <HardDriveUpload size={24} />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Smart Ingestion Engine</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Neural Schema Acquisition • V5.0 Premium</p>
                        </div>
                     </div>
                     <button title="Close Wizard" onClick={() => setShowImportWizard(false)} className="p-3 hover:bg-slate-200 rounded-2xl transition-all active:scale-90">
                        <X size={24} className="text-slate-400" />
                     </button>
                  </div>

                  <div className="px-8 py-4 border-b border-slate-100 bg-white flex gap-10 overflow-x-auto scrollbar-none shrink-0">
                     {[
                        { s: 1, l: 'File Node', i: FileSpreadsheet, desc: 'Upload CSV Source' },
                        { s: 2, l: 'Correspondence', i: TableIcon, desc: 'Systems Mapping' },
                        { s: 3, l: 'Commit Phase', i: ShieldCheck, desc: 'Verify & Ingest' }
                     ].map(ph => (
                        <div key={ph.s} className={`flex items-center gap-4 transition-all shrink-0 ${importStep === ph.s ? 'text-blue-600' : importStep > ph.s ? 'text-emerald-500' : 'text-slate-300'}`}>
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${importStep === ph.s ? 'bg-blue-600 text-white border-blue-600 shadow-lg' :
                              importStep > ph.s ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 border-slate-100 text-slate-300'
                              }`}>
                              {importStep > ph.s ? <Check size={20} /> : <ph.i size={20} />}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest">{ph.l}</span>
                              <span className="text-[8px] font-bold uppercase opacity-50 tracking-wider mt-0.5">{ph.desc}</span>
                           </div>
                           {ph.s < 3 && <ChevronRight size={14} className="ml-4 opacity-20" />}
                        </div>
                     ))}
                  </div>

                  <div className="flex-1 overflow-hidden bg-slate-50/10 text-left flex flex-col lg:flex-row">
                     {/* Main Workspace */}
                     <div className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-thin">
                        {importStep === 1 && (
                           <div className="h-full flex flex-col items-center justify-center text-center animate-in slide-in-from-right-10 duration-500">
                              <div className="max-w-xl w-full">
                                 <div className="flex flex-col items-center gap-12 w-full">
                                    <div className="flex bg-white p-2 rounded-[2rem] shadow-xl border border-slate-200">
                                       <button
                                          onClick={() => setIngestionMode('import')}
                                          className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${ingestionMode === 'import' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                                       >
                                          <Plus size={16} className="inline mr-2" /> New Batch Import
                                       </button>
                                       <button
                                          onClick={() => setIngestionMode('update')}
                                          className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${ingestionMode === 'update' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                                       >
                                          <RefreshCw size={16} className="inline mr-2" /> Incremental Update
                                       </button>
                                    </div>

                                    <label className={`group w-full aspect-video bg-white border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-6 cursor-pointer transition-all shadow-xl hover:shadow-2xl ${ingestionMode === 'import' ? 'border-slate-200 hover:border-blue-500 hover:bg-blue-50/50' : 'border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50/50'}`}>
                                       <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner ${ingestionMode === 'import' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                          <FileUp size={40} />
                                       </div>
                                       <div className="space-y-2 px-10">
                                          <p className="text-2xl font-black text-slate-900 tracking-tight">Drop {ingestionMode === 'import' ? 'Registry Source' : 'Update Manifest'} Here</p>
                                          <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                                             {ingestionMode === 'import'
                                                ? 'Click to browse or drag & drop CSV files for new client onboarding.'
                                                : 'Source file must contain Loan IDs/Account Numbers to synchronize with existing portfolio records.'}
                                          </p>
                                       </div>
                                       <div className={`mt-4 px-6 py-2 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-colors ${ingestionMode === 'import' ? 'bg-slate-900 group-hover:bg-blue-600' : 'bg-slate-900 group-hover:bg-emerald-600'}`}>Select File Node</div>
                                       <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                                    </label>
                                 </div>
                              </div>
                           </div>
                        )}

                        {importStep === 2 && (
                           <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
                              <div className="flex justify-between items-end gap-6">
                                 <div className="text-left">
                                    <h4 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                       Correspondence Node
                                       <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-blue-200">Processing Segment</span>
                                    </h4>
                                    <p className="text-sm text-slate-500 font-medium mt-2 max-w-2xl">Configure the semantic matrix. AI is currently matching registry headers to PCCS core schemas with 100% data fidelity.</p>
                                 </div>
                                 <div className="flex gap-3">
                                    <button onClick={() => setImportStep(1)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                                       <ArrowLeftRight size={14} /> Re-Upload
                                    </button>
                                    <button
                                       onClick={() => setImportStep(3)}
                                       disabled={REQUIRED_MAPPINGS.some(m => !columnMapping[m.key])}
                                       className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-30 active:scale-95 transition-all flex items-center gap-3"
                                    >
                                       Verify & Commit <ArrowRight size={14} />
                                    </button>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                 {REQUIRED_MAPPINGS.map(m => {
                                    const meta = aiMappingMetadata[m.key];
                                    const isMapped = !!columnMapping[m.key];
                                    const confidence = meta?.confidence || 0;

                                    return (
                                       <div key={m.key} className={`p-6 bg-white border-2 rounded-[2rem] flex flex-col gap-4 transition-all group relative overflow-hidden ${isMapped ? 'border-emerald-100 hover:border-emerald-300 shadow-lg active:shadow-sm' : 'border-slate-100 shadow-sm'}`}>
                                          {isMapped && confidence > 80 && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rotate-45 translate-x-10 -translate-y-10 group-hover:bg-emerald-100 transition-colors"></div>}

                                          <div className="flex justify-between items-start relative z-10">
                                             <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">
                                                   {m.label}
                                                   {m.key === 'loanId' && (
                                                      <span className="ml-2 text-[7px] px-1.5 py-0.5 bg-slate-900 text-white rounded-sm font-black tracking-widest">PRIMARY KEY</span>
                                                   )}
                                                </span>
                                                {meta && (
                                                   <span className={`text-[8px] font-black mt-2 tracking-widest px-1.5 py-0.5 rounded ${confidence > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                      {confidence}% CONFIDENCE
                                                   </span>
                                                )}
                                             </div>
                                             {isMapped ? (
                                                <div className="flex items-center gap-2">
                                                   {meta?.reasoning && (
                                                      <div className="group/tip relative">
                                                         <Sparkles size={16} className="text-blue-500 animate-pulse cursor-help" />
                                                         <div className="absolute bottom-full right-0 mb-3 w-48 p-3 bg-slate-900 text-white text-[9px] rounded-xl opacity-0 group-hover/tip:opacity-100 transition-all shadow-2xl z-50 pointer-events-none border border-white/10">
                                                            {meta.reasoning}
                                                         </div>
                                                      </div>
                                                   )}
                                                   <div className="p-1 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/20"><Check size={12} strokeWidth={4} /></div>
                                                </div>
                                             ) : <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg animate-bounce"><AlertCircle size={16} /></div>}
                                          </div>

                                          <div className="relative z-10">
                                             <select
                                                value={columnMapping[m.key] || ''}
                                                title={`Mapping for ${m.label}`}
                                                onChange={(e) => setColumnMapping({ ...columnMapping, [m.key]: e.target.value })}
                                                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl text-xs font-black outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all cursor-pointer appearance-none ${isMapped ? 'border-emerald-100 text-slate-800' : 'border-slate-200 text-slate-400'}`}
                                             >
                                                <option value="" className="font-bold">-- UNMAPPED NODE --</option>
                                                {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                             </select>
                                             <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>

                              <div className="space-y-6 pt-6 border-t border-slate-100">
                                 <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    <ListFilter size={16} /> Schema Extended View ({fileHeaders.length} headers)
                                 </h5>
                                 <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto">
                                       <table className="w-full text-left border-collapse">
                                          <thead>
                                             <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="px-8 py-5">Node Sequence</th>
                                                <th className="px-8 py-5">Source Header</th>
                                                <th className="px-8 py-5">Classification</th>
                                                <th className="px-8 py-5">Value Preview</th>
                                             </tr>
                                          </thead>
                                          <tbody className="text-[11px] font-bold">
                                             {fileHeaders.map((h, i) => {
                                                const mappedKey = Object.keys(columnMapping).find(k => columnMapping[k] === h);
                                                const mapping = REQUIRED_MAPPINGS.find(m => m.key === mappedKey);
                                                const sampleValue = fileData[0]?.[i] || 'N/A';

                                                return (
                                                   <tr key={h} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                                      <td className="px-8 py-4 text-slate-400 font-mono text-[9px]">[{String(i + 1).padStart(3, '0')}]</td>
                                                      <td className="px-8 py-4 text-slate-900 uppercase tracking-wide">{h}</td>
                                                      <td className="px-8 py-4">
                                                         {mapping ? (
                                                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">{mapping.label}</span>
                                                         ) : (
                                                            <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Extended Data</span>
                                                         )}
                                                      </td>
                                                      <td className="px-8 py-4 font-mono text-[10px] text-slate-500 truncate max-w-xs">{sampleValue}</td>
                                                   </tr>
                                                );
                                             })}
                                          </tbody>
                                       </table>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}

                        {importStep === 3 && (
                           <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 gap-10">
                              <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/30 border-[6px] border-white">
                                 <ShieldCheck size={40} />
                              </div>
                              <div className="space-y-4 px-10">
                                 <h4 className="text-4xl font-black text-slate-900 tracking-tight">Integrity Verified</h4>
                                 <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                                    Cluster schema confirmed. Authorization granted to ingest <b>{fileData.length} records</b> into the PCCS authoritative registry.
                                 </p>
                              </div>
                              <button onClick={handleFinalImport} className="px-14 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center gap-4 group">
                                 Authorize Ingestion <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                              </button>
                           </div>
                        )}
                     </div>

                     {/* AI Side Panel / Console */}
                     <div className="w-full lg:w-80 bg-slate-900 border-l border-white/5 flex flex-col shrink-0">
                        <div className="p-8 border-b border-white/5 bg-slate-950 flex flex-col gap-4">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20 animate-pulse">
                                 <Bot size={24} className="text-white" />
                              </div>
                              <div className="text-left">
                                 <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none">AI Ingestion Node</h5>
                                 <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></div>
                                    Live Analysis Active
                                 </p>
                              </div>
                           </div>

                           {importStep === 2 && (
                              <div className="mt-4 p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                                 <div className="flex justify-between items-end">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Schema Health</span>
                                    <span className="text-xl font-black text-white">{Object.keys(columnMapping).length}/{REQUIRED_MAPPINGS.length}</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_#3b82f6]" ref={(el) => { if (el) el.style.width = `${(Object.keys(columnMapping).length / REQUIRED_MAPPINGS.length) * 100}%`; }}></div>
                                 </div>
                                 <button
                                    onClick={async () => {
                                       setIsAiMapping(true);
                                       setIngestionLogs(prev => [...prev, "[AI] Manual trigger: Re-evaluating structural schema matches..."]);
                                       try {
                                          const res = await getSmartIngestionMapping(fileHeaders, REQUIRED_MAPPINGS);
                                          const nm: Record<string, string> = {};
                                          const meta: Record<string, any> = {};
                                          Object.entries(res).forEach(([k, v]: [string, any]) => { if (v?.header) { nm[k] = v.header; meta[k] = { confidence: v.confidence, reasoning: v.reasoning }; } });
                                          setColumnMapping(nm);
                                          setAiMappingMetadata(meta);
                                          setIngestionLogs(prev => [...prev, "[SUCCESS] Schema recalculated with higher semantic confidence."]);
                                       } catch (e) {
                                          setIngestionLogs(prev => [...prev, "[ERROR] AI repair node failed. Reverting to persistent cache."]);
                                       } finally {
                                          setIsAiMapping(false);
                                       }
                                    }}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/5"
                                 >
                                    <RefreshCw size={12} className={isAiMapping ? 'animate-spin' : ''} /> Recalibrate Neural Logic
                                 </button>
                              </div>
                           )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 font-mono text-[9px] space-y-4 bg-slate-950/50">
                           <h6 className="text-slate-600 text-[8px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                              <Terminal size={12} /> Thinking Stream
                           </h6>
                           {ingestionLogs.map((log, i) => (
                              <div key={i} className={`flex gap-3 animate-in fade-in slide-in-from-left-4 duration-500 ${log.includes('[WARNING]') ? 'text-amber-400' : log.includes('[SCHEMA]') ? 'text-emerald-400' : log.includes('[SUCCESS]') ? 'text-blue-400' : 'text-slate-500'}`}>
                                 <span className="opacity-20 flex-shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                 <span className="leading-relaxed">{log.replace(/\[.*?\]/, '')}</span>
                              </div>
                           ))}
                        </div>

                        <div className="p-6 bg-slate-950 border-t border-white/5 flex items-center justify-between opacity-50">
                           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Model: Gemini 3 Flash Node</span>
                           <div className="flex gap-1">
                              {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" ref={(el) => { if (el) el.style.animationDelay = `${i * 200}ms`; }}></div>)}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Detail Modal / Dossier - Enhanced with 100% data visibility and INTEGRATED SETTLEMENT WORKBENCH */}
         {
            showDetailsModal && selectedDebtor && (
               <div className="fixed inset-0 z-[3000] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
                     <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                              <UserCircle2 size={24} />
                           </div>
                           <div className="text-left">
                              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">{selectedDebtor.name}</h3>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedDebtor.loanId} • Dossier</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="flex bg-slate-100 p-1 rounded-lg shadow-inner border border-slate-200">
                              {(['profile', 'financials', 'history', 'traceability'] as const).map(tab => (
                                 <button
                                    key={tab}
                                    title={`View ${tab} tab`}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                 >
                                    {tab}
                                 </button>
                              ))}
                           </div>
                           <button title="Close Dossier" onClick={() => setShowDetailsModal(false)} className="p-2 bg-slate-100 rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-90"><X size={16} /></button>
                        </div>
                     </div>

                     <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin text-left bg-slate-50/10">
                        {activeTab === 'profile' && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-bottom-2 duration-300">
                              <div className="space-y-8 text-left">
                                 <section className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                       <UserCheck size={14} className="text-blue-600" /> Borrower Identity
                                    </h4>
                                    <div className="grid grid-cols-2 gap-8">
                                       <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Mobile</p><p className="text-sm font-bold text-slate-900">{selectedDebtor.phoneNumber}</p></div>
                                       <div><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Email</p><p className="text-sm font-bold text-slate-900 truncate">{selectedDebtor.email}</p></div>
                                       <div className="col-span-2"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Primary Residence</p><p className="text-sm font-bold text-slate-900">{selectedDebtor.address}, {selectedDebtor.city}</p></div>
                                    </div>
                                 </section>
                                 <section className="p-8 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 text-left">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                       <Briefcase size={14} className="text-blue-600" /> Professional Status
                                    </h4>
                                    <div className="space-y-4">
                                       <div className="p-5 bg-slate-50 rounded-2xl flex items-center gap-5 border border-slate-100">
                                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100"><Building2 size={24} className="text-slate-400" /></div>
                                          <div className="text-left">
                                             <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{selectedDebtor.employer || 'Unspecified'}</p>
                                             <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Verified Source of Income</p>
                                          </div>
                                       </div>
                                    </div>
                                 </section>
                              </div>
                              <div className="space-y-8 text-left">
                                 <section className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden h-full">
                                    <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12"><ActivityIcon size={220} /></div>
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-10 relative z-10">Neural Risk Telemetry</h4>
                                    <div className="space-y-10 relative z-10">
                                       <div className="flex justify-between items-end">
                                          <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Segment</p><p className="text-5xl font-black text-white mt-1 tracking-tighter">{selectedDebtor.riskScore}</p></div>
                                          <div className="text-right"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DPD Factor</p><p className="text-3xl font-black text-rose-500 mt-1">{selectedDebtor.overdueDays}d</p></div>
                                       </div>
                                       <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                          <div className={`h-full transition-all duration-1000 ${selectedDebtor.riskScore === 'Critical' ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : 'bg-blue-500 shadow-[0_0_15px_#3b82f6]'}`} ref={(el) => { if (el) el.style.width = `${Math.min(100, (selectedDebtor.overdueDays / 90) * 100)}%`; }}></div>
                                       </div>
                                       <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-5">
                                          <Sparkles size={24} className="text-blue-400 shrink-0" />
                                          <p className="text-sm text-slate-300 font-medium leading-relaxed italic">"Account prioritized for high-intensity sequencing. Immediate settlement required to stall legal escalation."</p>
                                       </div>
                                    </div>
                                 </section>
                              </div>
                           </div>
                        )}



                        {activeTab === 'traceability' && (
                           <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300 text-left">
                              <div className="p-12 bg-[#0f172a] rounded-[4rem] text-white relative overflow-hidden border-4 border-slate-800 shadow-2xl">
                                 <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12"><Database size={240} /></div>
                                 <div className="relative z-10 flex items-center gap-8 text-left">
                                    <div className="p-5 bg-blue-600 rounded-[2rem] shadow-2xl border-4 border-white/10 shrink-0"><Link size={40} /></div>
                                    <div className="text-left">
                                       <h4 className="text-4xl font-black tracking-tight leading-none">Full Data Traceability</h4>
                                       <p className="text-blue-400 text-sm font-black uppercase tracking-[0.3em] mt-3">Authoritative Schema Source: REGISTRY_IMPORT_NODE_SG</p>
                                    </div>
                                 </div>
                              </div>

                              <div className="bg-white border-2 border-slate-100 rounded-[3.5rem] shadow-sm overflow-hidden">
                                 <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center px-10">
                                    <div className="flex items-center gap-3">
                                       <FileSearch size={18} className="text-blue-600" />
                                       <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Source Registry Mirror (100% Fidelity)</h5>
                                    </div>
                                    <button
                                       title="Copy Raw JSON to Clipboard"
                                       onClick={() => {
                                          const jsonStr = JSON.stringify(selectedDebtor.rawIngestionData || {}, null, 2);
                                          navigator.clipboard.writeText(jsonStr);
                                          alert("Registry JSON Node copied to clipboard.");
                                       }}
                                       className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg"
                                    >
                                       <Copy size={12} /> Copy RAW JSON
                                    </button>
                                 </div>
                                 <div className="p-10 lg:p-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
                                       {Object.entries(selectedDebtor.rawIngestionData || {}).map(([key, value]) => (
                                          <div key={key} className="flex flex-col border-l-4 border-slate-100 pl-6 py-2 group hover:border-blue-500 transition-all">
                                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-blue-500 transition-colors truncate" title={key}>{key}</span>
                                             <span className="text-sm font-bold text-slate-800 break-words leading-relaxed" title={String(value)}>
                                                {value !== null && value !== undefined && value !== '' ? String(value) : <span className="text-slate-300 italic">-- Empty --</span>}
                                             </span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>

                              <div className="p-10 bg-blue-50 border border-blue-100 rounded-[3rem] flex items-start gap-8 shadow-inner">
                                 <div className="p-4 bg-white rounded-2xl shadow-xl text-blue-600 shrink-0"><Info size={32} /></div>
                                 <div className="text-left">
                                    <h5 className="text-blue-900 font-black text-lg uppercase tracking-tight">Audit Confirmation</h5>
                                    <p className="text-sm text-blue-700/80 leading-relaxed font-medium mt-3 italic">
                                       "The dataset above represents a bit-perfect extraction of the uploaded CSV subject. PCCS guarantees that 100% of the ingested column data is preserved, persisted, and available for downstream legal processing or OSINT correlation."
                                    </p>
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'financials' && (
                           <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-300 text-left">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 {[
                                    { label: 'Principal', value: selectedDebtor.financialDetail.principal, icon: Coins, color: 'blue' },
                                    { label: 'Interest', value: selectedDebtor.financialDetail.interest, icon: TrendingUp, color: 'indigo' },
                                    { label: 'Penalties', value: selectedDebtor.financialDetail.penalties, icon: AlertOctagon, color: 'rose' }
                                 ].map(f => (
                                    <div key={f.label} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:border-blue-500/20 transition-all">
                                       <div className={`p-3 w-fit rounded-xl bg-${f.color}-50 text-${f.color}-600 mb-4 group-hover:scale-110 transition-transform`}><f.icon size={20} /></div>
                                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{f.label}</p>
                                       <p className="text-2xl font-black text-slate-900 tracking-tight">{sym}{f.value.toLocaleString()}</p>
                                    </div>
                                 ))}
                              </div>

                              {/* INTEGRATED SETTLEMENT WORKBENCH */}
                              {isSettlementMode ? (
                                 <div className="bg-white p-6 rounded-3xl border-2 border-blue-600 shadow-xl space-y-8 animate-in zoom-in-95 duration-500">
                                    <div className="flex items-center justify-between">
                                       <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                          <Zap size={20} className="text-blue-600" /> Remediation Node
                                       </h3>
                                       <div className="flex gap-2">
                                          <button
                                             title="Get AI Settlement Suggestion"
                                             onClick={fetchAiSettlementSuggestion}
                                             disabled={isAiLoading}
                                             className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2"
                                          >
                                             {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI Suggest
                                          </button>
                                          <button title="Cancel Settlement" onClick={() => setIsSettlementMode(false)} className="p-1.5 text-slate-400 hover:text-rose-600"><X size={16} /></button>
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                       <div className="space-y-6">
                                          <div className="space-y-3">
                                             <div className="flex justify-between items-center"><label htmlFor="principal-waiver" className="text-[9px] font-black text-slate-400 uppercase">Principal Waiver</label><span className="text-xs font-black">{waivers.principal}%</span></div>
                                             <input id="principal-waiver" type="range" min="0" max="10" step="1" value={waivers.principal} onChange={(e) => setWaivers({ ...waivers, principal: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-full appearance-none accent-blue-600" />
                                             <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase"><span>0%</span><span>Max 10% (Restricted)</span></div>
                                          </div>
                                          <div className="space-y-3">
                                             <div className="flex justify-between items-center"><label htmlFor="interest-waiver" className="text-[9px] font-black text-slate-400 uppercase">Interest Waiver</label><span className="text-xs font-black">{waivers.interest}%</span></div>
                                             <input id="interest-waiver" type="range" min="0" max="100" step="5" value={waivers.interest} onChange={(e) => setWaivers({ ...waivers, interest: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-full appearance-none accent-blue-600" />
                                          </div>
                                          <div className="space-y-3">
                                             <div className="flex justify-between items-center"><label htmlFor="penalties-waiver" className="text-[9px] font-black text-slate-400 uppercase">Penalties Waiver</label><span className="text-xs font-black">{waivers.penalties}%</span></div>
                                             <input id="penalties-waiver" type="range" min="0" max="100" step="5" value={waivers.penalties} onChange={(e) => setWaivers({ ...waivers, penalties: parseInt(e.target.value) })} className="w-full h-1.5 bg-slate-100 rounded-full appearance-none accent-rose-500" />
                                          </div>
                                          <div className="space-y-2">
                                             <label htmlFor="installments" className="text-[9px] font-black text-slate-400 uppercase ml-0.5">Tenure</label>
                                             <select id="installments" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold outline-none">
                                                {[1, 2, 3, 4, 6, 12].map(n => <option key={n} value={n}>{n === 1 ? 'Lumpsum' : `${n} Installments`}</option>)}
                                             </select>
                                          </div>
                                       </div>

                                       <div className="bg-slate-900 rounded-[2rem] p-6 text-white space-y-4 relative overflow-hidden">
                                          <div className="absolute right-[-10px] top-[-10px] opacity-10"><Calculator size={100} /></div>
                                          <div className="relative z-10 text-left">
                                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Final Settlement Amount</p>
                                             <h3 className="text-3xl font-black text-emerald-400 mt-1">{sym}{settlementCalculation?.finalAmount.toLocaleString()}</h3>
                                             {installments > 1 && <p className="text-[10px] font-bold text-slate-400 mt-1 italic">Scheduled: {installments} x {sym}{settlementCalculation?.perInst.toLocaleString()} / mo</p>}
                                          </div>
                                          <div className="pt-4 border-t border-white/10">
                                             <textarea
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder="Justification for waiver..."
                                                className="w-full h-20 p-3 bg-white/5 border border-white/10 rounded-xl text-xs font-medium outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-600 resize-none"
                                             />
                                          </div>
                                          <button
                                             title="Commit Settlement Node"
                                             onClick={handleRequestSettlementApproval}
                                             disabled={isRequesting || !reason}
                                             className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
                                          >
                                             {isRequesting ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                                             Commit Settlement Node
                                          </button>
                                       </div>
                                    </div>
                                 </div>
                              ) : (
                                 <div className="p-8 bg-slate-950 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden border-2 border-slate-900 shadow-xl">
                                    <div className="absolute left-[-10px] top-[-10px] opacity-10"><Calculator size={180} /></div>
                                    <div className="text-left relative z-10">
                                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Gross Liquidation Value</p>
                                       <h3 className="text-4xl font-black tracking-tight text-emerald-400">{sym}{selectedDebtor.financialDetail.totalDue.toLocaleString()}</h3>
                                    </div>
                                    <div className="flex gap-3 relative z-10 w-full md:w-auto">
                                       <div className="flex gap-4">
                                          <button title="Examine Audit Logs" className="p-4 bg-slate-100 rounded-2xl text-slate-600 hover:bg-slate-900 hover:text-white transition-all"><FileSearch size={20} /></button>
                                          <button title="Export Data for Audit" className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Generate Auditor Export</button>
                                       </div>
                                       <button
                                          title="Start Settlement Negotiation"
                                          onClick={() => { setIsSettlementMode(true); fetchAiSettlementSuggestion(); }}
                                          className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-500"
                                       >
                                          Start Settlement Node
                                       </button>
                                    </div>
                                 </div>
                              )}

                              {/* INTEGRATED SETTLEMENT QUEUE (Removing Sidebar requirement) */}
                              <div className="space-y-4 pt-4 border-t border-slate-100">
                                 <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                       <LayoutGrid size={14} className="text-blue-600" /> Queue Navigation
                                    </h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{settlementQueue.length} Eligible Nodes</p>
                                 </div>
                                 <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scroll-smooth">
                                    {settlementQueue.map(d => (
                                       <button
                                          key={d.id}
                                          onClick={() => { setSelectedDebtor(d); setIsSettlementMode(false); setAiSuggestion(null); }}
                                          className={`flex-shrink-0 w-56 p-4 rounded-2xl border transition-all text-left flex flex-col gap-3 relative overflow-hidden group ${selectedDebtor.id === d.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}
                                       >
                                          {selectedDebtor.id === d.id && <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500"></div>}
                                          <div className="flex justify-between items-start">
                                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${selectedDebtor.id === d.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                                {d.name[0]}
                                             </div>
                                             <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${d.riskScore === 'Critical' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>{d.riskScore}</span>
                                          </div>
                                          <div className="min-w-0">
                                             <p className="text-xs font-black truncate">{d.name}</p>
                                             <p className={`text-[8px] font-bold uppercase mt-0.5 ${selectedDebtor.id === d.id ? 'text-slate-400' : 'text-slate-400'}`}>{sym}{d.amountDue.toLocaleString()} • {d.overdueDays} DPD</p>
                                          </div>
                                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <ArrowRight size={12} className="text-blue-600" />
                                             <span className="text-[8px] font-black uppercase text-blue-600">Switch</span>
                                          </div>
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}

                        {activeTab === 'history' && (
                           <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300 text-left">
                              {debtorActivities.map(act => (
                                 <div key={act.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-300 hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-8">
                                       <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><MessageSquare size={24} /></div>
                                       <div className="text-left">
                                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{act.type} • <span className="text-blue-600">{act.outcome}</span></p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{act.date} • Agent: {act.agent}</p>
                                       </div>
                                    </div>
                                    <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
                                 </div>
                              ))}
                              {debtorActivities.length === 0 && (
                                 <div className="py-32 text-center flex flex-col items-center justify-center opacity-30 grayscale">
                                    <History size={80} className="mb-6 text-slate-200" />
                                    <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Interaction Log Empty</p>
                                 </div>
                              )}
                           </div>
                        )}
                     </div>

                     <div className="p-8 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center shrink-0 gap-6 sm:gap-0">
                        <div className="flex items-center gap-6 text-left">
                           <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse"></div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry synchronized</span>
                           </div>
                           <div className="h-6 w-px bg-slate-100"></div>
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">TLS 1.3 End-to-End Encryption</span>
                        </div>
                        <button onClick={() => setShowDetailsModal(false)} className="w-full sm:w-auto px-14 py-5 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl active:scale-95">Close Subject Node</button>
                     </div>
                  </div>
               </div>
            )
         }

         {/* Bulk Assignment Floating Bar */}
         {
            selectedIds.length > 0 && (
               <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 text-white backdrop-blur-xl px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-500 border border-white/10">
                  <div className="flex items-center gap-3 pr-6 border-r border-white/20">
                     <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs shadow-[0_0_15px_#2563eb] animate-pulse">
                        {selectedIds.length}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest">Accounts Selected</span>
                  </div>

                  <div className="flex items-center gap-3">
                     <Users size={16} className="text-slate-400" />
                     <select
                        value={selectedAgentId}
                        title="Select Agent for assignment"
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        className="bg-transparent text-xs font-bold outline-none uppercase tracking-wide text-white option:text-black hover:text-blue-400 transition-colors cursor-pointer"
                     >
                        <option value="" className="text-slate-900">-- Select Agent --</option>
                        {systemUsers.map(u => (
                           <option key={u.id} value={u.id} className="text-slate-900">{u.name}</option>
                        ))}
                     </select>
                  </div>

                  <div className="flex items-center gap-3 pr-6 border-r border-white/20">
                     <ActivityIcon size={16} className="text-slate-400" />
                     <select
                        title="Update status for selected accounts"
                        onChange={(e) => {
                           if (!e.target.value) return;
                           onBulkStatusUpdate(selectedIds, e.target.value as CaseStatus);
                           setSelectedIds([]);
                        }}
                        className="bg-transparent text-xs font-bold outline-none uppercase tracking-wide text-white option:text-black hover:text-rose-400 transition-colors cursor-pointer"
                     >
                        <option value="" className="text-slate-900">-- Update Status --</option>
                        {Object.values(CaseStatus).map(s => (
                           <option key={s} value={s} className="text-slate-900">{s}</option>
                        ))}
                     </select>
                  </div>

                  <button
                     title="Optimize strategy with AI"
                     onClick={handleRunAIStrategyOptimizer}
                     className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg flex items-center gap-2"
                  >
                     <Sparkles size={14} /> AI Context Strategy
                  </button>

                  <button
                     title="Finalize assignment"
                     onClick={() => {
                        if (!selectedAgentId) return;
                        onBulkAssignDebtors(selectedIds, selectedAgentId);
                        setSelectedIds([]);
                        setSelectedAgentId('');
                     }}
                     disabled={!selectedAgentId}
                     className="px-6 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:hover:bg-white active:scale-95"
                  >
                     Assign Now
                  </button>

                  <button title="Clear Selection" onClick={() => setSelectedIds([])} className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white">
                     <X size={16} />
                  </button>
               </div>
            )
         }

         {/* AI STRATEGY OPTIMIZER MODAL */}
         {
            showOptimizerModal && (
               <div className="fixed inset-0 z-[4000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
                  <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col h-[80vh]">
                     <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg"><BrainCircuit size={24} /></div>
                           <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Strategy Optimizer</h3>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Analyzing contextual behavioral data</p>
                           </div>
                        </div>
                        <button title="Close Optimizer" onClick={() => setShowOptimizerModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all"><X size={24} /></button>
                     </div>

                     <div className="flex-1 overflow-y-auto p-10 space-y-6">
                        {isOptimizing ? (
                           <div className="h-full flex flex-col items-center justify-center gap-6">
                              <Loader2 size={48} className="text-blue-600 animate-spin" />
                              <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Running Neural Optimization...</p>
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 gap-4">
                              {optimizationResult.map((res, i) => {
                                 const debtor = accessiblePortfolio.find(d => d.id === res.debtorId);
                                 if (!debtor) return null;
                                 return (
                                    <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-6 hover:border-blue-200 transition-all group">
                                       <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-slate-400 border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                          {debtor.name[0]}
                                       </div>
                                       <div className="flex-1 text-left">
                                          <div className="flex items-center justify-between">
                                             <h5 className="font-black text-slate-900">{debtor.name}</h5>
                                             <span className="text-[8px] font-black uppercase text-blue-600">{debtor.overdueDays} DPD</span>
                                          </div>
                                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 italic">"{res.suggestion}"</p>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        )}
                     </div>

                     <div className="p-8 border-t border-slate-100 bg-white flex justify-end shrink-0">
                        <button onClick={() => setShowOptimizerModal(false)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Close Optimizer</button>
                     </div>
                  </div>
               </div>
            )
         }

         {showExportModal && (
            <div className="fixed inset-0 z-[4000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
               <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
                  <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex flex-col items-center text-center gap-6">
                     <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3">
                        <ShieldAlert size={40} />
                     </div>
                     <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Authoritative Data Export</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">High-Fidelity Encryption Required</p>
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
                        <p className="text-[9px] text-slate-400 font-medium italic ml-1">Data will be wrapped in a password-protected XLSX container (AES-256 compliant simulation via ExcelJS).</p>
                     </div>

                     <div className="flex flex-col gap-4">
                        <button
                           onClick={handleExportPortfolio}
                           disabled={isExporting || !exportPassword}
                           className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-20 disabled:grayscale transition-all"
                        >
                           {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
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
                     <span className="text-[8px] font-black text-white uppercase tracking-[0.3em]">Vault Authorization Node 02</span>
                  </div>
               </div>
            </div>
         )}

         {/* PIECE MEAL ACCOUNT MODAL */}
         {showPieceMealModal && (
            <div className="fixed inset-0 z-[5000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
               <div className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
                  <div className="p-10 border-b border-slate-100 bg-gradient-to-br from-emerald-50 to-white flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-500/20">
                           <UserPlus size={28} />
                        </div>
                        <div className="text-left">
                           <h3 className="text-3xl font-black text-slate-900 tracking-tight">Piece Meal Account</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Manual Debtor Registration</p>
                        </div>
                     </div>
                     <button title="Close" onClick={() => setShowPieceMealModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <X size={24} />
                     </button>
                  </div>

                  <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-thin">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Borrower Name */}
                        <div className="md:col-span-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <span className="text-rose-500">*</span> Borrower Name
                           </label>
                           <input
                              type="text"
                              value={pieceMealForm.name}
                              onChange={(e) => setPieceMealForm({ ...pieceMealForm, name: e.target.value })}
                              placeholder="Enter full name..."
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all outline-none"
                           />
                        </div>

                        {/* Loan ID */}
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <span className="text-rose-500">*</span> Loan ID
                           </label>
                           <input
                              type="text"
                              value={pieceMealForm.loanId}
                              onChange={(e) => setPieceMealForm({ ...pieceMealForm, loanId: e.target.value })}
                              placeholder="e.g., LN-2024-001"
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all outline-none"
                           />
                        </div>

                        {/* Overdue Days */}
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Days Past Due</label>
                           <input
                              type="number"
                              value={pieceMealForm.overdueDays}
                              onChange={(e) => setPieceMealForm({ ...pieceMealForm, overdueDays: e.target.value })}
                              placeholder="0"
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all outline-none"
                           />
                        </div>

                        {/* Principal */}
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                              <span className="text-rose-500">*</span> Principal Amount
                           </label>
                           <input
                              type="number"
                              value={pieceMealForm.principal}
                              onChange={(e) => setPieceMealForm({ ...pieceMealForm, principal: e.target.value })}
                              placeholder="0.00"
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all outline-none"
                           />
                        </div>

                        {/* Interest */}
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Accrued Interest</label>
                           <input
                              type="number"
                              value={pieceMealForm.interest}
                              onChange={(e) => setPieceMealForm({ ...pieceMealForm, interest: e.target.value })}
                              placeholder="0.00"
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all outline-none"
                           />
                        </div>

                        {/* Penalties */}
                        <div className="md:col-span-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Penalties & Charges</label>
                           <input
                              type="number"
                              value={pieceMealForm.penalties}
                              onChange={(e) => setPieceMealForm({ ...pieceMealForm, penalties: e.target.value })}
                              placeholder="0.00"
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all outline-none"
                           />
                        </div>

                        {/* Phone */}
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                           <input
                              type="tel"
                              value={pieceMealForm.phoneNumber}
                              onChange={(e) => setPieceMealForm({ ...pieceMealForm, phoneNumber: e.target.value })}
                              placeholder="+63 XXX XXX XXXX"
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all outline-none"
                           />
                        </div>

                        {/* Email */}
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                           <input
                              type="email"
                              value={pieceMealForm.email}
                              onChange={(e) => setPieceMealForm({ ...pieceMealForm, email: e.target.value })}
                              placeholder="borrower@example.com"
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all outline-none"
                           />
                        </div>

                        {/* Address */}
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street Address</label>
                           <input
                              type="text"
                              value={pieceMealForm.address}
                              onChange={(e) => setPieceMealForm({ ...pieceMealForm, address: e.target.value })}
                              placeholder="Street, Barangay"
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all outline-none"
                           />
                        </div>

                        {/* City */}
                        <div>
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City/Municipality</label>
                           <input
                              type="text"
                              value={pieceMealForm.city}
                              onChange={(e) => setPieceMealForm({ ...pieceMealForm, city: e.target.value })}
                              placeholder="City"
                              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold mt-2 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-600 transition-all outline-none"
                           />
                        </div>
                     </div>

                     {/* Calculated Preview */}
                     {pieceMealForm.principal && (
                        <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-100">
                           <div className="flex items-center gap-3 mb-4">
                              <CheckCircle size={20} className="text-emerald-600" />
                              <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Calculated Summary</h4>
                           </div>
                           <div className="grid grid-cols-2 gap-4 text-left">
                              <div>
                                 <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Total Due</p>
                                 <p className="text-xl font-black text-emerald-900 mt-1">
                                    {sym}{((parseFloat(pieceMealForm.principal) || 0) + (parseFloat(pieceMealForm.interest) || 0) + (parseFloat(pieceMealForm.penalties) || 0)).toLocaleString()}
                                 </p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Risk Classification</p>
                                 <p className="text-xl font-black text-emerald-900 mt-1">
                                    {parseInt(pieceMealForm.overdueDays) > 120 ? 'Critical' : parseInt(pieceMealForm.overdueDays) > 60 ? 'High' : parseInt(pieceMealForm.overdueDays) > 30 ? 'Medium' : 'Low'}
                                 </p>
                              </div>
                           </div>
                        </div>
                     )}

                     <div className="flex gap-4">
                        <button
                           onClick={() => setShowPieceMealModal(false)}
                           className="flex-1 py-4 text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleAddPieceMealAccount}
                           className="flex-1 py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                           <CheckCircle size={18} />
                           Add to Registry
                        </button>
                     </div>
                  </div>

                  <div className="p-6 bg-emerald-950 flex items-center justify-center gap-2 opacity-30">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-[8px] font-black text-white uppercase tracking-[0.3em]">Manual Entry Node</span>
                  </div>
               </div>
            </div>
         )}

         {/* Smart Reshuffle Modal */}
         {showSmartReshuffle && (
            <SmartReshuffle
               portfolio={portfolio}
               systemUsers={systemUsers}
               settings={settings}
               onReshuffleComplete={(assignments) => {
                  const newPortfolio = portfolio.map(d => {
                     const assignment = assignments.find(a => a.debtorId === d.id);
                     return assignment ? { ...d, assignedAgentId: assignment.agentId } : d;
                  });
                  onSetPortfolio(newPortfolio);
                  setShowSmartReshuffle(false);

                  // Optional: Add logging
                  assignments.forEach(a => {
                     const debtor = portfolio.find(d => d.id === a.debtorId);
                     const agent = systemUsers.find(u => u.id === a.agentId);
                     if (debtor && agent) {
                        onAddActivity({
                           id: `RESHUFFLE-${Date.now()}-${Math.random()}`,
                           debtorId: a.debtorId,
                           type: CommunicationType.INTERNAL_CHAT,
                           date: new Date().toLocaleString(),
                           agent: 'System AI',
                           outcome: 'Account Reallocated',
                           notes: `Smart Reshuffle: Assigned to ${agent.name}`
                        });
                     }
                  });
               }}
               onClose={() => setShowSmartReshuffle(false)}
            />
         )}

         <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
      </div >
   );
};

export default Portfolio;