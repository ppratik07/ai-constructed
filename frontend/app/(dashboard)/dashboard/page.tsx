import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProjectCard from '@/components/projects/ProjectCard';
import Button from '@/components/ui/Button';
import type { Project } from '@/types';

export const metadata = {
  title: 'Dashboard — AI-Constructed',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const projectList = (projects ?? []) as Project[];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {projectList.length === 0
              ? 'No projects yet — create your first one!'
              : `You have ${projectList.length} project${projectList.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/projects/create">
          <Button size="md">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Project
          </Button>
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6">
          Failed to load projects: {error.message}
        </div>
      )}

      {/* Empty state */}
      {!error && projectList.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">
            No projects yet
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs">
            Create your first construction project and let AI plan it for you.
          </p>
          <Link href="/projects/create">
            <Button>Create your first project</Button>
          </Link>
        </div>
      )}

      {/* Project grid */}
      {projectList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectList.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
