export enum CaseStatus {
  PENDING = 'Pending',
  CONTACTED = 'Contacted',
  PROMISE_TO_PAY = 'PTP',
  BROKEN_PROMISE = 'BPTP',
  LEGAL = 'Remedial Escalation',
  SETTLED = 'Settled',
  WRITTEN_OFF = 'Written Off',
  IN_DISPUTE = 'In Dispute',
  DORMANT = 'Dormant'
}

export enum CommunicationType {
  SMS = 'SMS',
  WHATSAPP = 'WhatsApp',
  VIBER = 'Viber',
  EMAIL = 'Email',
  VOICE = 'Voice Call',
  FIELD_VISIT = 'Field Visit',
  VISUAL_PROOF = 'Visual Proof',
  FB_MESSENGER = 'Messenger',
  TELEGRAM = 'Telegram',
  INSTAGRAM = 'Instagram',
  TWITTER = 'X (Twitter)',
  INTERNAL_CHAT = 'Internal Chat',
  INTERNAL_CALL = 'Internal Call',
  DEMAND_LETTER = 'Demand Letter'
}

export interface SecurityEvent {
  id: string;
  type: 'SQL_INJECTION_ATTEMPT' | 'BRUTE_FORCE' | 'DLP_VIOLATION' | 'UNAUTHORIZED_IP' | 'DATA_EXFILTRATION';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  source: string;
  details: string;
  resolved: boolean;
}

export interface AegisSecurityConfig {
  browserIsolation: boolean;
  readOnlyModeOnUntrusted: boolean;
  disableCopyPaste: boolean;
  disableFileUpload: boolean;
  documentSanitization: boolean;
  pixelStreamQuality: 'high' | 'medium' | 'low';
  credentialTheftProtection: boolean;
}

export interface LandingPageFeature {
  icon: string;
  title: string;
  description: string;
  enabled?: boolean;
}

export interface LandingPageSection {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  content?: string;
  image?: string;
  cta?: string;
  primaryCta?: string;
  secondaryCta?: string;
}

export interface CustomLandingSection {
  id: string;
  enabled: boolean;
  title: string;
  subtitle?: string;
  content: string;
  image?: string;
  imagePosition: 'left' | 'right' | 'full';
  theme: 'light' | 'dark' | 'glass';
  ctaLabel?: string;
}

export interface LandingPageConfig {
  branding: {
    logoText: string;
    companyName: string;
    logoImage?: string;
  };
  sections: {
    hero: LandingPageSection & { bgImage?: string };
    core: LandingPageSection & { fieldImage?: string, aiImage?: string };
    features: {
      enabled: boolean;
      title: string;
      items: LandingPageFeature[];
    };
    firm: LandingPageSection & { mediationImage?: string, prestigeImage?: string };
    performance: {
      enabled: boolean;
      title: string;
      items: { label: string; value: string; icon: string }[];
    };
    leadership: {
      enabled: boolean;
      title: string;
      members: { name: string; role: string; bio: string }[];
    };
    compliance: LandingPageSection;
    contact: LandingPageSection;
    customSections: CustomLandingSection[];
  };
}

export interface SystemSettings {
  localization: {
    currency: string;
    currencySymbol: string;
  };
  recovery: {
    lastBackupDate: string;
    maintenanceMode?: boolean;
    globalLockdown?: boolean;
    systemStatus?: string;
  };
  sentinel: {
    enabled: boolean;
    autoFreezeOnCritical: boolean;
    exfiltrationDetection: boolean;
    behavioralAnalytics: boolean;
    highValueMonitoring: boolean;
    threatLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  };
  aegis: AegisSecurityConfig;
  compliance: {
    auditLogging: boolean;
    encryption: boolean;
    geoFencing: boolean;
    copyPaste: boolean;
    screenProtection: boolean;
    screenshotControl: boolean;
    passwordSharingProtection: boolean;
    watermarkEnabled: boolean;
    watermarkOpacity: number;
    watermarkDensity: number;
    sessionTimeout: number;
    ipWhitelist: string[];
    allowedSSID: string[];
  };
  integrations: {
    facebook: { id: string; name: string; status: 'connected' | 'disconnected' };
    googleMaps: { id: string; name: string; status: 'connected' | 'disconnected' };
    linkedin: { id: string; name: string; status: 'connected' | 'disconnected' };
    viber: { id: string; name: string; status: 'connected' | 'disconnected' };
    whatsapp: { id: string; name: string; status: 'connected' | 'disconnected' };
  };
  portfolioHeaders?: any[];
  landingPage?: LandingPageConfig;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'Payment' | 'Penalty' | 'Fee';
  notes: string;
}

export interface ModuleStatus {
  settlement?: 'Active' | 'Pending' | 'Completed' | null;
  campaign?: 'Active' | 'Queued' | 'Excluded' | null;
  dispute?: 'Open' | 'Resolved' | null;
  skiptracing?: 'Tracing' | 'Verified' | null;
  qa?: 'Audited' | 'Flagged' | null;
  legal?: 'Remedial' | 'Summons' | 'Hearing' | null;
  field?: 'Scheduled' | 'On-Site' | 'Completed' | null;
}

export interface Debtor {
  id: string;
  name: string;
  loanId: string;
  amountDue: number;
  overdueDays: number;
  status: CaseStatus;
  riskScore: 'Low' | 'Medium' | 'High' | 'Critical';
  bucket: string;
  phoneNumber: string;
  secondaryPhone?: string;
  email: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  creditScore?: number;
  disbursalDate?: string;
  dueDate?: string;
  financialDetail: {
    principal: number;
    interest: number;
    penalties: number;
    totalDue: number;
  };
  employment: any;
  emergencyContact: any;
  transactions: Transaction[];
  familyContacts: any[];
  assets: any[];
  campaignId: string;
  paymentPlan?: any;
  employer?: string;
  lastContactDate?: string;
  workflowNodes?: ModuleStatus;
  assignedAgentId?: string;
  // Added for complete source traceability as requested
  rawIngestionData?: Record<string, any>;
}

export interface User {
  id: string;
  name: string;
  employeeId: string;
  password?: string;
  role: UserRole;
  avatar: string;
  concurrentAccess?: boolean;
  assignedDebtorIds?: string[];
  assignedCampaignIds?: string[];
  isActive?: boolean;
  status?: string;
  isCertified?: boolean;
  trainingStep?: number;
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'FIELD_AGENT' | 'CAMPAIGN_ADMIN' | 'TEAM_LEADER' | 'OPERATIONS_MANAGER' | 'HEAD_OF_OPERATIONS' | 'TEAM_MANAGER' | 'COMPLIANCE_OFFICER' | 'ASSISTANT_TEAM_LEADER';

export interface SystemLog {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  type?: 'comms' | 'system' | 'security';
}

export interface SettlementRequest {
  id: string;
  debtorId: string;
  debtorName: string;
  originalBalance: number;
  requestedWaiver: any;
  finalSettlementAmount: number;
  paymentMode: string;
  installments?: number;
  reason: string;
  status: string;
  requestedBy: string;
  timestamp: string;
}

export enum SmallClaimsStage {
  DEMAND_1_PENDING = '1st Demand Pending',
  DEMAND_2_PENDING = '2nd Demand Pending',
  FINAL_DEMAND_PENDING = 'Final Demand Pending',
  CASE_BUILDING = 'Case Building (Filing Packet)',
  READY_TO_FILE = 'Ready for Court Filing',
  FILED = 'Filed in Court'
}

export interface GeneratedDocument {
  id: string;
  type: 'DEMAND_1' | 'DEMAND_2' | 'FINAL_DEMAND' | 'FORM_1_SCC' | 'FORM_1_A_SCC' | 'FORM_2_SCC' | 'BOARD_RES' | 'SEC_CERT';
  generatedDate: string;
  content: string;
  downloaded: boolean;
}

export interface ActionableDocument {
  id: string;
  type: 'CONTRACT' | 'INVOICE' | 'PROMISSORY_NOTE' | 'STATEMENT_OF_ACCOUNT' | 'OTHER';
  description: string;
  dateIssued: string;
  amount?: number;
  isCertified: boolean;
  copies: number; // Should be 2 for small claims
}

export interface DemandLetterProof {
  id: string;
  demandType: '1ST' | '2ND' | 'FINAL';
  dateSent: string;
  method: 'REGISTERED_MAIL' | 'PERSONAL_SERVICE' | 'COURIER';
  registryNumber?: string;
  receiptDate?: string;
  proofAttached: boolean;
}

export interface BarangayRequirement {
  isRequired: boolean;
  reason: 'SAME_CITY' | 'DIFFERENT_CITY' | 'NOT_APPLICABLE';
  certificateNumber?: string;
  certificateDate?: string;
  certificateAttached: boolean;
}

export interface FilingFeeCalculation {
  basicFee: number;
  frequentFilerSurcharge: number; // ₱500 if >10 cases/year
  totalFee: number;
  casesFiledThisYear: number;
}

export interface SmallClaimsCaseDetails {
  // Debtor Information
  debtorName: string;
  debtorAddress: string;
  debtorContact?: string;
  debtorCity?: string; // For barangay conciliation check

  // Debt Information
  principalAmount: number;
  interestRate?: number;
  penaltyAmount?: number;
  totalAmount: number;
  loanDate: string;
  dueDate: string;
  referenceNumber: string;

  // Corporate Information
  creditorName: string;
  creditorAddress: string;
  creditorCity?: string; // For barangay conciliation check
  authorizedOfficer: string;
  officerPosition: string;

  // Court Information
  courtBranch: string;
  courtAddress?: string;

  // 2025 Compliance Fields
  actionableDocuments?: ActionableDocument[];
  demandLetterProofs?: DemandLetterProof[];
  barangayRequirement?: BarangayRequirement;
  filingFees?: FilingFeeCalculation;
  isWithinJurisdiction?: boolean; // totalAmount <= 1,000,000
}

export interface SmallClaimsData {
  courtBranch?: string;
  filingDate?: string;
  stage: SmallClaimsStage;
  demand1Date?: string;
  demand2Date?: string;
  finalDemandDate?: string;
  isSoaGenerated?: boolean;
  isNonForumGenerated?: boolean;
  isBoardResGenerated?: boolean;
  claimsFormGenerated?: boolean;
  caseDetails?: SmallClaimsCaseDetails;
  generatedDocuments?: GeneratedDocument[];
}

export interface ClientCampaign {
  id: string;
  name: string;
  logo?: string;
  status?: string;
  totalExposure: number;
  activeCases: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
}

export interface AnomalyAlert {
  id: string;
  type: 'EXFILTRATION' | 'UNAUTHORIZED_ACCESS' | 'BEHAVIORAL' | 'SENSITIVE_MODIFICATION' | 'SQL_INJECTION';
  severity: 'CRITICAL' | 'WARNING';
  agentName: string;
  agentId: string;
  timestamp: string;
  details: string;
}

export interface CallRecording {
  id: string;
  agentName: string;
  debtorName: string;
  timestamp: string;
  duration: string;
  status: string;
  auditScore?: number;
  sentiment?: string;
}

export interface Activity {
  id: string;
  debtorId: string;
  type: CommunicationType;
  date: string;
  agent: string;
  outcome: string;
  notes: string;
  visualProof?: string;
}

export interface StrategyStep {
  id: string;
  dayOffset: number;
  channel: CommunicationType;
  templateId: string;
  isMandatory: boolean;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  bucket: string;
  status: 'Active' | 'Draft' | 'Paused';
  lastModified: string;
  steps: StrategyStep[];
}

export enum NoticeType {
  SEC_138 = 'SEC-138 (BP 22)',
  ARBITRATION = 'Arbitration Notice',
  CONCILIATION = 'Conciliation Invite',
  DEMAND_NOTICE = 'Final Demand',
  SUMMONS = 'Court Summons'
}

export enum LegalCaseStatus {
  DRAFTING = 'Drafting',
  NOTICE_SENT = 'Notice Sent',
  CASE_FILED = 'Case Filed',
  HEARING_STAGE = 'Hearing Stage',
  CLOSED = 'Closed'
}

export interface LegalCase {
  id: string;
  debtorId: string;
  debtorName: string;
  loanId: string;
  amount: number;
  noticeType: NoticeType;
  status: LegalCaseStatus;
  nextHearingDate?: string;
  filingDate?: string;
  lastUpdateDate: string;
  lawyerName: string;
  courtName: string;
  caseNumber: string;
  notes: string;
}

export interface LegalInfo {
  caseId: string;
  lawyer: string;
  status: LegalCaseStatus;
}

export enum ComplaintStatus {
  NEW = 'New',
  UNDER_INVESTIGATION = 'Under Investigation',
  RESOLVED = 'Resolved',
  DISMISSED = 'Dismissed'
}

export enum ComplaintCategory {
  HARASSMENT = 'Harassment Allegation',
  PAYMENT_DISCREPANCY = 'Payment Discrepancy',
  APP_ERROR = 'Digital/App Error',
  LEGAL_DISPUTE = 'Legal Rights Dispute',
  IDENTITY_THEFT = 'Identity Theft/Fraud',
  SERVICE = 'General Service'
}

export interface Complaint {
  id: string;
  debtorId: string;
  debtorName: string;
  loanId: string;
  category: ComplaintCategory;
  description: string;
  timestamp: string;
  status: ComplaintStatus;
  severity: number;
  assignedTo?: string;
  resolution?: string;
  resolutionDate?: string;
  evidenceAttachments?: string[];
  bspReferenceNumber?: string; // BSP Complaint Reference
  ntcReferenceNumber?: string; // NTC Reference for telecom-related
  dtiReferenceNumber?: string; // DTI Consumer Welfare Reference
  npcCompliance?: boolean; // National Privacy Commission compliance
  responseDeadline?: string;
  escalationLevel?: 'INTERNAL' | 'BSP' | 'NTC' | 'DTI' | 'NPC' | 'LEGAL';
  communicationLog?: Array<{
    timestamp: string;
    action: string;
    performedBy: string;
    notes: string;
  }>;
}

export interface VoiceProfile {
  id: string;
  name: string;
  status: 'trained' | 'idle' | 'training';
  lastUsed: string;
  traits: string;
  baseVoice: string;
}

export interface InternalMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface InternalCall {
  id: string;
  callerId: string;
  receiverId: string;
  startTime: string;
  status: 'ongoing' | 'completed' | 'missed';
  type: 'voice' | 'video';
}

export interface QAAudit {
  recordingId: string;
  summary: string;
  detectedLanguage: string;
  transcript: { speaker: string, text: string, timestamp: string }[];
  complianceChecks: {
    disclosureMet: boolean;
    empathyMaintained: boolean;
    ptpNegotiated: boolean;
    hostilityHandled: boolean;
  };
  keyTakeaways: string[];
}

export interface CampaignFilter {
  minAge: number;
  maxAge: number;
  riskLevels: string[];
  status: CaseStatus[];
}

export interface CampaignRule {
  id: string;
  triggerEvent: string;
  action: CommunicationType;
  templateId: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: CommunicationType;
  strategyId: string;
  status: 'active' | 'paused' | 'completed';
  totalTargets: number;
  processed: number;
  engagementRate: number;
  recoveredAmount: number;
  totalLiability: number;
  startTime: string;
  lastUpdate: string;
  aiSuccessPrediction: number;
  filters?: CampaignFilter;
  rules?: CampaignRule[];
}

export interface QuickNote {
  id: string;
  content: string;
  timestamp: string;
}

export type AttendanceSessionType = 'WORK' | 'BREAK' | 'LUNCH';

export interface AttendanceSession {
  id: string;
  userId: string;
  type: AttendanceSessionType;
  startTime: string;
  endTime?: string;
}

export interface UserAttendance {
  userId: string;
  date: string;
  sessions: AttendanceSession[];
  status: 'OFFLINE' | 'WORKING' | 'ON_BREAK' | 'ON_LUNCH';
  totalWorkMinutes: number;
  totalBreakMinutes: number;
}

// Grievance/Dispute Management Types
export type GrievanceCategory =
  | 'HARASSMENT'
  | 'UNFAIR_PRACTICE'
  | 'PRIVACY_VIOLATION'
  | 'INCORRECT_AMOUNT'
  | 'UNAUTHORIZED_CONTACT'
  | 'THREATENING_BEHAVIOR'
  | 'IDENTITY_THEFT'
  | 'FRAUD_CLAIM'
  | 'PAYMENT_DISPUTE'
  | 'DATA_BREACH'
  | 'OTHER';

export type EscalationLevel =
  | 'INTERNAL'
  | 'MANAGEMENT'
  | 'LEGAL_TEAM'
  | 'DTI'
  | 'NPC'
  | 'SEC'
  | 'BARANGAY'
  | 'CLIENT_CREDITOR';

export type GrievanceStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'UNDER_INVESTIGATION'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export interface GrievanceEvidence {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  fileUrl: string;
  description?: string;
}

export interface AgentNarrative {
  agentId: string;
  agentName: string;
  narrative: string;
  timestamp: string;
  version: number;
}

export interface AIAnalysis {
  suggestedCategory: GrievanceCategory;
  confidence: number;
  keyIssues: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
  analyzedAt: string;
}

export interface ApprovalStep {
  id: string;
  approverRole: string;
  approverName?: string;
  approverId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  timestamp?: string;
  order: number;
}

export interface IncidentReport {
  id: string;
  grievanceId: string;
  generatedBy: string;
  generatedAt: string;
  title: string;
  summary: string;
  findings: string;
  recommendations: string;
  pdfUrl?: string;
  status: 'DRAFT' | 'GENERATED' | 'SENT';
  sentAt?: string;
  sentTo?: string[];
}

export interface Grievance {
  id: string;
  ticketNumber: string;

  // Debtor Information
  debtorId?: string;
  debtorName: string;
  debtorAccount?: string;
  debtorContact?: string;

  // Complaint Details
  category: GrievanceCategory;
  aiSuggestedCategory?: GrievanceCategory;
  complaintDescription: string;
  dateOfIncident: string;

  // Agent Narrative
  agentNarratives: AgentNarrative[];

  // AI Analysis
  aiAnalysis?: AIAnalysis;

  // Evidence & Documentation
  evidence: GrievanceEvidence[];

  // Escalation
  escalationLevel: EscalationLevel;
  escalationReason?: string;

  // Status & Workflow
  status: GrievanceStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  // Approval Matrix
  approvalSteps: ApprovalStep[];
  currentApprovalStep: number;

  // Incident Report
  incidentReport?: IncidentReport;

  // Resolution
  resolutionNotes?: string;
  resolutionDate?: string;
  resolutionBy?: string;

  // Client Communication
  clientNotified: boolean;
  clientNotificationDate?: string;

  // Financial Adjustment Fields
  disputedAmount?: number;
  desiredResolution?: string;

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
}

export interface CommunicationTemplate {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  content: string;
  channel: CommunicationType;
  category: 'INITIAL_DEMAND' | 'FOLLOW_UP' | 'PTP_REMINDER' | 'SETTLEMENT_OFFER' | 'LEGAL_WARNING' | 'FIELD_ADVISORY' | 'CUSTOM';
  version: string;
  isOfficial: boolean;
  isAiEnhanced: boolean;
  lastModified: string;
}

export interface AIPersonality {
  id: string;
  name: string;
  description: string;
  traits: string[];
  baseTone: 'FIRM' | 'EMPATHETIC' | 'PROFESSIONAL' | 'PERSUASIVE' | 'NEGOTIATOR';
  instructions: string;
  restrictedPhrases: string[];
  suggestedPhrases: string[];
  linkedTemplateId?: string;
}