"use client";

import { usePathname } from 'next/navigation';
import { MotionConfig, motion, useReducedMotion } from 'framer-motion';

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <motion.div key={pathname} initial={reduced ? false : { opacity: 0, y: 10, scale: .994 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 370, damping: 31, mass: .7 }} className="w-full min-h-screen">
        {children}
      </motion.div>
    </MotionConfig>
  );
}
