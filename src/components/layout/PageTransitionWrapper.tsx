"use client";

import { usePathname } from 'next/navigation';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <motion.div key={pathname} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: .16 }} className="w-full min-h-screen">
        {children}
      </motion.div>
    </MotionConfig>
  );
}
