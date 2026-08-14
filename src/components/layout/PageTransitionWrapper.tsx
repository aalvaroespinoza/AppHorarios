"use client";

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.main
      key={pathname}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="w-full max-w-[100vw] overflow-x-hidden pb-[calc(5rem+env(safe-area-inset-bottom))]"
    >
      {children}
    </motion.main>
  );
}
