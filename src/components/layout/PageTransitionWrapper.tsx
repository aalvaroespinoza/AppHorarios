"use client";

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-[100vw] overflow-x-hidden pb-[calc(5rem+env(safe-area-inset-bottom))]"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
