"use client";

import { motion } from 'framer-motion';
import { ChevronLeft, CheckSquare, ListTodo, Plus } from 'lucide-react';
import Link from 'next/link';
import NativeCard from '@/core/components/ui/NativeCard';

export default function TareasPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative bg-[#0a0a0c] text-white pb-24"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 mt-2">
        <Link 
          href="/boveda"
          className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Tareas
          </h1>
        </div>
        <button className="w-10 h-10 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center justify-center hover:bg-indigo-500/20 transition-colors active:scale-95 shadow-sm">
          <Plus size={20} />
        </button>
      </header>

      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <ListTodo size={16} /> Pendientes
        </h2>
        
        <NativeCard className="bg-zinc-900/60 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors cursor-pointer group flex items-start gap-4">
          <div className="w-6 h-6 rounded-md border-2 border-zinc-600 group-hover:border-indigo-400 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
            {/* Tarea sin check */}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-zinc-100">Renovar suscripción de Vercel</h3>
            <p className="text-sm text-zinc-500 font-medium">Vence mañana</p>
          </div>
        </NativeCard>
        
        <NativeCard className="bg-zinc-900/60 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors cursor-pointer group flex items-start gap-4">
          <div className="w-6 h-6 rounded-md border-2 border-zinc-600 group-hover:border-indigo-400 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-zinc-100">Comprar café</h3>
            <p className="text-sm text-zinc-500 font-medium">Supermercado</p>
          </div>
        </NativeCard>

      </div>

      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-sm font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
          <CheckSquare size={16} /> Completadas
        </h2>
        
        <NativeCard className="bg-zinc-900/20 border border-zinc-800/50 p-4 flex items-start gap-4 opacity-60">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
            <CheckSquare size={14} className="text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-zinc-400 line-through">Revisar PR de Next.js</h3>
            <p className="text-sm text-zinc-600 font-medium line-through">Hace 2 días</p>
          </div>
        </NativeCard>

      </div>

    </motion.div>
  );
}
