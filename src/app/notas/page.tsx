"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

function NotasContent() {
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [activeNote, setActiveNote] = useState<NoteDocument | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    let loadedNotes = INITIAL_NOTES;
    const stored = localStorage.getItem('lifeos_vault_notes');
    if (stored) {
      try {
        loadedNotes = JSON.parse(stored);
      } catch (e) {
        loadedNotes = INITIAL_NOTES;
      }
    }
    setNotes(loadedNotes);

    // Leer parámetro ?subject= para inicializar notas automáticamente
    const subjectParam = searchParams.get('subject');
    if (subjectParam) {
      const fechaHoyStr = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date());
      const expectedTitle = `Notas de ${subjectParam} - ${fechaHoyStr}`;
      
      const existing = loadedNotes.find(n => n.title === expectedTitle || n.title.toLowerCase().includes(subjectParam.toLowerCase()));
      if (existing) {
        setActiveNote(existing);
      } else {
        const newSubjectNote: NoteDocument = {
          id: 'note-' + Date.now(),
          title: expectedTitle,
          updatedAt: new Date().toISOString(),
          blocks: [
            { id: 'b-1', type: 'h1', content: `Apuntes de ${subjectParam}` },
            { id: 'b-2', type: 'p', content: `Clase del día ${fechaHoyStr}.` },
            { id: 'b-3', type: 'todo', content: 'Revisar temas vistos en clase', checked: false }
          ],
        };
        const updated = [newSubjectNote, ...loadedNotes];
        setNotes(updated);
        localStorage.setItem('lifeos_vault_notes', JSON.stringify(updated));
        setActiveNote(newSubjectNote);
      }
    }
  }, [searchParams]);

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

  const filteredNotes = notes.filter(n => 
    (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.blocks.some(b => b.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isMounted) return null;

  // Si hay una nota activa, mostrar el Editor de Bloques
  if (activeNote) {
    return (
      <NoteEditor
        note={activeNote}
        onSave={handleUpdateNote}
        onBack={() => setActiveNote(null)}
      />
    );
  }

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="p-4 max-w-md mx-auto flex flex-col gap-4 min-h-[100dvh] bg-[#0a0a0c] text-white pb-28"
      style={{ paddingTop: 'max(1.2rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mt-1 px-1">
        <div className="flex items-center gap-3">
          <Link 
            href="/boveda"
            className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors shadow-sm active:scale-95"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Notas & Bóveda <FileText size={17} className="text-teal-400" />
            </h1>
            <p className="text-xs text-neutral-400 font-medium">Editor de bloques Notion-style</p>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHelp(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:scale-95"
            title="Ayuda"
          >
            <HelpCircle size={15} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:scale-95"
            title="Ajustes"
          >
            <Settings2 size={15} />
          </button>
          <Button
            onClick={handleCreateNewNote}
            size="sm"
            className="rounded-full bg-teal-500 hover:bg-teal-400 text-black font-bold flex items-center gap-1 px-3 shadow-md shadow-teal-500/20 active:scale-95"
          >
            <Plus size={15} />
            <span>Nota</span>
          </Button>
        </div>
      </header>

      {/* Buscador */}
      <div className="relative mt-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          placeholder="Buscar en tus notas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-900/60 border border-neutral-800/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-700 transition-colors backdrop-blur-md"
        />
      </div>

      {/* Lista de Notas */}
      <div className="flex flex-col gap-3 mt-1">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500 gap-2">
            <FileText size={32} className="opacity-40" />
            <p className="text-sm font-medium">No se encontraron notas</p>
            <Button
              onClick={handleCreateNewNote}
              variant="outline"
              size="sm"
              className="mt-2 text-xs rounded-xl border-neutral-800 text-neutral-300"
            >
              <Plus size={14} className="mr-1" /> Crear primera nota
            </Button>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const firstParagraph = note.blocks.find(b => b.type === 'p')?.content || 'Nota sin descripción adicional...';
            const todoCount = note.blocks.filter(b => b.type === 'todo').length;
            const completedTodos = note.blocks.filter(b => b.type === 'todo' && b.checked).length;
            const dateStr = new Date(note.updatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

            return (
              <Card
                key={note.id}
                onClick={() => setActiveNote(note)}
                className="bg-neutral-900/60 border border-neutral-800/80 rounded-3xl p-4.5 cursor-pointer hover:border-neutral-700 transition-all backdrop-blur-md shadow-lg group active:scale-[0.99]"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors truncate">
                      {note.title || 'Nota sin título'}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {firstParagraph}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="text-neutral-500 hover:text-red-400 p-1.5 rounded-xl hover:bg-neutral-800 transition-colors shrink-0"
                    title="Eliminar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-800/60 text-[11px] text-neutral-500">
                  <span className="font-mono">{dateStr}</span>
                  <div className="flex items-center gap-2">
                    {todoCount > 0 && (
                      <span className="bg-neutral-800 px-2 py-0.5 rounded-md text-[10px] text-teal-400 font-medium">
                        {completedTodos}/{todoCount} tareas
                      </span>
                    )}
                    <span className="text-neutral-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Editar <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Ajustes */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowSettings(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="relative w-full max-w-sm bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 rounded-3xl p-5 flex flex-col gap-4 text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-neutral-800/80 pb-2.5">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings2 size={16} className="text-teal-400" /> Ajustes de Bóveda
                </h2>
                <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-full text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 transition-all flex items-center justify-center active:scale-95">
                  <X size={15} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleExportNotes}
                  variant="outline"
                  className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-2 border-neutral-800 hover:bg-neutral-800 text-neutral-200"
                >
                  <Download size={14} />
                  <span>Exportar Notas (Backup JSON)</span>
                </Button>

                <Button
                  onClick={handleResetNotes}
                  variant="destructive"
                  className="w-full text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Restablecer Notas de Ejemplo</span>
                </Button>
              </div>
            </motion.div>
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
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowHelp(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="relative w-full max-w-sm bg-neutral-900/60 backdrop-blur-2xl border border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10 rounded-3xl p-5 flex flex-col gap-3 text-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-neutral-800/80 pb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle size={16} className="text-teal-400" /> ¿Cómo usar Notas Notion?
                </h2>
                <button onClick={() => setShowHelp(false)} className="w-8 h-8 rounded-full text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 transition-all flex items-center justify-center active:scale-95">
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
                className="w-full mt-2 text-xs font-bold rounded-xl bg-white text-black hover:bg-neutral-200"
              >
                Entendido
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function NotasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c]" />}>
      <NotasContent />
    </Suspense>
  );
}
