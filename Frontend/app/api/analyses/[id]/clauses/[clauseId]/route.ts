import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; clauseId: string }> }
) {
  try {
    const { id, clauseId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership of the parent analysis
    const { data: analysis } = await supabase
      .from('analyses')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const body = await req.json();
    const { user_decision, edited_redline } = body;

    const updates: Record<string, unknown> = {};
    if (user_decision !== undefined) {
      updates.user_decision = user_decision;
    }
    if (edited_redline !== undefined) {
      updates.edited_redline = edited_redline;
    }

    const { data: updatedClause, error: updateError } = await supabase
      .from('clauses')
      .update(updates)
      .eq('id', clauseId)
      .eq('analysis_id', id)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ clause: updatedClause });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
