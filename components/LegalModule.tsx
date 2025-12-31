
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Gavel,
  FileText,
  Calendar,
  Search,
  Plus,
  ChevronRight,
  CheckCircle2,
  Printer,
  Scale,
  ExternalLink,
  Loader2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Briefcase,
  History,
  X,
  Send,
  Edit3,
  Check,
  CheckCircle,
  Clock,
  User,
  Users,
  AlertTriangle,
  ChevronLeft,
  MessageSquare,
  ArrowRight,
  Info,
  PenTool,
  Upload,
  Download,
  Eye,
  Trash2,
  FileUp,
  Fingerprint,
  RefreshCw,
  FileSignature
} from 'lucide-react';
import { DUMMY_DEBTORS } from '../constants';
import { LegalCase, LegalCaseStatus, NoticeType, Debtor, LegalInfo, SystemSettings, SmallClaimsStage, SmallClaimsData, SmallClaimsCaseDetails, GeneratedDocument } from '../types';
import { draftLegalNotice } from '../services/geminiService';
import { supabaseService } from '../services/supabaseService';
import {
  generateDemandLetter1,
  generateDemandLetter2,
  generateFinalDemand,
  generateForm1SCC,
  generateForm1ASCC,
  generateForm2SCC,
  generateBoardResolution,
  generateSecretaryCertificate
} from '../utils/legalTemplates';
import { htmlToPDF, generateFilingPacket } from '../utils/pdfGenerator';
import {
  validateJurisdictionalAmount,
  calculateFilingFees,
  getComplianceChecklist,
  checkBarangayRequirement
} from '../utils/complianceValidator';

const DUMMY_LEGAL_CASES: LegalCase[] = [
  {
    id: 'LC-001',
    debtorId: '3',
    debtorName: 'Global Tech Corp',
    loanId: 'Ref-1122',
    amount: 125000,
    noticeType: NoticeType.SEC_138,
    status: LegalCaseStatus.HEARING_STAGE,
    nextHearingDate: '2023-12-15',
    lastUpdateDate: '2023-11-20',
    lawyerName: 'Atty. Elena Vashkova',
    courtName: 'RTC Makati, Branch 14',
    caseNumber: 'CV-2023-8892',
    notes: 'Borrower representative requesting out-of-court mediation.'
  },
  {
    id: 'LC-002',
    debtorId: '4',
    debtorName: 'Robert Johnson',
    loanId: 'Ref-8833',
    amount: 500,
    noticeType: NoticeType.ARBITRATION,
    status: LegalCaseStatus.CASE_FILED,
    filingDate: '2023-11-05',
    lastUpdateDate: '2023-11-18',
    lawyerName: 'Atty. Marcus Thorne',
    courtName: 'Arbitral Tribunal NCR',
    caseNumber: 'ARB-091-2023',
    notes: 'Service of demand confirmed via verified channel.'
  }
];

const NOTICE_DESCRIPTIONS: Record<NoticeType, string> = {
  [NoticeType.SEC_138]: "Specific to Bouncing Checks (BP 22) and Estafa cases.",
  [NoticeType.ARBITRATION]: "Triggers out-of-court dispute settlement as per PN agreement.",
  [NoticeType.CONCILIATION]: "Formal Barangay or Structural mediation session.",
  [NoticeType.DEMAND_NOTICE]: "Final formal warning (Demand Letter) before litigation.",
  [NoticeType.SUMMONS]: "Official Court order for appearance in civil or criminal cases."
};

interface SentNotice {
  id: string;
  debtorName: string;
  noticeType: NoticeType;
  dateSent: string;
  status: 'Delivered' | 'Pending' | 'Failed';
  content: string;
  isSigned?: boolean;
}

const LegalModule: React.FC<{ settings: SystemSettings }> = ({ settings }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'notices' | 'signature' | 'small_claims'>('overview');
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null);
  const [showNoticeWizard, setShowNoticeWizard] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const [noticeType, setNoticeType] = useState<NoticeType>(NoticeType.SEC_138);
  const [generatingNotice, setGeneratingNotice] = useState(false);
  const [draftedNotice, setDraftedNotice] = useState<string | null>(null);
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  // Wizard & Signature State
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardSearch, setWizardSearch] = useState('');
  const [uploadedDoc, setUploadedDoc] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const sym = settings.localization.currencySymbol;

  const [sentNotices, setSentNotices] = useState<SentNotice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      const { data, error } = await supabaseService.getLegalCases();
      if (!error && data) {
        setSmallClaimsCases(data as any);
      }
      setLoading(false);
    };
    fetchCases();
  }, []);

  const handleGenerateNotice = async () => {
    if (!selectedDebtor) return;
    setGeneratingNotice(true);
    const draft = await draftLegalNotice(selectedDebtor, noticeType);
    setDraftedNotice(draft);
    setIsEditingDraft(false);
    setGeneratingNotice(false);
    setWizardStep(3);
  };

  const finalizeNotice = () => {
    if (!selectedDebtor || !draftedNotice) return;

    const newNotice: SentNotice = {
      id: `SN-00${sentNotices.length + 1}`,
      debtorName: selectedDebtor.name,
      noticeType: noticeType,
      dateSent: new Date().toISOString().split('T')[0],
      status: 'Pending',
      content: draftedNotice,
      isSigned: false
    };

    setSentNotices([newNotice].concat(sentNotices));
    resetWizard();
    setActiveTab('notices');
  };

  const resetWizard = () => {
    setShowNoticeWizard(false);
    setWizardStep(1);
    setDraftedNotice(null);
    setSelectedDebtor(null);
    setWizardSearch('');
  };

  const startNoticeWizard = (debtor?: Debtor) => {
    if (debtor) {
      setSelectedDebtor(debtor);
      setWizardStep(2);
    } else {
      setWizardStep(1);
    }
    setShowNoticeWizard(true);
  };

  // Signature Pad Logic
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData(null);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL('image/png'));
      setIsSigning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setUploadedDoc(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const finalizeSignedDocument = async () => {
    setIsCommitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsCommitting(false);
    setUploadedDoc(null);
    setSignatureData(null);
    alert("Document signed and stored in Remedial Case File.");
    setActiveTab('notices');
  };

  const wizardCandidates = useMemo(() => {
    return DUMMY_DEBTORS.filter(d =>
      d.overdueDays > 30 &&
      (d.name.toLowerCase().indexOf(wizardSearch.toLowerCase()) !== -1 || d.loanId.toLowerCase().indexOf(wizardSearch.toLowerCase()) !== -1)
    );
  }, [wizardSearch]);

  const getStatusColor = (status: LegalCaseStatus) => {
    switch (status) {
      case LegalCaseStatus.DRAFTING: return 'bg-slate-100 text-slate-600';
      case LegalCaseStatus.NOTICE_SENT: return 'bg-blue-50 text-blue-600';
      case LegalCaseStatus.CASE_FILED: return 'bg-indigo-50 text-indigo-600';
      case LegalCaseStatus.HEARING_STAGE: return 'bg-amber-50 text-amber-600';
      case LegalCaseStatus.CLOSED: return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  /* SMALL CLAIMS LOGIC */
  const [smallClaimsCases, setSmallClaimsCases] = useState<(LegalCase & SmallClaimsData)[]>([
    {
      ...(DUMMY_LEGAL_CASES[0] || {} as LegalCase),
      stage: SmallClaimsStage.DEMAND_1_PENDING,
      courtBranch: 'MTC Branch 14, Makati City'
    }
  ]);

  const [scStage, setScStage] = useState<SmallClaimsStage>(SmallClaimsStage.DEMAND_1_PENDING);

  const advanceStage = (caseId: string) => {
    setSmallClaimsCases(prev => prev.map(c => {
      if (c.id === caseId) {
        let nextStage = c.stage;
        switch (c.stage) {
          case SmallClaimsStage.DEMAND_1_PENDING: nextStage = SmallClaimsStage.DEMAND_2_PENDING; break;
          case SmallClaimsStage.DEMAND_2_PENDING: nextStage = SmallClaimsStage.FINAL_DEMAND_PENDING; break;
          case SmallClaimsStage.FINAL_DEMAND_PENDING: nextStage = SmallClaimsStage.CASE_BUILDING; break;
          case SmallClaimsStage.CASE_BUILDING: nextStage = SmallClaimsStage.READY_TO_FILE; break;
          case SmallClaimsStage.READY_TO_FILE: nextStage = SmallClaimsStage.FILED; break;
        }
        return { ...c, stage: nextStage };
      }
      return c;
    }));
  };

  const generateSmallClaimsDoc = (caseId: string, docType: 'SOA' | 'DEMAND_1' | 'DEMAND_2' | 'FINAL_DEMAND' | '1-SCC' | '1-A-SCC' | '2-SCC' | 'BoardRes' | 'SecCert') => {
    const scCase = smallClaimsCases.find(c => c.id === caseId);
    if (!scCase) return;

    // Create case details from the legal case data with 2025 compliance fields
    const debtor = DUMMY_DEBTORS.find(d => d.id === scCase.debtorId);
    const caseDetails: SmallClaimsCaseDetails = scCase.caseDetails || {
      debtorName: scCase.debtorName,
      debtorAddress: debtor?.address || 'Address not available',
      debtorCity: 'Makati City', // Extract from address or set manually
      principalAmount: scCase.amount,
      totalAmount: scCase.amount,
      loanDate: '2023-06-15',
      dueDate: '2023-09-15',
      referenceNumber: scCase.loanId,
      creditorName: "Panlilio's Credit & Collections Services",
      creditorAddress: "123 Business Ave, Makati City, Metro Manila",
      creditorCity: 'Makati City',
      authorizedOfficer: "Atty. Ricardo Panlilio",
      officerPosition: "Senior Managing Partner",
      courtBranch: scCase.courtBranch || 'MTC Branch 14, Makati City',
      courtAddress: 'Makati City, Metro Manila',
      // 2025 Compliance fields
      isWithinJurisdiction: validateJurisdictionalAmount(scCase.amount),
      filingFees: calculateFilingFees(scCase.amount, 8), // Assuming 8 cases filed this year
      barangayRequirement: checkBarangayRequirement('Makati City', 'Makati City')
    };

    let htmlContent = '';
    let filename = '';

    // Generate the appropriate document
    switch (docType) {
      case 'DEMAND_1':
        htmlContent = generateDemandLetter1(caseDetails);
        filename = `Demand_Letter_1_${caseDetails.referenceNumber}`;
        break;
      case 'DEMAND_2':
        htmlContent = generateDemandLetter2(caseDetails);
        filename = `Demand_Letter_2_${caseDetails.referenceNumber}`;
        break;
      case 'FINAL_DEMAND':
        htmlContent = generateFinalDemand(caseDetails);
        filename = `Final_Demand_${caseDetails.referenceNumber}`;
        break;
      case '1-SCC':
        htmlContent = generateForm1SCC(caseDetails);
        filename = `Form_1_SCC_${caseDetails.referenceNumber}`;
        break;
      case '1-A-SCC':
        htmlContent = generateForm1ASCC(caseDetails);
        filename = `Form_1_A_SCC_${caseDetails.referenceNumber}`;
        break;
      case '2-SCC':
        htmlContent = generateForm2SCC(caseDetails);
        filename = `Form_2_SCC_${caseDetails.referenceNumber}`;
        break;
      case 'BoardRes':
        htmlContent = generateBoardResolution(caseDetails);
        filename = `Board_Resolution_${caseDetails.referenceNumber}`;
        break;
      case 'SecCert':
        htmlContent = generateSecretaryCertificate(caseDetails);
        filename = `Secretary_Certificate_${caseDetails.referenceNumber}`;
        break;
      default:
        alert('Document type not implemented yet');
        return;
    }

    // Generate and download PDF
    htmlToPDF(htmlContent, filename);

    // Update case to track generated document
    setSmallClaimsCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const newDoc: GeneratedDocument = {
          id: `${caseId}-${docType}-${Date.now()}`,
          type: docType as any,
          generatedDate: new Date().toISOString(),
          content: htmlContent,
          downloaded: true
        };
        return {
          ...c,
          generatedDocuments: [...(c.generatedDocuments || []), newDoc]
        };
      }
      return c;
    }));
  };

  // Generate demand letter based on current stage
  const generateAndSendDemand = (caseId: string) => {
    const scCase = smallClaimsCases.find(c => c.id === caseId);
    if (!scCase) return;

    let docType: 'DEMAND_1' | 'DEMAND_2' | 'FINAL_DEMAND';
    switch (scCase.stage) {
      case SmallClaimsStage.DEMAND_1_PENDING:
        docType = 'DEMAND_1';
        break;
      case SmallClaimsStage.DEMAND_2_PENDING:
        docType = 'DEMAND_2';
        break;
      case SmallClaimsStage.FINAL_DEMAND_PENDING:
        docType = 'FINAL_DEMAND';
        break;
      default:
        return;
    }

    // Generate the document
    generateSmallClaimsDoc(caseId, docType);

    // Advance to next stage
    advanceStage(caseId);
  };

  // Compile complete filing packet
  const compileFilingPacket = async (caseId: string) => {
    const scCase = smallClaimsCases.find(c => c.id === caseId);
    if (!scCase) return;

    const caseDetails: SmallClaimsCaseDetails = scCase.caseDetails || {
      debtorName: scCase.debtorName,
      debtorAddress: DUMMY_DEBTORS.find(d => d.id === scCase.debtorId)?.address || 'Address not available',
      principalAmount: scCase.amount,
      totalAmount: scCase.amount,
      loanDate: '2023-06-15',
      dueDate: '2023-09-15',
      referenceNumber: scCase.loanId,
      creditorName: "Panlilio's Credit & Collections Services",
      creditorAddress: "123 Business Ave, Makati City, Metro Manila",
      authorizedOfficer: "Atty. Ricardo Panlilio",
      officerPosition: "Senior Managing Partner",
      courtBranch: scCase.courtBranch || 'MTC Branch 14, Makati City',
      courtAddress: 'Makati City, Metro Manila'
    };

    // Generate all required documents (2025 compliance)
    const documents = [
      { type: 'Form 1-SCC (Statement of Claim)', content: generateForm1SCC(caseDetails) },
      { type: 'Form 1-A-SCC (Verification & Certification)', content: generateForm1ASCC(caseDetails) },
      { type: 'Form 2-SCC (Non-Forum Shopping)', content: generateForm2SCC(caseDetails) },
      { type: 'Board Resolution', content: generateBoardResolution(caseDetails) },
      { type: "Secretary's Certificate", content: generateSecretaryCertificate(caseDetails) }
    ];

    // Generate complete filing packet
    await generateFilingPacket(caseDetails, documents);

    // Advance to ready to file stage
    advanceStage(caseId);
  };

  // State for case details modal
  const [showCaseDetailsModal, setShowCaseDetailsModal] = useState(false);
  const [selectedCaseForDetails, setSelectedCaseForDetails] = useState<string | null>(null);

  const viewCaseDetails = (caseId: string) => {
    setSelectedCaseForDetails(caseId);
    setShowCaseDetailsModal(true);
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center text-left">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Remedial & Legal Hub</h1>
            <p className="text-sm text-slate-500 font-medium">Philippine Small Claims Automation & E-Signatures</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('signature')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
            >
              <FileSignature size={18} />
              E-Sign Portal
            </button>
            <button
              onClick={() => setActiveTab('small_claims')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all"
            >
              <Gavel size={18} />
              Small Claims Manager
            </button>
          </div>
        </div>

        <div className="flex border-b border-slate-200 overflow-x-auto">
          {(['overview', 'small_claims', 'cases', 'notices', 'signature'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative shrink-0 ${activeTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'
                }`}
            >
              {tab === 'signature' ? 'E-Signature Center' :
                tab === 'cases' ? 'Case Tracking' :
                  tab === 'notices' ? 'Demand Trail' :
                    tab === 'small_claims' ? 'Small Claims Workflow' : 'Overview'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col group text-left">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Small Claims Automation</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Forms 1-SCC & 2-SCC</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-8 flex-1 leading-relaxed font-medium">
                  End-to-end workflow for Philippine Small Claims cases. From 1st Demand Letter to generating the Statement of Claim (Form 1-SCC).
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('small_claims')}
                    className="py-4 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl"
                  >
                    Launch Workflow
                  </button>
                  <button
                    onClick={() => startNoticeWizard()}
                    className="py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    Quick Demand Letter
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col text-left">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                    <Fingerprint size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">E-Signature Suite</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Legal Finalization</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-8 flex-1 leading-relaxed font-medium">
                  Process compromise agreements, restructuring forms, and demand letters with verifiable cryptographic signatures.
                </p>
                <button
                  onClick={() => setActiveTab('signature')}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  Open Sign Terminal <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'small_claims' && (
            <div className="space-y-6">
              {smallClaimsCases.map(scCase => (
                <div key={scCase.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">{scCase.debtorName[0]}</div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900">{scCase.debtorName}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loan ID: {scCase.loanId} • {sym}{scCase.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{scCase.courtBranch}</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest">{scCase.stage}</span>
                    </div>
                  </div>

                  {/* PROGRESS TRACKER */}
                  <div className="p-8 overflow-x-auto">
                    <div className="flex items-center min-w-[600px]">
                      {[
                        { id: SmallClaimsStage.DEMAND_1_PENDING, label: '1st Demand' },
                        { id: SmallClaimsStage.DEMAND_2_PENDING, label: '2nd Demand' },
                        { id: SmallClaimsStage.FINAL_DEMAND_PENDING, label: 'Final Demand' },
                        { id: SmallClaimsStage.CASE_BUILDING, label: 'Filing Packet' },
                        { id: SmallClaimsStage.READY_TO_FILE, label: 'Ready to File' }
                      ].map((step, idx) => {
                        const stages = Object.values(SmallClaimsStage);
                        const currentIndex = stages.indexOf(scCase.stage);
                        const stepIndex = stages.indexOf(step.id);
                        const isComplete = stepIndex < currentIndex;
                        const isCurrent = stepIndex === currentIndex;

                        return (
                          <div key={step.id} className="flex-1 flex flex-col items-center relative group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 z-10 transition-all ${isComplete ? 'bg-emerald-500 border-emerald-500 text-white' : (isCurrent ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg' : 'bg-white border-slate-200 text-slate-300')}`}>
                              {isComplete ? <Check size={14} /> : idx + 1}
                            </div>
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-3 ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`}>{step.label}</p>
                            {idx !== 4 && <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-0 ${stepIndex < currentIndex ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase size={14} /> Current Actions</h4>
                      <div className="space-y-3">
                        {(scCase.stage === SmallClaimsStage.DEMAND_1_PENDING || scCase.stage === SmallClaimsStage.DEMAND_2_PENDING || scCase.stage === SmallClaimsStage.FINAL_DEMAND_PENDING) && (
                          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                            <p className="text-sm font-bold text-slate-700 mb-1">Generate Demand Letter</p>
                            <p className="text-xs text-slate-400 mb-4">Create and log the required demand letter to satisfy the 'Actionable Document' requirement.</p>
                            <div className="flex gap-3">
                              <button onClick={() => generateSmallClaimsDoc(scCase.id, 'SOA')} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50" title="View Statement of Account">View SOA</button>
                              <button onClick={() => generateAndSendDemand(scCase.id)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 flex items-center gap-2" title="Generate and Send Demand Letter"> Generate & Send <Send size={12} /></button>
                            </div>
                          </div>
                        )}

                        {scCase.stage === SmallClaimsStage.CASE_BUILDING && (
                          <div className="space-y-3">
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                              <div><p className="text-sm font-bold text-slate-700">Form 1-SCC (Statement of Claim)</p><p className="text-[10px] text-slate-400 uppercase font-bold">Official Complaint Form</p></div>
                              <button onClick={() => generateSmallClaimsDoc(scCase.id, '1-SCC')} className="p-2 bg-blue-50 text-blue-600 rounded-lg" title="Print Form 1-SCC"><Printer size={16} /></button>
                            </div>
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                              <div><p className="text-sm font-bold text-slate-700">Form 1-A-SCC (Verification)</p><p className="text-[10px] text-slate-400 uppercase font-bold">Certification Against Forum Shopping</p></div>
                              <button onClick={() => generateSmallClaimsDoc(scCase.id, '1-A-SCC')} className="p-2 bg-blue-50 text-blue-600 rounded-lg" title="Print Form 1-A-SCC"><Printer size={16} /></button>
                            </div>
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                              <div><p className="text-sm font-bold text-slate-700">Form 2-SCC (Affidavit)</p><p className="text-[10px] text-slate-400 uppercase font-bold">Witness Affidavit</p></div>
                              <button onClick={() => generateSmallClaimsDoc(scCase.id, '2-SCC')} className="p-2 bg-blue-50 text-blue-600 rounded-lg" title="Print Form 2-SCC"><Printer size={16} /></button>
                            </div>
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                              <div><p className="text-sm font-bold text-slate-700">Secretary's Certificate</p><p className="text-[10px] text-slate-400 uppercase font-bold">Auth to Sue (Corporation)</p></div>
                              <button onClick={() => generateSmallClaimsDoc(scCase.id, 'SecCert')} className="p-2 bg-blue-50 text-blue-600 rounded-lg" title="Print Secretary's Certificate"><Printer size={16} /></button>
                            </div>
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                              <div><p className="text-sm font-bold text-slate-700">Board Resolution</p><p className="text-[10px] text-slate-400 uppercase font-bold">Corporate Authorization</p></div>
                              <button onClick={() => generateSmallClaimsDoc(scCase.id, 'BoardRes')} className="p-2 bg-blue-50 text-blue-600 rounded-lg" title="Print Board Resolution"><Printer size={16} /></button>
                            </div>
                            <button onClick={() => compileFilingPacket(scCase.id)} className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-emerald-700 mt-4" title="Compile all documents for court filing">Compile Filing Packet</button>
                          </div>
                        )}

                        {scCase.stage === SmallClaimsStage.READY_TO_FILE && (
                          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-emerald-600"><CheckCircle2 size={24} /></div>
                            <h4 className="text-sm font-black text-emerald-800 mb-1">Packet Ready for Filing</h4>
                            <p className="text-xs text-emerald-600 mb-4">All documents have been compiled. Print 2 copies for the MTC Clerk of Court.</p>
                            <button onClick={() => compileFilingPacket(scCase.id)} className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-emerald-500/20 shadow-lg" title="Download the complete filing packet PDF">Download PDF Packet</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2"><History size={14} /> Case History</h4>
                      <div className="relative pl-4 space-y-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        <div className="relative">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                          <p className="text-xs font-bold text-slate-900 capitalize">{scCase.stage.toLowerCase().replace(/_/g, ' ')}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Current Stage</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                          <p className="text-xs font-medium text-slate-500">Case Initialized in Remedial Hub</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">2023-11-20 • System</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2025 COMPLIANCE SECTION */}
                  <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-t border-blue-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">2025 Compliance Checklist</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Supreme Court Requirements</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Jurisdictional Amount */}
                      <div className="p-4 bg-white border border-blue-100 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-slate-700">Jurisdictional Amount</p>
                          {scCase.caseDetails?.isWithinJurisdiction ? (
                            <CheckCircle className="text-emerald-500" size={16} />
                          ) : (
                            <AlertTriangle className="text-amber-500" size={16} />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {scCase.caseDetails?.isWithinJurisdiction
                            ? `₱${scCase.amount.toLocaleString()} ≤ ₱1,000,000 ✓`
                            : `₱${scCase.amount.toLocaleString()} exceeds ₱1,000,000 limit`
                          }
                        </p>
                      </div>

                      {/* Actionable Documents */}
                      <div className="p-4 bg-white border border-blue-100 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-slate-700">Actionable Documents</p>
                          {scCase.caseDetails?.actionableDocuments && scCase.caseDetails.actionableDocuments.length >= 1 ? (
                            <CheckCircle className="text-emerald-500" size={16} />
                          ) : (
                            <Clock className="text-slate-300" size={16} />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {scCase.caseDetails?.actionableDocuments?.length || 0} document(s) • 2 certified copies required
                        </p>
                        <button className="mt-2 text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1" title="Upload actionable document evidence">
                          <Upload size={12} /> Upload Evidence
                        </button>
                      </div>

                      {/* Demand Letter Proof */}
                      <div className="p-4 bg-white border border-blue-100 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-slate-700">Demand Letter Proof</p>
                          {scCase.caseDetails?.demandLetterProofs && scCase.caseDetails.demandLetterProofs.length >= 1 ? (
                            <CheckCircle className="text-emerald-500" size={16} />
                          ) : (
                            <Clock className="text-slate-300" size={16} />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {scCase.caseDetails?.demandLetterProofs?.length || 0} proof(s) attached
                        </p>
                        <button className="mt-2 text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1" title="Attach proof of service to demand letter">
                          <FileUp size={12} /> Attach Registry Receipt
                        </button>
                      </div>

                      {/* Barangay Conciliation */}
                      <div className="p-4 bg-white border border-blue-100 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-slate-700">Barangay Conciliation</p>
                          {scCase.caseDetails?.barangayRequirement?.isRequired ? (
                            scCase.caseDetails.barangayRequirement.certificateAttached ? (
                              <CheckCircle className="text-emerald-500" size={16} />
                            ) : (
                              <AlertTriangle className="text-amber-500" size={16} />
                            )
                          ) : (
                            <Info className="text-blue-500" size={16} />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {scCase.caseDetails?.barangayRequirement?.isRequired
                            ? scCase.caseDetails.barangayRequirement.reason === 'SAME_CITY'
                              ? 'Required (Same City) - Certificate needed'
                              : 'Required - Certificate needed'
                            : 'Not Required (Different Cities)'
                          }
                        </p>
                        {scCase.caseDetails?.barangayRequirement?.isRequired && (
                          <button className="mt-2 text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1" title="Upload Certificate to File Action">
                            <Upload size={12} /> Upload Certificate
                          </button>
                        )}
                      </div>

                      {/* Filing Fees */}
                      <div className="p-4 bg-white border border-blue-100 rounded-2xl shadow-sm col-span-1 md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-slate-700">Filing Fees Calculation</p>
                          <CheckCircle className="text-emerald-500" size={16} />
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Basic Fee</p>
                            <p className="text-sm font-black text-slate-900">₱{scCase.caseDetails?.filingFees?.basicFee.toLocaleString() || '420'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Surcharge</p>
                            <p className="text-sm font-black text-slate-900">₱{scCase.caseDetails?.filingFees?.frequentFilerSurcharge.toLocaleString() || '0'}</p>
                            <p className="text-[9px] text-slate-400">{scCase.caseDetails?.filingFees?.casesFiledThisYear || 8} cases this year</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Total Fee</p>
                            <p className="text-sm font-black text-blue-600">₱{scCase.caseDetails?.filingFees?.totalFee.toLocaleString() || '420'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compliance Summary */}
                    <div className="mt-6 p-4 bg-white border-2 border-blue-200 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-700 mb-1">Ready to File Status</p>
                          <div className="flex gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700 w-[75%]"></div>
                            </div>
                            <span className="text-[10px] font-black text-slate-600">75%</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all flex items-center gap-2" title="View detailed compliance checklist">
                          <Eye size={12} /> View Full Checklist
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <Plus size={32} />
                </div>
                <h3 className="font-black text-slate-900">Initiate New Small Claims Case</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-sm">Select a debtor with &gt;60 DPD and amount under ₱1,000,000 to start the Small Claims procedure.</p>
              </div>
            </div>
          )}

          {activeTab === 'signature' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 text-left">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">E-Sign Terminal</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Secure Document Verification Cluster</p>
                </div>
                {!uploadedDoc && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-blue-700 transition-all"
                    title="Upload a document for signature"
                  >
                    <Upload size={16} /> Upload Agreement
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" title="File selection input" />
              </div>

              <div className="p-8 min-h-[500px] flex flex-col items-center justify-center relative bg-slate-50/20">
                {uploadedDoc ? (
                  <div className="w-full max-w-2xl space-y-6">
                    <div className="relative border-4 border-slate-200 rounded-[2rem] bg-white shadow-2xl overflow-hidden aspect-[3/4] flex flex-col group">
                      <div className="flex-1 overflow-hidden relative">
                        <img src={uploadedDoc} className="w-full h-full object-contain" alt="Preview" />
                        {signatureData && (
                          <div className="absolute bottom-20 right-10 rotate-[-5deg] animate-in zoom-in-50 duration-300">
                            <img src={signatureData} className="w-48 opacity-90 mix-blend-multiply" alt="Signature" />
                            <div className="mt-2 text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50/80 px-2 py-1 rounded border border-blue-200">
                              E-SIGN VERIFIED • {new Date().toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6 bg-slate-900 border-t border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600 rounded-lg text-white"><FileText size={14} /></div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Status</p>
                            <p className="text-xs font-bold text-white">READY_FOR_ENTRY.PDF</p>
                          </div>
                        </div>
                        {!signatureData ? (
                          <button
                            onClick={() => setIsSigning(true)}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                          >
                            <PenTool size={14} /> Affix Mark
                          </button>
                        ) : (
                          <button
                            onClick={finalizeSignedDocument}
                            disabled={isCommitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                          >
                            {isCommitting ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                            Finalize Signing
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button onClick={() => setUploadedDoc(null)} className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 hover:underline">
                        <Trash2 size={14} /> Discard File
                      </button>
                      <button onClick={() => setIsSigning(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline">
                        <RefreshCw size={14} /> Clear Signature
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex items-center justify-center mx-auto text-slate-200">
                      <FileUp size={40} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">Workbench Ready</h4>
                      <p className="text-xs text-slate-400 font-medium mt-1">Upload a demand letter or agreement to start signing.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500 text-left">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Remedial Case Management</h3>
                <div className="relative w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search court cases..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none" title="Search court cases" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Borrower / Case #</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Action</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {DUMMY_LEGAL_CASES.map(lc => (
                      <tr key={lc.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-8 py-5">
                          <p className="text-sm font-black text-slate-900">{lc.debtorName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{lc.caseNumber || 'NO DOCKET ID'}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold text-slate-600">{lc.noticeType}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(lc.status)}`}>
                            {lc.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="p-2 text-slate-300 group-hover:text-blue-600 transition-colors" title="View Case Details"><ChevronRight size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notices' && (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500 text-left">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Issued Demand History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Verified</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sentNotices.map(sn => (
                      <tr key={sn.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-8 py-5">
                          <p className="text-sm font-black text-slate-900">{sn.debtorName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{sn.noticeType}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-bold text-slate-500">{sn.dateSent}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className={`mx-auto w-6 h-6 rounded-lg flex items-center justify-center border-2 ${sn.isSigned ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                            <ShieldCheck size={14} />
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="p-2 text-slate-300 group-hover:text-blue-600 transition-colors" title="Download Notice PDF"><Download size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 text-left">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <Scale size={140} />
            </div>
            <h3 className="font-black text-lg mb-4 flex items-center gap-3">
              <Briefcase size={20} className="text-blue-400" /> Litigation Node
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8 relative z-10">
              Philippine High Court (RTC/MTC) linkage authorized. Demand letters are generated under the <b>Supreme Court Digital Evidence Rules</b>.
            </p>
            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl text-xs font-black hover:bg-slate-100 transition-all shadow-xl" title="Manage collaborating law firms and partners">
              Manage Remedial Partners
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History size={14} className="text-blue-600" /> Upcoming Hearings
            </h4>
            <div className="space-y-4">
              {DUMMY_LEGAL_CASES.map(lc => (
                <div key={lc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-900">{lc.nextHearingDate || 'TBD'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate w-32">{lc.debtorName}</p>
                  </div>
                  <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all" title="View Hearing in Calendar"><Calendar size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {
        isSigning && (
          <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[400] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 text-left">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">E-Signature Pad</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Physical Mark Verification</p>
                </div>
                <button onClick={() => setIsSigning(false)} className="p-2 text-slate-400 hover:text-slate-900" title="Close Signing Pad"><X size={24} /></button>
              </div>

              <div className="p-8">
                <div className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] relative aspect-[2/1] overflow-hidden group">
                  <canvas
                    ref={canvasRef}
                    width={440}
                    height={220}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair touch-none"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-40 group-hover:opacity-10 transition-opacity">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Sign Within Border</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button
                    onClick={clearCanvas}
                    className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> Reset Pad
                  </button>
                  <button
                    onClick={saveSignature}
                    className="py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={14} /> Save Mark
                  </button>
                </div>
              </div>

              <div className="px-8 pb-8 flex items-center gap-3 text-slate-400">
                <ShieldCheck size={16} className="text-emerald-500" />
                <p className="text-[9px] font-bold leading-tight italic">
                  Mark serves as your digital endorsement of this legal document.
                </p>
              </div>
            </div>
          </div>
        )
      }

      {/* Demand Wizard Modal */}
      {
        showNoticeWizard && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 text-left">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Demand Letter Wizard</h3>
                  </div>
                </div>
                <button onClick={resetWizard} className="p-2 text-slate-400 hover:text-slate-900" title="Close Wizard"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                {wizardStep === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="relative w-full">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search accounts for escalation..."
                        value={wizardSearch}
                        onChange={(e) => setWizardSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10"
                        title="Search accounts for escalation"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {wizardCandidates.map(debtor => (
                        <button
                          key={debtor.id}
                          onClick={() => { setSelectedDebtor(debtor); setWizardStep(2); }}
                          className="text-left bg-white border border-slate-200 p-6 rounded-[2rem] hover:border-blue-500 hover:shadow-xl transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all mb-4">
                            {debtor.name[0]}
                          </div>
                          <p className="font-black text-slate-900 text-sm">{debtor.name}</p>
                          <p className="text-[10px] font-bold text-rose-500 uppercase mt-1">{debtor.overdueDays} DPD • {sym}{debtor.amountDue.toLocaleString()}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {wizardStep === 2 && selectedDebtor && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-4 p-6 bg-slate-900 rounded-[2rem] text-white">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-black text-lg">{selectedDebtor.name[0]}</div>
                      <div>
                        <h4 className="text-lg font-black">{selectedDebtor.name}</h4>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Project Remedial Escalation</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.values(NoticeType).map(type => (
                        <button
                          key={type}
                          onClick={() => setNoticeType(type)}
                          className={`p-6 rounded-[2rem] border-2 text-left transition-all ${noticeType === type ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${noticeType === type ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Scale size={18} /></div>
                            <div>
                              <p className="font-black text-slate-900 text-sm">{type}</p>
                              {/* Fix: Explicit cast for type index access */}
                              <p className="text-[10px] text-slate-500 mt-1 font-medium">{NOTICE_DESCRIPTIONS[type as NoticeType]}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleGenerateNotice}
                      disabled={generatingNotice}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                    >
                      {generatingNotice ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-blue-400" />}
                      {generatingNotice ? 'Consulting Remedial AI...' : 'Draft Demand Letter'}
                    </button>
                  </div>
                )}

                {wizardStep === 3 && draftedNotice && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-8 bg-slate-900 text-slate-300 rounded-[2.5rem] font-mono text-[11px] leading-relaxed whitespace-pre-wrap border border-slate-700 shadow-inner h-[400px] overflow-y-auto">
                      {draftedNotice}
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setWizardStep(2)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all">Previous</button>
                      <button onClick={finalizeNotice} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-xl hover:bg-blue-700 transition-all">Store & Send</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

    </>
  );
};

export default LegalModule;
