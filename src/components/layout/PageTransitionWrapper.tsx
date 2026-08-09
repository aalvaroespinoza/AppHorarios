"use client";

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { PAGE_TRANSITION } from '@/lib/animations';

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If a specific page already has PAGE_TRANSITION on its root element, 
  // wrapping it here will cause a double-animation. However, since we are moving
  // to a layout-based transition, it's safer to have it centrally. We'll use a 
  // shorter explicit transition to avoid conflicts if the page has its own.
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        {...PAGE_TRANSITION}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
