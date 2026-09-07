"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { SPRING_CONFIG } from '@/lib/animations';

interface NativeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function NativeCard({ children, className = '', ...props }: NativeCardProps) {
  return (
    <motion.div 
      layout
      transition={SPRING_CONFIG}
      className={`glass-panel p-5 overflow-hidden ${className}`}
      {...props as any}
    >
      {children}
    </motion.div>
  );
}
