'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
      </svg>
    ),
    title: 'AI Floor Plans',
    description:
      'Describe your plot and style, get a visual floor plan instantly. Adaptable to any architectural constraints.',
    accent: 'from-cyan-500/20 to-blue-500/10',
    iconBg: 'bg-cyan-500/15 text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/15',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Cost Estimation',
    description:
      'Accurate material, labor, and overhead breakdowns calibrated to local market trends and material costs.',
    accent: 'from-blue-500/20 to-indigo-500/10',
    iconBg: 'bg-blue-500/15 text-blue-400',
    glow: 'group-hover:shadow-blue-500/15',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'PDF Reports',
    description:
      'Download a professional project report in one click. Ready for banking, contractors, or permits.',
    accent: 'from-indigo-500/20 to-violet-500/10',
    iconBg: 'bg-indigo-500/15 text-indigo-400',
    glow: 'group-hover:shadow-indigo-500/15',
  },
];

export default function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" ref={ref} className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Platform Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Precision-Engineered Features
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            The AI-Constructed platform provides end-to-end intelligence for modern construction planning.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`group relative bg-gradient-to-br ${f.accent} bg-[#111827]/70 border border-white/8 rounded-2xl p-6 cursor-default shadow-lg transition-shadow duration-300 ${f.glow} hover:shadow-xl hover:border-white/15 backdrop-blur-sm`}
            >
              {/* Top-right subtle glow dot */}
              <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-cyan-400/40 transition-colors duration-300" />

              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${f.iconBg} mb-5 ring-1 ring-white/10`}>
                {f.icon}
              </div>

              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
