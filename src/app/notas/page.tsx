"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Plus, FileText, Trash2, Sparkles, 
  BookOpen, Search, ArrowRight, Settings2, HelpCircle, X, RotateCcw, Download 
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NoteEditor, NoteDocument } from '@/features/notes/NoteEditor';
import { PAGE_TRANSITION, TAP_ANIMATION } from '@/lib/animations';

const INITIAL_NOTES: NoteDocument[] = [
  {
    id: 'note-1',
    title: 'Apuntes de Álgebra Lineal',
    updatedAt: new Date().toISOString(),
    blocks: [
      { id: 'b1', type: 'h1', content: 'Espacios Vectoriales' },
      { id: 'b2', type: 'p', content: 'Propiedades de clausura bajo suma y producto por escalar.' },
      { id: 'b3', type: 'todo', content: 'Resolver ejercicios de la guía 3', checked: true },
      { id: 'b4', type: 'todo', content: 'Consultar dudas con el profe en clase práctica', checked: false },
    ],
  },
  {
    id: 'note-2',
    title: 'Ideas para el Proyecto Final',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    blocks: [
      { id: 'b5', type: 'h2', content: 'Arquitectura Local-First' },
      { id: 'b6', type: 'p', content: 'Usar IndexedDB y sincronización en segundo plano para cero latencia.' },
      { id: 'b7', type: 'list', content: 'Framer Motion para transiciones fluidas' },
      { id: 'b8', type: 'list', content: 'Tailwind CSS para interfaces limpias' },
    ],
  },
];

export default function NotasPage() {
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [activeNote, setActiveNote] = useState<NoteDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('lifeos_vault_notes');
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch (e) {
        setNotes(INITIAL_NOTES);
      }
    } else {
      setNotes(INITIAL_NOTES);
    }
  }, []);

  const saveNotesToStorage = (updatedNotes: NoteDocument[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('lifeos_vault_notes', JSON.stringify(updatedNotes));
  };

  const handleResetNotes = () => {
    if (!window.confirm('¿Reiniciar las notas de la bóveda a los valores iniciales?')) return;
    saveNotesToStorage(INITIAL_NOTES);
    setShowSettings(false);
  };

  const handleExportNotes = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `lifeos_notas_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCreateNewNote = () => {
    const newNote: NoteDocument = {
      id: 'note-' + Date.now(),
      title: '',
      updatedAt: new Date().toISOString(),
      blocks: [
        { id: 'b-1', type: 'p', content: '' }
      ],
    };
    const updated = [newNote, ...notes];
    saveNotesToStorage(updated);
    setActiveNote(newNote);
  };

  const handleUpdateNote = (updatedNote: NoteDocument) => {
    const updated = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
    saveNotesToStorage(updated);
    setActiveNote(updatedNote);
  };

  const handleDeleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar esta nota?')) return;
    const updated = notes.filter(n => n.id !== noteId);
    saveNotesToStorage(updated);
    if (activeNote?.id === noteId) setActiveNote(null);
  };

  // Si hay una nota activa, renderizar el NoteEditor
  if (activeNote) {
    return (
      <motion.div
        {...PAGE_TRANSITION}
        className="p-4 max-w-md mx-auto min-h-[100dvh] bg-[#0a0a0c] text-white"
        style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
      >
        <NoteEditor
          note={activeNote}
          onSave={handleUpdateNote}
          onBack={() => setActiveNote(null)}
        />
      </motion.div>
    );
  }

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.blocks.some(b => b.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-4 min-h-[100dvh] relative bg-[#0a0a0c] text-white pb-28"
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
              Bóveda de Notas <BookOpen size={18} className="text-teal-400" />
            </h1>
            <p className="text-xs text-neutral-500 font-medium">Editor de bloques tipo Notion</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHelp(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Ayuda"
          >
            <HelpCircle size={15} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            title="Ajustes y Exportar"
          >
            <Settings2 size={15} />
          </button>
        </div>
      </header>

      {/* Buscador */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3 text-neutral-500" />
        <input
          type="text"
          placeholder="Buscar notas o contenidos..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-teal-500 transition-colors"
        />
      </div>

      {/* Grilla Vertical de Tarjetas de Notas */}
      <div className="flex flex-col gap-3 mt-1">
        {filteredNotes.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500 italic bg-neutral-900/30 border border-neutral-800/60 rounded-3xl p-6">
            No hay notas creadas aún. ¡Toca el botón + para empezar!
          </div>
        ) : (
          filteredNotes.map(note => {
            const firstSnippet = note.blocks.find(b => b.content.trim().length > 0)?.content || 'Sin contenido adicional...';

            return (
              <Card
                key={note.id}
                onClick={() => setActiveNote(note)}
                className="bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all shadow-md group backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <CardTitle className="text-base font-bold text-white leading-snug truncate group-hover:text-teal-300 transition-colors">
                      {note.title || 'Nota sin título'}
                    </CardTitle>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {firstSnippet}
                    </p>
                    <span className="text-[10px] text-neutral-500 font-mono mt-2">
                      {new Date(note.updatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} • {note.blocks.length} bloques
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={e => handleDeleteNote(note.id, e)}
                      className="text-neutral-600 hover:text-red-400 p-1.5 rounded-lg transition-colors opacity-60 hover:opacity-100"
                      title="Eliminar nota"
                    >
                      <Trash2 size={15} />
                    </button>
                    <ArrowRight size={16} className="text-neutral-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all mt-3" />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) estilo iOS */}
      <motion.button
        whileTap={TAP_ANIMATION}
        onClick={handleCreateNewNote}
        className="fixed bottom-24 right-6 w-14 h-14 bg-teal-500 hover:bg-teal-400 text-black rounded-full shadow-[0_0_25px_rgba(20,184,166,0.4)] flex items-center justify-center z-40 transition-transform active:scale-95"
        title="Crear nueva nota"
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>

      {/* Modal Ajustes */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2.5">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings2 size={16} className="text-teal-400" /> Ajustes de Bóveda
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleExportNotes}
                  className="w-full text-xs font-bold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>Exportar Notas como JSON</span>
                </Button>

                <Button
                  onClick={handleResetNotes}
                  variant="destructive"
                  className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-2 mt-2"
                >
                  <RotateCcw size={14} />
                  <span>Reiniciar Notas por Defecto</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ayuda */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-3 text-white">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle size={16} className="text-teal-400" /> ¿Cómo usar Notas Notion?
                </h2>
                <button onClick={() => setShowHelp(false)} className="text-neutral-500 hover:text-white p-1 rounded-full bg-neutral-800">
                  <X size={15} />
                </button>
              </div>

              <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
                <li>• <strong>Bloques</strong>: Podés escribir títulos (H1, H2), párrafos y listas/checklists.</li>
                <li>• <strong>Guardado Automático</strong>: Todo lo que escribas se guarda en tiempo real en tu teléfono.</li>
                <li>• <strong>Búsqueda Rápida</strong>: Escribí en el buscador superior para encontrar notas al instante.</li>
              </ul>

              <Button
                onClick={() => setShowHelp(false)}
                className="w-full mt-2 text-xs font-bold rounded-xl bg-teal-500 text-black hover:bg-teal-400"
              >
                Entendido
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
