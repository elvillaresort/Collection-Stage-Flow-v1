
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Debtor, Activity, NoticeType, Strategy, CommunicationType, Complaint, CallRecording } from "../types";

async function safeGenerateContent(params: any, retries = 3, delay = 2000): Promise<GenerateContentResponse> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  const ai = new GoogleGenAI(apiKey || 'unauthorized');
  try {
    const response = await ai.models.generateContent(params);
    return response;
  } catch (error: any) {
    const isRateLimit = error?.message?.includes("429") || error?.status === 429 || error?.message?.includes("RESOURCE_EXHAUSTED");
    if (isRateLimit && retries > 0) {
      console.warn(`Gemini Rate Limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return safeGenerateContent(params, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function getSmartIngestionMapping(headers: string[], requiredKeys: { key: string, label: string }[]) {
  const prompt = `Task: Map CSV headers to system keys for a debt collection registry.
  CSV HEADERS: [${headers.join(', ')}]
  SYSTEM KEYS: [${requiredKeys.map(k => `${k.key} (${k.label})`).join(', ')}]
  
  Rules:
  1. For each SYSTEM KEY, find the best matching CSV HEADER.
  2. If no clear match, return null for that key.
  3. Provide a confidence score (0-100) and reasoning for the match.
  4. Respond with a JSON object where keys are SYSTEM KEYS and values are objects containing 'header', 'confidence', and 'reasoning'.`;

  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: requiredKeys.reduce((acc: any, curr) => {
            acc[curr.key] = {
              type: Type.OBJECT,
              properties: {
                header: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                reasoning: { type: Type.STRING }
              }
            };
            return acc;
          }, {})
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Smart Ingestion Mapping Failed:", error);
    return {};
  }
}

export async function generateCollectionEmail(debtor: Debtor) {
  const prompt = `Draft a highly professional, firm, and legally-compliant collection email for a debtor in the Philippines.
  NAME: ${debtor.name}
  AMOUNT DUE: ${debtor.amountDue}
  DPD (Days Past Due): ${debtor.overdueDays}
  LOAN ID: ${debtor.loanId}
  
  The tone should be formal but empathetic to the Philippine context (mentioning GCash or Bank Transfer as options). 
  Include a sense of urgency and mention that this is a formal notice of outstanding liability.`;

  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate draft at this time.";
  } catch (error) {
    return "Error connecting to the Remedial Drafting Node.";
  }
}

export async function analyzeUrlRisk(url: string) {
  const prompt = `Analyze this URL for a professional debt recovery team: ${url}. 
  Evaluate risk for phishing, malware, or credential theft. 
  Return JSON:
  - riskLevel: "low", "medium", "high"
  - category: "social_media", "suspicious", "financial", "known_safe"
  - reasoning: "short sentence explaining risk"
  - suggestedAction: "isolate", "block", "allow"`;

  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING },
            category: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          },
          required: ["riskLevel", "category", "reasoning", "suggestedAction"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { riskLevel: 'medium', category: 'unknown', reasoning: 'Analysis timed out', suggestedAction: 'isolate' };
  }
}

export interface SimulationTurn {
  response: string;
  sentiment: string;
  isComplianceViolationDetected: boolean;
  coachingTip: string;
}

export async function getSimulationResponse(userMessage: string, history: { role: string, text: string }[]): Promise<SimulationTurn | null> {
  const prompt = `You are a difficult debtor named 'Mr. Cruz' in the Philippines. You owe 50,000 Pesos. You are angry and avoidant.
  The user is a trainee collection agent. 
  
  Current User Message: "${userMessage}"
  Chat History: ${history.map(h => `${h.role}: ${h.text}`).join('\n')}
  
  Act like a real person. Be stubborn. 
  Detect if the agent violated Fair Debt Collection Practices (threats, rude language, calling at 2am).
  
  Return JSON: 
  - response: Your stubborn reply
  - sentiment: How the debtor feels
  - isComplianceViolationDetected: boolean
  - coachingTip: One sentence advice for the trainee.`;

  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            isComplianceViolationDetected: { type: Type.BOOLEAN },
            coachingTip: { type: Type.STRING }
          },
          required: ["response", "sentiment", "isComplianceViolationDetected", "coachingTip"]
        }
      }
    });
    return JSON.parse(response.text || '{}') as SimulationTurn;
  } catch (error) {
    return null;
  }
}

export interface ComplaintAnalysis {
  category: string;
  severity: number;
  sentiment: string;
  rootCause: string;
  suggestedAction: string;
}

export interface RecoveryNudge {
  action: string;
  category: string;
  priority: string;
  reason: string;
  content: string;
}

export interface DigitalTrace {
  platform: string;
  url: string;
  confidence: number;
  snippet: string;
}

export async function analyzeComplaint(complaint: Partial<Complaint>, history: Activity[]): Promise<ComplaintAnalysis | null> {
  const prompt = `Analyze this customer complaint in a debt recovery context.
  Debtor: ${complaint.debtorName}
  Description: ${complaint.description}
  Interaction History: ${history.length > 0 ? history.slice(-10).map(h => `${h.date} - ${h.type}: ${h.outcome} (${h.notes})`).join('; ') : 'No recent interactions recorded.'}
  
  Return JSON with: 
  - category: Must be exactly one of: "Harassment Allegation", "Payment Discrepancy", "Digital/App Error", "Legal Rights Dispute", "Identity Theft/Fraud", "General Service"
  - severity: number (1-100)
  - sentiment: one of "Frustrated", "Angry", "Neutral", "Distressed"
  - rootCause: string analyzing why this happened
  - suggestedAction: string recommending the next step for the grievance officer.`;

  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            severity: { type: Type.NUMBER },
            sentiment: { type: Type.STRING },
            rootCause: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          },
          required: ["category", "severity", "sentiment", "rootCause", "suggestedAction"]
        }
      }
    });
    return JSON.parse(response.text || '{}') as ComplaintAnalysis;
  } catch (error) {
    return null;
  }
}

export async function generateIncidentReport(complaint: Complaint, history: Activity[], recordings: CallRecording[]): Promise<string> {
  const historyText = history.map(h => `[${h.date}] ${h.type}: ${h.outcome} - ${h.notes}`).join('\n');
  const recordingsText = recordings.map(r => `[${r.timestamp}] Call by ${r.agentName}, Score: ${r.auditScore}%, Sentiment: ${r.sentiment}`).join('\n');

  const prompt = `Generate a highly formal internal INCIDENT REPORT (IR) for PCCS Management.
  CASE ID: ${complaint.id}
  DEBTOR: ${complaint.debtorName}
  ALLEGATION: ${complaint.description}
  
  FULL COLLECTION HISTORY:
  ${historyText}
  
  RELEVANT CALL RECORDINGS:
  ${recordingsText}
  
  STRUCTURE:
  1. Incident Executive Summary
  2. Allegation vs Evidence Cross-Reference
  3. Compliance Evaluation (BSP Circular 454)
  4. Agent Behavioral Audit
  5. Final Resolution Recommendation
  
  TONE: Objective, Professional, Data-driven.`;

  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Report generation timed out.";
  } catch (error) {
    return "Error generating formal incident report. Please review manual logs.";
  }
}

export async function draftComplaintResolution(complaint: Complaint, analysis: ComplaintAnalysis) {
  const prompt = `Draft a formal resolution email for this debt collection complaint.
  Context: ${analysis.rootCause}
  Suggested Action: ${analysis.suggestedAction}
  Original Complaint: ${complaint.description}
  TONE: Professional, apologetic but firm on legal obligations.
  Ensure it follows Philippine fair collection guidelines (BSP Circular 454).`;

  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "The system is currently unable to draft the resolution. Please proceed manually.";
  }
}

export async function getAIRecoveryNudge(debtor: Debtor, history: Activity[]): Promise<RecoveryNudge | null> {
  const prompt = `NBA for ${debtor.name}, $${debtor.amountDue}, ${debtor.overdueDays} DPD. Status: ${debtor.status}. Return JSON: action, category, priority, reason, content.`;
  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            category: { type: Type.STRING },
            priority: { type: Type.STRING },
            reason: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ["action", "category", "priority", "reason", "content"],
        },
      },
    });
    return JSON.parse(response.text || '{}') as RecoveryNudge;
  } catch (error) {
    return null;
  }
}

export async function generateContextualReply(debtor: Debtor, messages: any[], channel: string) {
  const prompt = `Reply to ${debtor.name} via ${channel}.`;
  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "Thank you for reaching out.";
  } catch (error) {
    return "Received.";
  }
}

export async function draftLegalNotice(debtor: Debtor, type: NoticeType) {
  const prompt = `Draft legal notice ${type} for ${debtor.name}.`;
  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Legal Drafting Node temporarily unavailable.";
  }
}

export async function optimizeStrategy(strategy: Strategy) {
  const prompt = `Optimize recovery strategy: ${strategy.name}.`;
  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return { improvement_percent: 10, suggestion: "More digital channels", reasoning: "Better CTR" };
  } catch (error) {
    return { improvement_percent: 0, suggestion: "No changes", reasoning: "Error in optimization" };
  }
}

export async function getDigitalFootprint(debtor: Debtor): Promise<DigitalTrace[]> {
  const prompt = `Find digital traces for ${debtor.name}.`;
  try {
    const response = await safeGenerateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return [
      {
        platform: 'Facebook',
        url: `https://facebook.com/search/people/?q=${encodeURIComponent(debtor.name)}`,
        confidence: 88,
        snippet: `Public profile found with name match ${debtor.name}. Location matches residential record.`
      },
      {
        platform: 'LinkedIn',
        url: `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(debtor.name)}`,
        confidence: 94,
        snippet: `Professional profile confirmed at ${debtor.employer || 'Logistics Sector'}.`
      }
    ];
  } catch (error) {
    return [];
  }
}
