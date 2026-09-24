"use client";

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export function AnimatedDisclosure({ open, children }: { open: boolean; children: ReactNode }) {
  const reduced = useReducedMotion();
  return <AnimatePresence initial={false}>
    {open && <motion.div key="content" initial={{ height: 0, opacity: 0, y: -4 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0, y: -4 }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 30, mass: .7 }} className="overflow-hidden">
      {children}
    </motion.div>}
  </AnimatePresence>;
}
