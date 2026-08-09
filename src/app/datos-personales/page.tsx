"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, KeyRound, Eye, EyeOff, Copy, Plus, X, Check, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { PAGE_TRANSITION, SPRING_CONFIG } from '@/lib/animations';

interface VaultItem {
  id: string;
  title: string;
  value: string;
  category: string;
}

const DEFAULT_ITEMS: VaultItem[] = [
  { id: '1', title: 'Alias Bancario', value: 'newdata', category: 'Finanzas' },
  { id: '2', title: 'CUIL', value: '20472531388', category: 'Personal' },
  { id: '3', title: 'Dirección Envío', value: 'San Luis 831, Despeñaderos', category: 'Personal' },
  { id: '4', title: 'WiFi Casa (Clave)', value: 'lorenzojulian', category: 'Redes' },
  { id: '5', title: 'Mail Personal', value: 'alvaroespinoza512@gmail.com', category: 'Personal' },
];

export default function DatosPersonalesPage() {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formValue, setFormValue] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('apphorarios_vault_v3');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        setItems(DEFAULT_ITEMS);
      }
    } else {
      setItems(DEFAULT_ITEMS);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('apphorarios_vault_v3', JSON.stringify(items));
    }
  }, [items, isMounted]);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (navigator.vibrate) navigator.vibrate(40);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (revealedIds.includes(id)) {
      setRevealedIds(prev => prev.filter(revId => revId !== id));
    } else {
      setRevealedIds(prev => [...prev, id]);
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setRevealedIds(prev => prev.filter(revId => revId !== id));
      }, 10000);
    }
  };

  const openModal = (item?: VaultItem) => {
    if (item) {
      setEditingItem(item);
      setFormTitle(item.title);
      setFormValue(item.value);
    } else {
      setEditingItem(null);
      setFormTitle('');
      setFormValue('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormTitle('');
    setFormValue('');
  };

  const saveItem = () => {
    if (!formTitle.trim() || !formValue.trim()) return;

    if (editingItem) {
      setItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, title: formTitle, value: formValue } 
          : item
      ));
    } else {
      const newItem: VaultItem = {
        id: Date.now().toString(),
        title: formTitle,
        value: formValue,
        category: 'General'
      };
      setItems(prev => [...prev, newItem]);
    }
    closeModal();
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Seguro que deseas eliminar este dato?')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  if (!isMounted) return <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#0a0a0c]" />;

  return (
    <motion.div 
      {...PAGE_TRANSITION}
      className="max-w-md mx-auto flex flex-col gap-6 min-h-[100dvh] pb-24 relative bg-gray-50 dark:bg-[#0a0a0c] text-neutral-900 dark:text-white px-4"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
    >
      {/* Header */}
      <header className="flex items-center gap-3 mt-2">
        <Link 
          href="/boveda"
          className="w-10 h-10 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors shadow-sm"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Datos Secretos <KeyRound size={20} className="text-rose-500" />
          </h1>
        </div>
      </header>

      {/* Intro */}
      <p className="text-sm text-gray-500 dark:text-neutral-400">
        Tus datos clave a un toque de distancia. Tu seguridad está garantizada.
      </p>

      {/* Grid */}
      <div className="flex flex-col gap-3">
        {items.map(item => {
          const isRevealed = revealedIds.includes(item.id);
          const isCopied = copiedId === item.id;
          const displayValue = isRevealed ? item.value : '••••••••••••';
          
          return (
            <motion.div
              layout
              key={item.id}
              onClick={() => copyToClipboard(item.value, item.id)}
              className="group bg-white dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 cursor-pointer active:scale-[0.98] transition-all shadow-sm hover:border-gray-300 dark:hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-gray-400 dark:text-neutral-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                    {item.title}
                  </span>
                  <span className={`text-base font-medium break-all ${isRevealed ? 'text-gray-900 dark:text-neutral-100' : 'text-gray-400 dark:text-neutral-500 tracking-[0.2em]'}`}>
                    {displayValue}
                  </span>
                </div>

                <div className="flex gap-1.5 shrink-0 items-center">
                  <button 
                    onClick={(e) => toggleVisibility(item.id, e)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isCopied 
                      ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400' 
                      : 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/20 dark:text-rose-400 group-hover:bg-rose-500/20'
                  }`}>
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <button 
                  onClick={(e) => { e.stopPropagation(); openModal(item); }}
                  className="text-xs font-semibold text-gray-500 dark:text-neutral-400 flex items-center gap-1 hover:text-indigo-500 transition-colors"
                >
                  <Edit2 size={12} /> Editar
                </button>
                <button 
                  onClick={(e) => deleteItem(item.id, e)}
                  className="text-xs font-semibold text-gray-500 dark:text-neutral-400 flex items-center gap-1 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={12} /> Eliminar
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FAB Button */}
      <button 
        onClick={() => openModal()}
        className="fixed bottom-20 right-4 w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-rose-500/20 active:scale-90 transition-transform z-40"
      >
        <Plus size={24} />
      </button>

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={SPRING_CONFIG}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingItem ? 'Editar Dato' : 'Nuevo Dato'}
                </h3>
                <button onClick={closeModal} className="text-gray-500 p-1"><X size={18} /></button>
              </div>
              
              <div className="flex flex-col gap-3">
                <input 
                  placeholder="Título (Ej: CBU)"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors"
                />
                <textarea 
                  placeholder="Valor"
                  value={formValue}
                  onChange={e => setFormValue(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 dark:bg-[#0a0a0c] border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white focus:outline-none focus:border-rose-500 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  onClick={closeModal}
                  className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-bold rounded-xl active:scale-[0.98] transition-transform"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveItem}
                  className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl active:scale-[0.98] transition-transform shadow-lg shadow-rose-500/20"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
