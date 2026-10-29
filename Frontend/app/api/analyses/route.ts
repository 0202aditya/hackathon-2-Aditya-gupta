import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseDocument, redactPII } from '@/lib/parsers/document';
import { analyzeContract } from '@/lib/ai/contract-analyzer';

export const maxDuration = 60; // Allow sufficient time for AI processing

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: analyses, error: dbError } = await supabase
      .from('analyses')
      .select('id, title, contract_type, status, overall_risk, risk_score, summary, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ analyses: analyses || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to analyze contracts.' }, { status: 401 });
    }

    let contractText = '';
    let contractType = 'contract';
    let shouldRedact = false;
    let fileName = 'Contract';
    let dealContext: any = undefined;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      contractType = (formData.get('contractType') as string) || 'contract';
      shouldRedact = formData.get('redactPII') === 'true';
      const rawDealContext = formData.get('dealContext') as string | null;
      if (rawDealContext) {
        try {
          dealContext = JSON.parse(rawDealContext);
        } catch {
          // ignore parse error
        }
      }

      if (!file) {
        return NextResponse.json({ error: 'No contract file was provided in the upload.' }, { status: 400 });
      }

      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const parsed = await parseDocument(uint8, file.name);
      contractText = parsed.text;
    } else {
      const body = await req.json();
      contractText = (body.text || '').trim();
      contractType = body.contractType || 'contract';
      shouldRedact = Boolean(body.redactPII);
      fileName = body.fileName || 'Pasted Contract';
      dealContext = body.dealContext;

      if (!contractText || contractText.length < 50) {
        return NextResponse.json(
          { error: 'Contract text is too short. Please paste at least a paragraph or clause.' },
          { status: 400 }
        );
      }
    }

    // Apply PII redaction if user opted in
    const textToAnalyze = shouldRedact ? redactPII(contractText) : contractText;

    // Fetch user profile for customization context if available
    const { data: profile } = await supabase
      .from('profiles')
      .select('jurisdiction, entity_type, services, non_negotiables')
      .eq('id', user.id)
      .maybeSingle();

    // Determine clean effective contract type
    const effectiveContractType =
      (dealContext?.contractType === 'Other' ? dealContext.customContractType : dealContext?.contractType) ||
      contractType ||
      'contract';

    // Call Gemini Contract Engine with rich deal context
    const analysisResult = await analyzeContract({
      contractText: textToAnalyze,
      contractType: effectiveContractType,
      jurisdiction: profile?.jurisdiction || undefined,
      userRole: profile?.entity_type ? `${profile.entity_type} (${profile.services || ''})` : undefined,
      dealContext,
    });

    // Save Analysis Record to Supabase (with deal_context or raw_ai_output fallback)
    const baseRecord = {
      user_id: user.id,
      title: analysisResult.contractTitle || fileName,
      contract_type: effectiveContractType,
      status: 'completed',
      overall_risk: analysisResult.overallRiskLevel,
      risk_score: analysisResult.overallScore,
      summary: analysisResult.summary,
      missing_protections: analysisResult.missingProtections,
      raw_ai_output: { ...analysisResult, dealContext },
      model: 'gemini-3.5-flash',
      redacted: shouldRedact,
    };

    let analysis: any = null;
    let insertAnalysisError: any = null;

    // Try inserting with deal_context column first
    const firstAttempt = await supabase
      .from('analyses')
      .insert({ ...baseRecord, deal_context: dealContext || null })
      .select('id')
      .single();

    if (firstAttempt.error && firstAttempt.error.message.includes('deal_context')) {
      // Column does not exist yet in Supabase, insert without deal_context column
      const fallbackAttempt = await supabase
        .from('analyses')
        .insert(baseRecord)
        .select('id')
        .single();
      analysis = fallbackAttempt.data;
      insertAnalysisError = fallbackAttempt.error;
    } else {
      analysis = firstAttempt.data;
      insertAnalysisError = firstAttempt.error;
    }

    if (insertAnalysisError || !analysis) {
      console.error('Failed to insert analysis:', insertAnalysisError);
      return NextResponse.json({ error: 'Failed to save analysis record.' }, { status: 500 });
    }

    // Save Clauses to Supabase
    if (analysisResult.clauses && analysisResult.clauses.length > 0) {
      const clauseRecords = analysisResult.clauses.map((c, index) => ({
        analysis_id: analysis.id,
        position: index + 1,
        title: c.title,
        clause_type: c.title,
        original_text: c.originalText,
        risk_level: c.riskLevel,
        explanation: c.issueRationale,
        impact: c.plainEnglishRedline,
        suggested_redline: c.suggestedRevision,
        negotiation_priority: c.riskLevel === 'high' ? 1 : c.riskLevel === 'medium' ? 2 : 3,
        user_decision: 'pending',
      }));

      const { error: insertClausesError } = await supabase
        .from('clauses')
        .insert(clauseRecords);

      if (insertClausesError) {
        console.error('Failed to insert clauses:', insertClausesError);
      }
    }

    // Save Obligations to Supabase
    if (analysisResult.obligations && analysisResult.obligations.length > 0) {
      const obligationRecords = analysisResult.obligations.map((o) => ({
        analysis_id: analysis.id,
        type: o.party,
        description: `${o.title}: ${o.description}`,
      }));

      const { error: insertObligationsError } = await supabase
        .from('obligations')
        .insert(obligationRecords);

      if (insertObligationsError) {
        console.error('Failed to insert obligations:', insertObligationsError);
      }
    }

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      result: analysisResult,
    });
  } catch (err: unknown) {
    console.error('API /analyses Error:', err);
    const message = err instanceof Error ? err.message : 'An unexpected error occurred during analysis.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
