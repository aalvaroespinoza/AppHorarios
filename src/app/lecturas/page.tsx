"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, Circle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NativeCard from '@/core/components/ui/NativeCard';
import { createClient } from '@/lib/supabase/client';
import { PAGE_TRANSITION } from '@/lib/animations';

interface Recurso {
  id: string;
  titulo: string;
  url: string;
  categoria: string;
  descripcion_original: string;
  resumen_es: string;
  estado: string;
  notas_usuario: string;
}

export default function LecturasPage() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchRecursos();
  }, []);

  const fetchRecursos = async () => {
    try {
      const { data, error } = await supabase
        .from('recursos_lectura')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recursos:', error);
        return;
      }
      setRecursos(data as Recurso[]);
    } catch (err) {
      console.error('Excepción al cargar recursos:', err);
    } finally {
      setLoading(false);
    }
  };

  const grouped = recursos.reduce((acc, curr) => {
    const cat = curr.categoria || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {} as Record<string, Recurso[]>);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300';
      case 'En progreso': return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30';
      case 'Leído': return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      default: return 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300';
    }
  };

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative bg-gray-50 dark:bg-[#0a0a0c] text-gray-900 dark:text-white pb-24"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      <header className="flex items-center gap-3 mt-2">
        <Link 
          href="/boveda"
          className="w-10 h-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Lecturas
          </h1>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col mt-2 gap-6">
          {Object.entries(grouped).map(([categoria, items]) => (
            <div key={categoria} className="flex flex-col gap-3">
              <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase px-1 flex items-center gap-2">
                <Circle size={10} className="fill-cyan-500 text-cyan-500" /> {categoria}
              </h3>
              {items.map(recurso => (
                <NativeCard 
                  key={recurso.id}
                  onClick={() => router.push(`/lecturas/${recurso.id}`)}
                  className="bg-white/60 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 p-4 transition-colors hover:border-gray-300 dark:hover:border-zinc-700 cursor-pointer flex flex-col gap-3"
                >
                  <h4 className="text-base font-semibold text-gray-900 dark:text-zinc-100 leading-tight">
                    {recurso.titulo}
                  </h4>
                  <div className="flex">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${getStatusColor(recurso.estado)}`}>
                      {recurso.estado || 'Pendiente'}
                    </span>
                  </div>
                </NativeCard>
              ))}
            </div>
          ))}
          {recursos.length === 0 && (
            <NativeCard className="bg-gray-50 dark:bg-zinc-900/40 border border-gray-200 dark:border-zinc-800/60 border-dashed p-8 flex flex-col items-center justify-center text-center gap-3">
              <BookOpen size={36} className="text-gray-300 dark:text-zinc-600 mb-1" />
              <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium">
                No hay lecturas guardadas aún.
              </p>
            </NativeCard>
          )}
        </div>
      )}
    </motion.div>
  );
}
