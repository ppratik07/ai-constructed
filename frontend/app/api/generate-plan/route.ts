import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateConstructionPlan, generateRoomLayout } from '@/services/ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, plot_size, floors, style } = body;

    if (!projectId || !plot_size || floors === undefined || !style) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate text plan first, then pass it to layout so rooms match the description
    const plan = await generateConstructionPlan(plot_size, Number(floors), style);
    const rooms = await generateRoomLayout(plot_size, Number(floors), style, plan);

    const { data, error } = await supabase
      .from('projects')
      .update({
        plan_description: plan,
        floor_plan_json: JSON.stringify(rooms),
      })
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan, rooms, project: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
