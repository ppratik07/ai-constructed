import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ProjectDetail from '@/components/projects/ProjectDetail';
import type { Project } from '@/types';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Project ${id.slice(0, 8).toUpperCase()} — AI-Constructed` };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!project) notFound();

  return <ProjectDetail project={project as Project} />;
}
