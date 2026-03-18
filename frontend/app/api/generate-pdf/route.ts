import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateProjectPdf } from '@/services/pdf';
import { estimateCost } from '@/services/cost';
import type { Project } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the project
    const { data: project, error: fetchErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (fetchErr || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Generate cost breakdown
    const cost = estimateCost(project.plot_size, project.floors);

    // Generate PDF bytes
    const pdfBytes = await generateProjectPdf(project as Project, cost);

    // Upload to Supabase Storage
    const fileName = `${user.id}/${projectId}/report.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('project-reports')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('project-reports').getPublicUrl(fileName);

    // Persist URL to project record
    await supabase
      .from('projects')
      .update({ pdf_url: publicUrl })
      .eq('id', projectId)
      .eq('user_id', user.id);

    return NextResponse.json({ url: publicUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
