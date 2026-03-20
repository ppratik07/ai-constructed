'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Create a Project',
    description:
      'Enter plot size, desired number of floors, and preferred architectural style into our intuitive interface.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 4v16m8-8H4" />
      </svg>
    ),
    color: 'text-cyan-400',
    ring: 'ring-cyan-500/30',
    bg: 'bg-cyan-500/10',
    connector: 'from-cyan-500/40 to-blue-500/40',
  },
  {
    number: '02',
    title: 'Generate with AI',
    description:
      'Our engine builds the optimized floor plan and detailed cost estimate based on thousands of real-world benchmarks.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    color: 'text-blue-400',
    ring: 'ring-blue-500/30',
    bg: 'bg-blue-500/10',
    connector: 'from-blue-500/40 to-indigo-500/40',
  },
  {
    number: '03',
    title: 'Download Report',
    description:
      'Get a shareable, high-fidelity PDF instantly. Perfect for presentations or project validation.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    color: 'text-indigo-400',
    ring: 'ring-indigo-500/30',
    bg: 'bg-indigo-500/10',
    connector: null,
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" ref={ref} className="py-24 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Three Steps to Reality
          </h2>
          <p className="text-slate-400 text-base max-w-md">
            From conceptual ideas to structured blueprints in minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden sm:block absolute top-8 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-indigo-500/30" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.14, ease: 'easeOut' }}
              className="relative"
            >
              {/* Number + icon */}
              <div className="flex items-center gap-4 mb-5">
                <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl ${step.bg} ring-1 ${step.ring} ${step.color} shadow-lg flex-shrink-0`}>
                  {step.icon}
                  {/* Step number badge */}
                  <span className={`absolute -top-2 -right-2 text-[10px] font-extrabold ${step.color} bg-[#0a0f1e] border border-white/10 rounded-full w-5 h-5 flex items-center justify-center leading-none`}>
                    {i + 1}
                  </span>
                </div>
                <span className="text-5xl font-black text-white/5 select-none">{step.number}</span>
              </div>

              <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
