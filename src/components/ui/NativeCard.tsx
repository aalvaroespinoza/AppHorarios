"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface NativeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function NativeCard({ children, className = '', ...props }: NativeCardProps) {
  return (
    <motion.div 
      layout
      whileTap={{ scale: 0.98 }}
      className={`bg-zinc-900 rounded-3xl border border-zinc-800 p-5 overflow-hidden shadow-sm ${className}`}
      {...props as any}
    >
      {children}
    </motion.div>
  );
}
