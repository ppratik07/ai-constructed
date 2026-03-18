import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { estimateCost } from '@/services/cost';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, plot_size, floors } = body;

    if (!projectId || !plot_size || floors === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const breakdown = estimateCost(plot_size, Number(floors));

    const { data, error } = await supabase
      .from('projects')
      .update({ estimated_cost: breakdown.total })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ breakdown, project: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
