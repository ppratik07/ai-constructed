import Link from 'next/link';
import Card from '@/components/ui/Card';
import type { Project } from '@/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <Card className="hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors capitalize">
                  {project.style} Style
                </p>
                <p className="text-xs text-slate-500">{formatDate(project.created_at)}</p>
              </div>
            </div>
            {/* Status badges */}
            <div className="flex flex-col gap-1 items-end">
              {project.plan_description && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Plan ready
                </span>
              )}
              {project.estimated_cost != null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Cost estimated
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-500">Plot Size</p>
              <p className="text-sm font-medium text-slate-800">{project.plot_size}</p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-500">Floors</p>
              <p className="text-sm font-medium text-slate-800">{project.floors}</p>
            </div>
          </div>

          {/* Cost preview */}
          {project.estimated_cost != null && (
            <div className="pt-1 border-t border-slate-100">
              <p className="text-xs text-slate-500">Estimated Cost</p>
              <p className="text-base font-bold text-blue-700">
                ${project.estimated_cost.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
