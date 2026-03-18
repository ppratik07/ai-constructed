'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const STYLE_OPTIONS = [
  'Modern',
  'Contemporary',
  'Traditional',
  'Colonial',
  'Mediterranean',
  'Craftsman',
  'Industrial',
  'Minimalist',
  'Victorian',
  'Ranch',
];

export default function CreateProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    plot_size: '',
    floors: '',
    style: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.plot_size.trim()) e.plot_size = 'Plot size is required';
    const f = Number(form.floors);
    if (!form.floors || isNaN(f) || f < 1 || f > 50)
      e.floors = 'Enter a valid number of floors (1–50)';
    if (!form.style) e.style = 'Please select a style';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plot_size: form.plot_size.trim(),
          floors: Number(form.floors),
          style: form.style,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Project created!');
      router.push(`/projects/${data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create project';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-1 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900">New Project</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter your construction details to get started.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Plot Size"
            placeholder="e.g. 40x60 ft  or  2400 sqft"
            value={form.plot_size}
            onChange={(e) => setForm((f) => ({ ...f, plot_size: e.target.value }))}
            error={errors.plot_size}
            hint="Formats accepted: 40x60, 2400 sqft"
          />

          <Input
            label="Number of Floors"
            type="number"
            min="1"
            max="50"
            placeholder="e.g. 2"
            value={form.floors}
            onChange={(e) => setForm((f) => ({ ...f, floors: e.target.value }))}
            error={errors.floors}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Architectural Style
            </label>
            <select
              value={form.style}
              onChange={(e) => setForm((f) => ({ ...f, style: e.target.value }))}
              className={[
                'w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                errors.style ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400',
              ].join(' ')}
            >
              <option value="">Select a style…</option>
              {STYLE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.style && <p className="text-xs text-red-600">{errors.style}</p>}
          </div>

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
