"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, BookOpen, Plus, Trash2, ExternalLink, 
  CheckCircle2, Clock, Bookmark, X, Settings2, RotateCcw, Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAGE_TRANSITION, SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';

export interface LecturaItem {
  id: string;
  titulo: string;
  autor?: string;
  url?: string;
  categoria: 'Libros' | 'Universidad' | 'Tecnología' | 'Productividad' | 'General';
  estado: 'Por Leer' | 'Leyendo' | 'Terminado';
  notas?: string;
}

const DEFAULT_LECTURAS: LecturaItem[] = [
  {
    id: 'lec-1',
    titulo: 'Deep Work: Reglas para el éxito enfocado',
    autor: 'Cal Newport',
    url: 'https://es.wikipedia.org/wiki/Deep_work',
    categoria: 'Productividad',
    estado: 'Leyendo',
    notas: 'Enfocarse en bloques sin distracciones de 90 a 120 minutos.'
  },
  {
    id: 'lec-2',
    titulo: 'Hábitos Atómicos',
    autor: 'James Clear',
    categoria: 'Productividad',
    estado: 'Terminado',
    notas: 'Mejoras del 1% diario generan resultados exponenciales.'
  },
  {
    id: 'lec-3',
    titulo: 'Clean Code: Manual de desarrollo ágil',
    autor: 'Robert C. Martin',
    categoria: 'Tecnología',
    estado: 'Por Leer',
    notas: 'Buenas prácticas, refactorización y legibilidad de código.'
  }
];

export default function LecturasPage() {
  const [lecturas, setLecturas] = useState<LecturaItem[]>([]);
  const [filterCat, setFilterCat] = useState<string>('Todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Formulario nueva lectura
  const [newTitulo, setNewTitulo] = useState('');
  const [newAutor, setNewAutor] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategoria, setNewCategoria] = useState<LecturaItem['categoria']>('Productividad');
  const [newEstado, setNewEstado] = useState<LecturaItem['estado']>('Por Leer');
  const [newNotas, setNewNotas] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('lifeos_lecturas_data');
    if (stored) {
      try {
        setLecturas(JSON.parse(stored));
      } catch (e) {
        setLecturas(DEFAULT_LECTURAS);
      }
    } else {
      setLecturas(DEFAULT_LECTURAS);
    }
  }, []);

  const saveLecturas = (updated: LecturaItem[]) => {
    setLecturas(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_lecturas_data', JSON.stringify(updated));
    }
  };

  const handleResetData = () => {
    if (!window.confirm('¿Reiniciar lista de lecturas con los libros por defecto?')) return;
    saveLecturas(DEFAULT_LECTURAS);
    setShowSettingsModal(false);
  };

  const handleAddLectura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitulo.trim()) return;

    const newItem: LecturaItem = {
      id: 'lec-' + Date.now(),
      titulo: newTitulo.trim(),
      autor: newAutor.trim() || undefined,
      url: newUrl.trim() || undefined,
      categoria: newCategoria,
      estado: newEstado,
      notas: newNotas.trim() || undefined
    };

    saveLecturas([newItem, ...lecturas]);
    setNewTitulo('');
    setNewAutor('');
    setNewUrl('');
    setNewNotas('');
    setShowAddModal(false);
  };

  const handleCycleEstado = (id: string) => {
    const order: LecturaItem['estado'][] = ['Por Leer', 'Leyendo', 'Terminado'];
    const updated = lecturas.map(item => {
      if (item.id === id) {
        const nextIdx = (order.indexOf(item.estado) + 1) % order.length;
        return { ...item, estado: order[nextIdx] };
      }
      return item;
    });
    saveLecturas(updated);
  };

  const handleDelete = (id: string) => {
    saveLecturas(lecturas.filter(l => l.id !== id));
  };

  const filteredLecturas = filterCat === 'Todas' 
    ? lecturas 
    : lecturas.filter(l => l.categoria === filterCat);

  const getEstadoBadge = (estado: LecturaItem['estado']) => {
    switch (estado) {
      case 'Leyendo':
        return <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 text-[10px]">Leyendo</Badge>;
      case 'Terminado':
        return <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">Terminado ✓</Badge>;
      default:
        return <Badge className="bg-neutral-800 text-neutral-400 border-neutral-700 text-[10px]">Por Leer</Badge>;
    }
  };

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-4 min-h-[100dvh] bg-[#0a0a0c] text-white pb-28"
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
              Lecturas & Libros <BookOpen size={17} className="text-cyan-400" />
            </h1>
            <p className="text-[11px] text-neutral-500 font-medium">Biblioteca personal y resúmenes</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Ajustes"
          >
            <Settings2 size={15} />
          </button>
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1 px-3 shadow-md shadow-cyan-500/20"
          >
            <Plus size={15} />
            <span>Añadir</span>
          </Button>
        </div>
      </header>

      {/* Selector de Categorías */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar py-1">
        {['Todas', 'Productividad', 'Tecnología', 'Universidad', 'Libros', 'General'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterCat === cat
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de Lecturas */}
      <div className="flex flex-col gap-3">
        {filteredLecturas.map(item => (
          <Card key={item.id} className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-4 flex flex-col gap-2.5 backdrop-blur-md shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                  {item.titulo}
                </h3>
                {item.autor && (
                  <span className="text-xs text-neutral-400 font-medium">
                    por {item.autor}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleCycleEstado(item.id)}
                className="shrink-0 transition-transform active:scale-95"
                title="Toca para cambiar estado"
              >
                {getEstadoBadge(item.estado)}
              </button>
            </div>

            {item.notas && (
              <p className="text-xs text-neutral-300 bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-2.5 leading-relaxed font-normal">
                {item.notas}
              </p>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-neutral-800/50 text-[11px] text-neutral-500">
              <span className="bg-neutral-800/60 px-2 py-0.5 rounded text-neutral-400 font-medium">
                {item.categoria}
              </span>

              <div className="flex items-center gap-3">
                {item.url && (
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 text-cyan-400 hover:underline font-semibold"
                  >
                    <span>Abrir enlace</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                  title="Eliminar lectura"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {filteredLecturas.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-neutral-900/30 border border-neutral-800/60 rounded-3xl gap-2 mt-4">
            <BookOpen size={32} className="text-neutral-600 mb-1" />
            <p className="text-sm font-semibold text-neutral-400">No hay lecturas en esta categoría</p>
            <p className="text-xs text-neutral-500">Toca en <em>+ Añadir</em> para registrar un nuevo recurso.</p>
          </div>
        )}
      </div>

      {/* Modal Añadir Lectura */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2.5">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-400" /> Añadir Nueva Lectura
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddLectura} className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-400 font-semibold">Título *</label>
                  <input 
                    type="text"
                    required
                    value={newTitulo}
                    onChange={(e) => setNewTitulo(e.target.value)}
                    placeholder="Ej: El Principito, Paper de Redes..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-400 font-semibold">Autor</label>
                    <input 
                      type="text"
                      value={newAutor}
                      onChange={(e) => setNewAutor(e.target.value)}
                      placeholder="Ej: James Clear"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-400 font-semibold">Categoría</label>
                    <select
                      value={newCategoria}
                      onChange={(e) => setNewCategoria(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Productividad">Productividad</option>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Universidad">Universidad</option>
                      <option value="Libros">Libros</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-400 font-semibold">Estado</label>
                    <select
                      value={newEstado}
                      onChange={(e) => setNewEstado(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Por Leer">Por Leer</option>
                      <option value="Leyendo">Leyendo</option>
                      <option value="Terminado">Terminado</option>
                    </select>
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] text-neutral-400 font-semibold">Enlace Web / PDF</label>
                    <input 
                      type="url"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-400 font-semibold">Notas y Resumen</label>
                  <textarea
                    rows={2}
                    value={newNotas}
                    onChange={(e) => setNewNotas(e.target.value)}
                    placeholder="Ideas clave del libro o artículo..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={!newTitulo.trim()}
                  className="w-full mt-2 font-bold bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl text-xs"
                >
                  Guardar Lectura
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ajustes */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings2 size={16} className="text-cyan-400" /> Ajustes de Lecturas
                </h2>
                <button onClick={() => setShowSettingsModal(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Podés reiniciar tu lista de lecturas con los libros recomendados para volver a empezar desde cero.
              </p>

              <Button
                onClick={handleResetData}
                variant="destructive"
                className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Reiniciar Lecturas por Defecto</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
