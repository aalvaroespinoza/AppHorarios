"use client";

import { motion } from 'framer-motion';
import { ChevronLeft, Kanban as KanbanIcon, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { KanbanBoard } from '@/features/kanban/KanbanBoard';
import { PAGE_TRANSITION } from '@/lib/animations';

export default function KanbanPage() {
  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative bg-[#0a0a0c] text-white pb-24"
      style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <Link 
            href="/boveda"
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Tablero Kanban <KanbanIcon size={18} className="text-sky-400" />
            </h1>
            <p className="text-xs text-neutral-500 font-medium">Gestión de proyectos estilo Planka</p>
          </div>
        </div>
      </header>

      {/* Tablero Kanban */}
      <KanbanBoard />
    </motion.div>
  );
}
