"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TAP_ANIMATION, SPRING_CONFIG } from '@/lib/animations';

interface NativeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function NativeCard({ children, className = '', ...props }: NativeCardProps) {
  return (
    <motion.div 
      layout
      transition={SPRING_CONFIG}
      whileTap={TAP_ANIMATION}
      className={`bg-zinc-900 rounded-3xl border border-zinc-800 p-5 overflow-hidden shadow-sm ${className}`}
      {...props as any}
    >
      {children}
    </motion.div>
  );
}
