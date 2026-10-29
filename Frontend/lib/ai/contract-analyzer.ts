import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export const ClauseAnalysisSchema = z.object({
  title: z.string(),
  originalText: z.string(),
  riskLevel: z.enum(['high', 'medium', 'low']),
  issueRationale: z.string(),
  suggestedRevision: z.string(),
  plainEnglishRedline: z.string(),
});

export const MissingProtectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  severity: z.enum(['critical', 'recommended', 'optional']),
  suggestedClause: z.string(),
});

export const ObligationSchema = z.object({
  title: z.string(),
  dueDate: z.string(),
  party: z.enum(['contractor', 'client', 'mutual']),
  description: z.string(),
});

export const ContractAnalysisResultSchema = z.object({
  contractTitle: z.string(),
  overallScore: z.number().min(0).max(100),
  overallRiskLevel: z.enum(['high', 'medium', 'low']),
  summary: z.string(),
  clauses: z.array(ClauseAnalysisSchema),
  missingProtections: z.array(MissingProtectionSchema),
  obligations: z.array(ObligationSchema),
  negotiationEmail: z.object({
    subject: z.string(),
    body: z.string(),
  }),
});

export type ContractAnalysisResult = z.infer<typeof ContractAnalysisResultSchema>;

export interface AnalyzeContractOptions {
  contractText: string;
  contractType?: string;
  jurisdiction?: string;
  userRole?: string;
}

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
];

const JSON_SCHEMA = {
  type: 'OBJECT' as const,
  properties: {
    contractTitle: { type: 'STRING' as const },
    overallScore: { type: 'INTEGER' as const },
    overallRiskLevel: { type: 'STRING' as const, enum: ['high', 'medium', 'low'] },
    summary: { type: 'STRING' as const },
    clauses: {
      type: 'ARRAY' as const,
      items: {
        type: 'OBJECT' as const,
        properties: {
          title: { type: 'STRING' as const },
          originalText: { type: 'STRING' as const },
          riskLevel: { type: 'STRING' as const, enum: ['high', 'medium', 'low'] },
          issueRationale: { type: 'STRING' as const },
          suggestedRevision: { type: 'STRING' as const },
          plainEnglishRedline: { type: 'STRING' as const },
        },
        required: ['title', 'originalText', 'riskLevel', 'issueRationale', 'suggestedRevision', 'plainEnglishRedline'],
      },
    },
    missingProtections: {
      type: 'ARRAY' as const,
      items: {
        type: 'OBJECT' as const,
        properties: {
          title: { type: 'STRING' as const },
          description: { type: 'STRING' as const },
          severity: { type: 'STRING' as const, enum: ['critical', 'recommended', 'optional'] },
          suggestedClause: { type: 'STRING' as const },
        },
        required: ['title', 'description', 'severity', 'suggestedClause'],
      },
    },
    obligations: {
      type: 'ARRAY' as const,
      items: {
        type: 'OBJECT' as const,
        properties: {
          title: { type: 'STRING' as const },
          dueDate: { type: 'STRING' as const },
          party: { type: 'STRING' as const, enum: ['contractor', 'client', 'mutual'] },
          description: { type: 'STRING' as const },
        },
        required: ['title', 'dueDate', 'party', 'description'],
      },
    },
    negotiationEmail: {
      type: 'OBJECT' as const,
      properties: {
        subject: { type: 'STRING' as const },
        body: { type: 'STRING' as const },
      },
      required: ['subject', 'body'],
    },
  },
  required: [
    'contractTitle',
    'overallScore',
    'overallRiskLevel',
    'summary',
    'clauses',
    'missingProtections',
    'obligations',
    'negotiationEmail',
  ],
};

async function callGeminiWithRetry(ai: GoogleGenAI, systemPrompt: string, userPrompt: string) {
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            { text: systemPrompt },
            { text: userPrompt },
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: JSON_SCHEMA,
          },
        });

        const text = response.text?.trim() || '';
        if (text) {
          return { text, modelUsed: model };
        }
      } catch (err: unknown) {
        lastError = err;
        const status = (err as { status?: number; code?: number })?.status || (err as { status?: number; code?: number })?.code;
        if (status === 503 || status === 429) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('All candidate Gemini models failed to respond.');
}

export async function analyzeContract(options: AnalyzeContractOptions): Promise<ContractAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemPrompt = `
You are an elite legal counsel and contract redlining specialist representing an independent software contractor, freelancer, or agency.
Your client's commercial safety comes first.
Analyze the provided contract thoroughly:
1. Identify high-risk, medium-risk, and low-risk clauses.
2. In 'suggestedRevision', provide legally sound, balanced replacement clause language ready to substitute into the contract.
3. Identify standard freelancer protections MISSING from this contract (e.g. kill fee, mutual indemnity cap, IP transfer upon full payment only).
4. Extract all explicit obligations and deadlines.
5. Compose a professional negotiation email proposing the redlines respectfully.
6. Calculate 'overallScore' as a 0-100 Risk Score:
   - 0 to 30 = Low Risk (safe, contractor-friendly terms)
   - 31 to 69 = Medium Risk (standard paper with moderate one-sided terms)
   - 70 to 100 = High Risk (severe liabilities, dangerous non-competes, predatory terms)
   IMPORTANT: Higher score means HIGHER risk.
`;

  const userPrompt = `
Contract Type Context: ${options.contractType || 'Independent Contractor / Software Agreement'}
User Jurisdiction: ${options.jurisdiction || 'Default / Not Specified'}
Role: ${options.userRole || 'Contractor / Freelancer'}

CONTRACT TEXT:
---
${options.contractText}
---
`;

  try {
    const { text } = await callGeminiWithRetry(ai, systemPrompt, userPrompt);
    const parsedJson = JSON.parse(text);
    const validated = ContractAnalysisResultSchema.parse(parsedJson);

    // Enforce Higher Number = Higher Risk convention
    if (validated.overallRiskLevel === 'high' && validated.overallScore <= 40) {
      validated.overallScore = 100 - validated.overallScore;
    } else if (validated.overallRiskLevel === 'low' && validated.overallScore >= 60) {
      validated.overallScore = 100 - validated.overallScore;
    }

    return validated;
  } catch (error: unknown) {
    console.error('Contract Analysis Pipeline Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown Gemini error';
    throw new Error(`AI Analysis failed: ${message}`);
  }
}
