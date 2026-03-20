'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  {
    value: '500+',
    label: 'Projects Generated',
    color: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
  },
  {
    value: '98%',
    label: 'Accuracy on Cost Estimates',
    color: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  {
    value: 'GPT-4o',
    label: 'Propelling Intelligence',
    color: 'text-indigo-400',
    glow: 'shadow-indigo-500/20',
    sup: true,
  },
];

export default function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-14 border-y border-white/8 bg-[#0a0f1e]/60 backdrop-blur-sm">
      {/* Subtle top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15, ease: 'easeOut' }}
              className="flex flex-col items-center text-center py-4 sm:py-0 sm:px-8"
            >
              <span className={`text-4xl sm:text-5xl font-extrabold ${s.color} tracking-tight`}>
                {s.value}
                {s.sup && (
                  <span className="text-xs font-semibold align-super ml-0.5 text-cyan-300">✦</span>
                )}
              </span>
              <p className="mt-1.5 text-sm text-slate-400 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </section>
  );
}
