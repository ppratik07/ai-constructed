'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Link from 'next/link';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
  }),
};

/* Mock form card — purely visual */
function MockFormCard() {
  const fields = [
    { label: 'Project Name', value: 'Modern Villa – Phase 1' },
    { label: 'Plot Size', value: '2400 sq ft' },
    { label: 'Number of Floors', value: '2' },
    { label: 'Architecture Style', value: 'Contemporary' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
      className="relative"
    >
      {/* Main card */}
      <div className="relative bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/40 w-full max-w-sm mx-auto">
        {/* Title bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            <span className="text-xs text-slate-400 font-medium">New Project</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
        </div>

        {/* AI-Constructed header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-white">AI-Constructed</span>
        </div>

        {/* Form fields */}
        <div className="space-y-3">
          {fields.map((field) => (
            <div key={field.label}>
              <p className="text-[10px] text-slate-500 mb-1">{field.label}</p>
              <div className="bg-[#1e2d45]/60 border border-white/8 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-200">{field.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Generate button */}
        <div className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg py-2.5 text-center">
          <span className="text-xs font-semibold text-white">Generate AI Plan</span>
        </div>
      </div>

      {/* Floating cost badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-5 -left-4 sm:-left-8 bg-[#0d1f35]/90 backdrop-blur-md border border-cyan-500/30 rounded-xl px-4 py-3 shadow-xl shadow-cyan-500/10"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" />
          <div>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider">Real-time Estimate</p>
            <p className="text-lg font-bold text-white tracking-tight">$248,500.00</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left – text */}
          <div className="space-y-6">
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-medium text-cyan-300 tracking-widest uppercase">
                Architecting the Future
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
            >
              Plan Your Dream{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Construction with AI
              </span>
            </motion.h1>

            {/* Sub-text */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed"
            >
              Generate floor plans, cost estimates, and full project reports in
              minutes — powered by AI.
            </motion.p>

            {/* Buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link href="/dashboard">
                <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 transition-all duration-200 text-sm">
                  Start for Free
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>
              <a href="#showcase">
                <button className="inline-flex items-center gap-2 text-slate-300 hover:text-white border border-white/15 hover:border-white/30 px-6 py-3 rounded-xl transition-all duration-200 text-sm backdrop-blur-sm">
                  <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  See Demo
                </button>
              </a>
            </motion.div>

            {/* Trust pill */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="flex items-center gap-3 pt-2"
            >
              <div className="flex -space-x-2">
                {['bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500'].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-[#0a0f1e] flex items-center justify-center`}>
                    <span className="text-[9px] font-bold text-white">{String.fromCharCode(65 + i)}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                <span className="text-white font-medium">500+</span> projects generated this month
              </p>
            </motion.div>
          </div>

          {/* Right – mock UI */}
          <div className="flex justify-center lg:justify-end pb-8 lg:pb-0">
            <MockFormCard />
          </div>
        </div>
      </div>

      {/* Bottom fade edge */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#060d1a] to-transparent pointer-events-none" />
    </section>
  );
}
