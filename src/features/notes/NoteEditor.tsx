"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, CheckCircle2, MoreVertical, Sparkles, CheckSquare, Square, Type, Heading1, Heading2, List, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TAP_ANIMATION } from '@/lib/animations';

export type BlockType = 'h1' | 'h2' | 'p' | 'list' | 'todo';

export interface NoteBlock {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

export interface NoteDocument {
  id: string;
  title: string;
  updatedAt: string;
  blocks: NoteBlock[];
}

interface NoteEditorProps {
  note: NoteDocument;
  onSave: (updatedNote: NoteDocument) => void;
  onBack: () => void;
}

export function NoteEditor({ note, onSave, onBack }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title || 'Sin título');
  const [blocks, setBlocks] = useState<NoteBlock[]>(
    note.blocks && note.blocks.length > 0
      ? note.blocks
      : [{ id: 'b-1', type: 'p', content: '' }]
  );
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-guardado debounced
  useEffect(() => {
    setSaveStatus('saving');
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      onSave({
        ...note,
        title: title.trim() || 'Sin título',
        updatedAt: new Date().toISOString(),
        blocks,
      });
      setSaveStatus('saved');
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, blocks]);

  const handleUpdateBlock = (id: string, newContent: string) => {
    setBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, content: newContent } : b))
    );
  };

  const handleToggleTodo = (id: string) => {
    setBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, checked: !b.checked } : b))
    );
  };

  const handleChangeBlockType = (id: string, newType: BlockType) => {
    setBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, type: newType } : b))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, index: number, block: NoteBlock) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlock: NoteBlock = {
        id: 'b-' + Date.now(),
        type: block.type === 'list' ? 'list' : block.type === 'todo' ? 'todo' : 'p',
        content: '',
      };
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);

      // Focus al nuevo bloque en el siguiente ciclo
      setTimeout(() => {
        const nextInput = document.getElementById(`block-${newBlock.id}`);
        if (nextInput) nextInput.focus();
      }, 50);
    } else if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault();
      const newBlocks = blocks.filter(b => b.id !== block.id);
      setBlocks(newBlocks);

      const prevIndex = Math.max(index - 1, 0);
      setTimeout(() => {
        const prevInput = document.getElementById(`block-${blocks[prevIndex].id}`);
        if (prevInput) prevInput.focus();
      }, 50);
    }
  };

  const addBlockAtEnd = (type: BlockType = 'p') => {
    const newBlock: NoteBlock = {
      id: 'b-' + Date.now(),
      type,
      content: '',
    };
    setBlocks(prev => [...prev, newBlock]);
    setTimeout(() => {
      const el = document.getElementById(`block-${newBlock.id}`);
      if (el) el.focus();
    }, 50);
  };

  return (
    <div className="w-full flex flex-col gap-5 min-h-[100dvh] pb-32">
      {/* Top Navbar */}
      <header className="flex items-center justify-between sticky top-0 bg-[#0a0a0c]/90 backdrop-blur-lg z-30 py-2 border-b border-neutral-800/80 -mx-4 px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white"
          >
            <ChevronLeft size={18} />
          </Button>
          <span className="text-xs text-neutral-500 font-mono">
            {saveStatus === 'saved' ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check size={12} /> Guardado
              </span>
            ) : (
              <span className="text-amber-400 animate-pulse">Guardando...</span>
            )}
          </span>
        </div>

        {/* Barra Rápida de Tipos de Bloque */}
        <div className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-800 p-1 rounded-full">
          <button
            onClick={() => addBlockAtEnd('h1')}
            className="px-2 py-1 text-[10px] font-bold text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800"
            title="Añadir Título"
          >
            H1
          </button>
          <button
            onClick={() => addBlockAtEnd('h2')}
            className="px-2 py-1 text-[10px] font-bold text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800"
            title="Añadir Subtítulo"
          >
            H2
          </button>
          <button
            onClick={() => addBlockAtEnd('p')}
            className="px-2 py-1 text-[10px] font-bold text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800"
            title="Añadir Párrafo"
          >
            P
          </button>
          <button
            onClick={() => addBlockAtEnd('list')}
            className="px-2 py-1 text-[10px] font-bold text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800"
            title="Añadir Lista"
          >
            •
          </button>
          <button
            onClick={() => addBlockAtEnd('todo')}
            className="px-2 py-1 text-[10px] font-bold text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800"
            title="Añadir Checkbox"
          >
            ☑
          </button>
        </div>
      </header>

      {/* Título de la Nota */}
      <div className="flex flex-col gap-1 mt-2">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título de la nota..."
          className="w-full bg-transparent text-3xl font-black text-white tracking-tight focus:outline-none placeholder:text-neutral-600 border-none p-0"
        />
        <span className="text-[11px] text-neutral-500 font-mono">
          Actualizado: {new Date(note.updatedAt || Date.now()).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Editor de Bloques Notion-Style */}
      <div className="flex flex-col gap-3 mt-4">
        {blocks.map((block, index) => {
          return (
            <div key={block.id} className="group relative flex items-start gap-2 w-full">
              {/* Indicador o Checkbox según el tipo */}
              {block.type === 'list' && (
                <span className="text-neutral-500 font-bold text-lg select-none pt-0.5">•</span>
              )}
              {block.type === 'todo' && (
                <button
                  onClick={() => handleToggleTodo(block.id)}
                  className={`pt-1.5 transition-colors ${
                    block.checked ? 'text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {block.checked ? <CheckSquare size={17} /> : <Square size={17} />}
                </button>
              )}

              {/* Textarea autoajustable */}
              <textarea
                id={`block-${block.id}`}
                rows={1}
                value={block.content}
                placeholder={
                  block.type === 'h1'
                    ? 'Encabezado 1...'
                    : block.type === 'h2'
                    ? 'Encabezado 2...'
                    : block.type === 'list'
                    ? 'Elemento de lista...'
                    : block.type === 'todo'
                    ? 'Tarea por hacer...'
                    : "Escribe algo o presiona Enter..."
                }
                onChange={e => {
                  handleUpdateBlock(block.id, e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={e => handleKeyDown(e, index, block)}
                className={`w-full bg-transparent resize-none focus:outline-none leading-relaxed transition-colors border-none p-0 ${
                  block.type === 'h1'
                    ? 'text-2xl font-extrabold text-white placeholder:text-neutral-700'
                    : block.type === 'h2'
                    ? 'text-xl font-bold text-neutral-100 placeholder:text-neutral-700'
                    : block.type === 'todo' && block.checked
                    ? 'text-sm text-neutral-500 line-through'
                    : 'text-sm text-neutral-200 placeholder:text-neutral-600'
                }`}
              />

              {/* Botón rápido para cambiar tipo de bloque en hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 pt-1">
                <button
                  onClick={() => {
                    const types: BlockType[] = ['p', 'h1', 'h2', 'list', 'todo'];
                    const nextType = types[(types.indexOf(block.type) + 1) % types.length];
                    handleChangeBlockType(block.id, nextType);
                  }}
                  className="text-[10px] font-mono uppercase bg-neutral-800/80 text-neutral-400 hover:text-white px-1.5 py-0.5 rounded"
                  title="Cambiar tipo de bloque"
                >
                  {block.type}
                </button>
                {blocks.length > 1 && (
                  <button
                    onClick={() => setBlocks(blocks.filter(b => b.id !== block.id))}
                    className="text-neutral-600 hover:text-red-400 p-0.5 transition-colors"
                    title="Eliminar bloque"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón inferior para agregar nuevo bloque */}
      <button
        onClick={() => addBlockAtEnd('p')}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 transition-all text-xs font-semibold mt-4"
      >
        <Plus size={14} />
        <span>Añadir nuevo bloque</span>
      </button>
    </div>
  );
}
