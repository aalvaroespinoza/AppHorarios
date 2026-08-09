"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

export default function LecturaDetallePage() {
  const { id } = useParams();
  const [recurso, setRecurso] = useState<Recurso | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notas, setNotas] = useState('');
  
  const [iframeFailed, setIframeFailed] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  
  const supabase = createClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iframeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) fetchRecurso(id as string);
  }, [id]);

  useEffect(() => {
    if (recurso?.url) {
      setIframeLoading(true);
      setIframeFailed(false);
      
      if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
      
      iframeTimeoutRef.current = setTimeout(() => {
        setIframeFailed(true);
        setIframeLoading(false);
      }, 3000);
    }
    
    return () => {
      if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
    };
  }, [recurso?.url]);

  const fetchRecurso = async (recursoId: string) => {
    try {
      const { data, error } = await supabase
        .from('recursos_lectura')
        .select('*')
        .eq('id', recursoId)
        .single();

      if (error) throw error;
      setRecurso(data as Recurso);
      setNotas(data.notas_usuario || '');
    } catch (err) {
      console.error('Error fetching recurso:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!recurso) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/lecturas/resumen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recurso.id })
      });
      const data = await res.json();
      if (data.success && data.resumen) {
        setRecurso(prev => prev ? { ...prev, resumen_es: data.resumen } : null);
      } else {
        alert(data.error || 'Error al generar explicación');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al generar explicación');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!recurso) return;
    
    setRecurso({ ...recurso, estado: newStatus });
    try {
      const { error } = await supabase
        .from('recursos_lectura')
        .update({ estado: newStatus })
        .eq('id', recurso.id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleNotasChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotas(val);
    if (!recurso) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSavingNotes(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('recursos_lectura')
          .update({ notas_usuario: val })
          .eq('id', recurso.id);
        if (error) throw error;
      } catch (err) {
        console.error('Error saving notas:', err);
      } finally {
        setSavingNotes(false);
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0c]">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!recurso) {
    return (
      <div className="p-4 bg-[#0a0a0c] h-screen text-white">
        <Link href="/lecturas" className="text-cyan-400">Volver</Link>
        <p className="mt-4">Recurso no encontrado.</p>
      </div>
    );
  }

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] relative bg-[#0a0a0c] text-white pb-24"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      <header className="flex items-center gap-3 mt-2">
        <Link 
          href="/lecturas"
          className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-white truncate">
            {recurso.titulo}
          </h1>
          <p className="text-xs text-zinc-500 truncate">{recurso.categoria}</p>
        </div>
      </header>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => alert("Para traducir esta página, usa la traducción nativa de tu navegador.\n\nEn iOS Safari: toca el ícono 'aA' en la barra de direcciones y selecciona 'Traducir página'.\nEn Chrome: usa el ícono de traducción en la barra de direcciones o el menú de opciones.")}
          className="self-end text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 bg-cyan-900/20 px-3 py-1.5 rounded-full border border-cyan-800/30 transition-colors active:scale-95"
        >
          <Sparkles size={12} />
          ¿Cómo traducir este recurso?
        </button>

        {!iframeFailed ? (
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/40">
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-zinc-500">Cargando lector...</span>
              </div>
            )}
            <iframe
              src={recurso.url}
              className={`w-full h-full border-0 transition-opacity duration-300 ${iframeLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => {
                setIframeLoading(false);
                if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
              }}
              onError={() => {
                setIframeFailed(true);
                setIframeLoading(false);
                if (iframeTimeoutRef.current) clearTimeout(iframeTimeoutRef.current);
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl gap-4 text-center">
            <p className="text-sm text-zinc-400">
              Este sitio no permite verse dentro de la app por seguridad.
            </p>
            <a 
              href={recurso.url} 
              target="_blank" 
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold shadow-lg transition-colors active:scale-95 text-sm"
            >
              <ExternalLink size={18} />
              Abrir en pestaña nueva
            </a>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase px-1">
          Estado
        </label>
        <div className="relative">
          <select 
            value={recurso.estado || 'Pendiente'} 
            onChange={handleStatusChange}
            className="w-full appearance-none bg-zinc-900/60 border border-zinc-800 text-white rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-colors"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En progreso">En progreso</option>
            <option value="Leído">Leído</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase px-1">
          Resumen / Explicación IA
        </label>
        <NativeCard className="bg-zinc-900/40 border border-zinc-800 p-4 min-h-[100px] flex flex-col justify-center">
          {recurso.resumen_es ? (
            <div className="text-sm text-zinc-300 space-y-3 leading-relaxed whitespace-pre-wrap">
              {recurso.resumen_es}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2">
              <p className="text-sm text-zinc-500 text-center">
                Aún no hay una explicación en español para este recurso.
              </p>
              <button 
                onClick={handleGenerateSummary}
                disabled={generating}
                className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95 disabled:opacity-50"
              >
                {generating ? <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /> : <Sparkles size={16} />}
                Generar explicación en español
              </button>
            </div>
          )}
        </NativeCard>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <div className="flex justify-between items-center px-1">
          <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
            Mis Notas
          </label>
          <span className={`text-[10px] font-medium ${savingNotes ? 'text-amber-500' : 'text-zinc-600'}`}>
            {savingNotes ? 'Guardando...' : 'Guardado'}
          </span>
        </div>
        <textarea 
          value={notas}
          onChange={handleNotasChange}
          placeholder="Escribe tus apuntes o ideas sobre este recurso..."
          className="flex-1 min-h-[150px] w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
        />
      </div>

    </motion.div>
  );
}
