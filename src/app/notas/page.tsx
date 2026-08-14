"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, FileText, Trash2, Sparkles, BookOpen, Search, ArrowRight } from 'lucide-react';
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

  if (!isMounted) return null;

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
      className="p-4 max-w-md mx-auto flex flex-col gap-5 min-h-[100dvh] relative bg-[#0a0a0c] text-white pb-28"
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
              Bóveda de Notas <BookOpen size={18} className="text-cyan-400" />
            </h1>
            <p className="text-xs text-neutral-500 font-medium">Editor de bloques tipo Notion</p>
          </div>
        </div>

        <Badge variant="outline" className="text-xs font-mono text-neutral-400 border-neutral-800">
          {notes.length} páginas
        </Badge>
      </header>

      {/* Buscador */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3 text-neutral-500" />
        <input
          type="text"
          placeholder="Buscar notas o contenidos..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-900/60 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-cyan-500 transition-colors"
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
                    <CardTitle className="text-base font-bold text-white leading-snug truncate group-hover:text-cyan-300 transition-colors">
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
                    <ArrowRight size={16} className="text-neutral-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all mt-3" />
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
        className="fixed bottom-24 right-6 w-14 h-14 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center z-40 transition-transform active:scale-95"
        title="Crear nueva nota"
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>
    </motion.div>
  );
}
