'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* Mock project detail card */
function ProjectDetailMock() {
  const rooms = [
    { name: 'Master Bedroom', size: '4.2 × 3.8 m', color: 'bg-blue-500/20 border-blue-500/30' },
    { name: 'Living Room', size: '5.5 × 4.0 m', color: 'bg-cyan-500/20 border-cyan-500/30' },
    { name: 'Kitchen', size: '3.5 × 3.0 m', color: 'bg-indigo-500/20 border-indigo-500/30' },
    { name: 'Bathroom', size: '2.2 × 2.0 m', color: 'bg-violet-500/20 border-violet-500/30' },
  ];

  return (
    <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0d1520]/60">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs text-slate-400 ml-2">Project Detail: Modern Villa</span>
        </div>
      </div>

      {/* Floor plan grid mock */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {rooms.map((r) => (
            <div key={r.name} className={`${r.color} border rounded-lg p-3`}>
              <p className="text-[10px] font-semibold text-white/80">{r.name}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{r.size}</p>
            </div>
          ))}
        </div>

        {/* Cost mini chart */}
        <div className="bg-[#0d1520]/70 border border-white/8 rounded-xl p-3">
          <p className="text-[10px] text-slate-400 mb-2">Cost Breakdown</p>
          <div className="space-y-1.5">
            {[
              { label: 'Materials', pct: '68%', w: 'w-[68%]', color: 'bg-cyan-500' },
              { label: 'Labor', pct: '22%', w: 'w-[22%]', color: 'bg-blue-500' },
              { label: 'Other', pct: '10%', w: 'w-[10%]', color: 'bg-indigo-500' },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <p className="text-[9px] text-slate-500 w-12 shrink-0">{b.label}</p>
                <div className="flex-1 bg-white/5 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${b.color} ${b.w}`} />
                </div>
                <p className="text-[9px] text-slate-400 w-6 text-right">{b.pct}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Mock PDF card */
function PDFMock() {
  return (
    <div className="bg-[#f5f0eb] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/10">
      {/* PDF toolbar */}
      <div className="bg-[#3d3d3d] flex items-center gap-2 px-4 py-2">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="text-[10px] text-white/60 ml-2">report_v1.pdf</span>
      </div>

      {/* PDF page content */}
      <div className="p-6 bg-white/90 min-h-52">
        {/* Logo row */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-700">AI-Constructed Report</span>
        </div>

        {/* Mock content lines */}
        <div className="space-y-1.5 mb-4">
          {[80, 60, 90, 50, 70].map((w, i) => (
            <div key={i} className={`h-1.5 bg-slate-200 rounded`} style={{ width: `${w}%` }} />
          ))}
        </div>

        {/* Floor plan placeholder */}
        <div className="bg-slate-100 rounded-lg h-20 flex items-center justify-center border border-slate-200 mb-3">
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-6 h-5 border border-slate-300 bg-slate-200/60 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Cost row */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
          <span className="text-[9px] text-slate-500">Total Estimated Cost</span>
          <span className="text-[10px] font-bold text-slate-800">$248,500.00</span>
        </div>
      </div>

      {/* PDF icon overlay */}
      <div className="relative bg-slate-100 flex items-center justify-center py-4">
        <div className="flex flex-col items-center gap-1">
          <svg className="w-8 h-8 text-red-500/70" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
            <path fill="white" d="M14 2v6h6"/>
          </svg>
          <span className="text-[8px] font-bold text-slate-500 tracking-widest">PDF EXPORT</span>
        </div>
      </div>
    </div>
  );
}

export default function Showcase() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="showcase" ref={ref} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-600/6 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-14"
        >
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Output Preview</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            See What You Get
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left – project detail mock */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ProjectDetailMock />
          </motion.div>

          {/* Right – PDF mock + caption */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            <PDFMock />
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Export in High Fidelity</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Our PDF engine produces industry-standard documentation used by architects and
                project managers worldwide.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
