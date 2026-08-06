"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, TerminalSquare } from 'lucide-react';

interface CommandHistory {
  id: string;
  text: string;
  status: 'loading' | 'success' | 'error';
  result?: string;
}

export default function LifeOSConsole() {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<CommandHistory[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    const commandText = inputText.trim();
    const commandId = crypto.randomUUID();

    // Agregar al historial de manera optimista
    setHistory((prev) => [
      ...prev,
      { id: commandId, text: commandText, status: 'loading' }
    ]);
    
    setInputText('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commandText }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error en el servidor' }));
        throw new Error(errorData.error || 'Error en el servidor');
      }

      const data = await response.json();
      
      // Actualizar estado a éxito
      setHistory((prev) => 
        prev.map((cmd) => 
          cmd.id === commandId 
            ? { ...cmd, status: 'success', result: `Procesado: ${data.data?.type || 'Acción completada'}` } 
            : cmd
        )
      );

    } catch (error: any) {
      console.error('Error enviando al cerebro:', error);
      // Actualizar estado a error con el mensaje real devuelto por la API
      setHistory((prev) => 
        prev.map((cmd) => 
          cmd.id === commandId 
            ? { ...cmd, status: 'error', result: error instanceof Error ? error.message : 'Error procesando el comando' } 
            : cmd
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-neutral-200">
      
      {/* Header Minimalista */}
      <div className="pt-safe px-4 py-4 border-b border-neutral-900/50 flex items-center gap-2">
        <TerminalSquare size={18} className="text-indigo-400" />
        <h1 className="text-sm font-medium tracking-wide">Consola LifeOS</h1>
      </div>

      {/* Historial de Comandos */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 pb-32">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600 gap-3 opacity-50">
            <Sparkles size={24} />
            <p className="text-xs">Esperando input cerebral...</p>
          </div>
        ) : (
          <AnimatePresence>
            {history.map((cmd) => (
              <motion.div 
                key={cmd.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-indigo-500 font-mono">{'>'}</span>
                  <span className="text-neutral-300">{cmd.text}</span>
                </div>
                <div className="pl-4 flex items-center gap-2">
                  {cmd.status === 'loading' ? (
                    <Loader2 size={12} className="animate-spin text-neutral-500" />
                  ) : cmd.status === 'error' ? (
                    <span className="text-xs text-red-400">{cmd.result}</span>
                  ) : (
                    <span className="text-xs text-emerald-400">{cmd.result}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input de Comando (Bottom Fixed) */}
      <div className="fixed bottom-0 left-0 w-full p-4 pb-safe bg-gradient-to-t from-black via-black to-transparent">
        <div className="max-w-md mx-auto mb-16 relative">
          <form onSubmit={handleSubmit} className="relative flex items-center shadow-2xl shadow-indigo-900/10">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSubmitting}
              placeholder="Registrar gasto, recordar algo, o pensar en voz alta..."
              className="w-full bg-neutral-900 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-500 rounded-2xl py-4 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !inputText.trim()}
              className="absolute right-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-30 disabled:hover:bg-indigo-600 flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} className="ml-[1px]" />
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
