'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import MarkdownText from '@/components/ui/MarkdownText';
import FloorPlanSVG from '@/components/projects/FloorPlanSVG';
import type { Project, CostBreakdown, FloorRoom } from '@/types';

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project: initial }: ProjectDetailProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project>(initial);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingCost, setLoadingCost] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'layout'>('text');

  const floorRooms = useMemo<FloorRoom[]>(() => {
    if (!project.floor_plan_json) return [];
    try { return JSON.parse(project.floor_plan_json) as FloorRoom[]; }
    catch { return []; }
  }, [project.floor_plan_json]);

  // ── Generate Plan ──────────────────────────────────────────────
  async function handleGeneratePlan() {
    setLoadingPlan(true);
    const toastId = toast.loading('Generating AI construction plan…');
    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          plot_size: project.plot_size,
          floors: project.floors,
          style: project.style,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
      toast.success('Plan generated!', { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate plan';
      toast.error(msg, { id: toastId });
    } finally {
      setLoadingPlan(false);
    }
  }

  // ── Estimate Cost ──────────────────────────────────────────────
  async function handleEstimateCost() {
    setLoadingCost(true);
    const toastId = toast.loading('Calculating cost estimate…');
    try {
      const res = await fetch('/api/estimate-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          plot_size: project.plot_size,
          floors: project.floors,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject(data.project);
      setCostBreakdown(data.breakdown);
      toast.success('Cost estimated!', { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to estimate cost';
      toast.error(msg, { id: toastId });
    } finally {
      setLoadingCost(false);
    }
  }

  // ── Generate PDF ───────────────────────────────────────────────
  async function handleGeneratePdf() {
    setLoadingPdf(true);
    const toastId = toast.loading('Building your PDF report…');
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProject((p) => ({ ...p, pdf_url: data.url }));
      toast.success('PDF ready!', { id: toastId });
      // Auto-open download
      window.open(data.url, '_blank');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate PDF';
      toast.error(msg, { id: toastId });
    } finally {
      setLoadingPdf(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-1 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900 capitalize">
            {project.style} Style Project
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Created {new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGeneratePlan} loading={loadingPlan} size="sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {project.plan_description ? 'Regenerate Plan' : 'Generate Plan'}
          </Button>

          <Button onClick={handleEstimateCost} loading={loadingCost} size="sm" variant="secondary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Estimate Cost
          </Button>

          <Button onClick={handleGeneratePdf} loading={loadingPdf} size="sm" variant="secondary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Download PDF
          </Button>

          {project.pdf_url && (
            <a href={project.pdf_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost">
                Open Report ↗
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: project details */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Project Details
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-slate-500">Plot Size</dt>
                <dd className="text-sm font-semibold text-slate-800">{project.plot_size}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Floors</dt>
                <dd className="text-sm font-semibold text-slate-800">{project.floors}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Style</dt>
                <dd className="text-sm font-semibold text-slate-800 capitalize">{project.style}</dd>
              </div>
            </dl>
          </Card>

          {/* Cost card */}
          {(project.estimated_cost != null || costBreakdown) && (
            <Card className="bg-gradient-to-br from-blue-700 to-blue-900 border-transparent text-white">
              <h2 className="text-sm font-semibold text-blue-200 uppercase tracking-wide mb-3">
                Cost Estimate
              </h2>
              <p className="text-3xl font-bold mb-4">
                ${(project.estimated_cost ?? costBreakdown?.total ?? 0).toLocaleString()}
              </p>
              {costBreakdown && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Materials (60%)</span>
                    <span className="font-medium">${costBreakdown.materials.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Labor (30%)</span>
                    <span className="font-medium">${costBreakdown.labor.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Contingency (10%)</span>
                    <span className="font-medium">${costBreakdown.other.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right: AI Plan with tabs */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            {/* Card header */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  AI-Generated Construction Plan
                </h2>
              </div>

              {/* Tabs — only show when plan exists */}
              {project.plan_description && (
                <div className="flex rounded-lg bg-slate-100 p-1 flex-shrink-0">
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      activeTab === 'text'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </button>
                  <button
                    onClick={() => setActiveTab('layout')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      activeTab === 'layout'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Floor Plan
                  </button>
                </div>
              )}
            </div>

            {/* Tab content */}
            {project.plan_description ? (
              activeTab === 'text' ? (
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <MarkdownText text={project.plan_description} />
                </div>
              ) : floorRooms.length > 0 ? (
                <FloorPlanSVG rooms={floorRooms} plotSize={project.plot_size} />
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                    <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-600">No floor layout yet</p>
                  <p className="text-xs text-slate-400 mt-1">Click &ldquo;Regenerate Plan&rdquo; to generate the visual floor plan</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-600">No plan generated yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Click &ldquo;Generate Plan&rdquo; to get an AI-powered construction plan + floor layout
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
