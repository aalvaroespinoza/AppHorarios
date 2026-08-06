"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, TerminalSquare, Mic } from 'lucide-react';

interface CommandHistory {
  id: string;
  text: string;
  status: 'loading' | 'success' | 'error';
  result?: string;
}

export default function LifeOSConsole() {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const initialTextRef = useRef('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, inputText]);

  useEffect(() => {
    // Inicializar SpeechRecognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'es-AR';
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setInputText((initialTextRef.current ? initialTextRef.current + ' ' : '') + transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      initialTextRef.current = inputText;
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

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
    initialTextRef.current = '';
    setIsSubmitting(true);
    
    // Parar el mic si estaba escuchando y enviamos
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

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
            ? { ...cmd, status: 'success', result: data.data?.reply || `Procesado: ${data.data?.type || 'Completado'}` } 
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
    <div className="flex flex-col h-[100dvh] bg-black text-neutral-200">
      
      {/* Header Minimalista */}
      <div className="pt-safe px-4 py-4 border-b border-neutral-900/50 flex items-center justify-center relative flex-shrink-0">
        <h1 className="text-sm font-medium tracking-wide flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-400" />
          LifeOS
        </h1>
      </div>

      {/* Historial de Comandos */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-safe pb-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-600 gap-3 opacity-50">
            <TerminalSquare size={32} className="opacity-50" />
            <p className="text-sm">En qué te ayudo hoy?</p>
          </div>
        ) : (
          <AnimatePresence>
            {history.map((cmd) => (
              <div key={cmd.id} className="flex flex-col gap-3">
                {/* User Bubble */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="self-end max-w-[85%] bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm shadow-sm"
                >
                  {cmd.text}
                </motion.div>
                
                {/* System Bubble */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="self-start max-w-[85%] bg-neutral-800 text-neutral-200 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm shadow-sm"
                >
                  {cmd.status === 'loading' ? (
                    <div className="flex items-center gap-2 text-neutral-400 py-1">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs">Pensando...</span>
                    </div>
                  ) : cmd.status === 'error' ? (
                    <span className="text-red-400">{cmd.result}</span>
                  ) : (
                    <span>{cmd.result}</span>
                  )}
                </motion.div>
              </div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Comando (Flujo Normal Flex) */}
      <div className="w-full px-4 pb-24 pt-4 bg-gradient-to-t from-black via-black to-transparent flex-shrink-0">
        <div className="max-w-md mx-auto relative">
          <form onSubmit={handleSubmit} className="relative flex items-center shadow-2xl shadow-indigo-900/20 bg-neutral-900 rounded-2xl p-1 border border-neutral-800">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-colors ${isListening ? 'text-red-500 bg-red-500/10' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              <Mic size={18} className={isListening ? 'animate-pulse' : ''} />
            </button>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSubmitting}
              placeholder="Escribe o dicta algo..."
              className="flex-1 bg-transparent border-none text-sm text-neutral-100 placeholder-neutral-500 py-3 px-2 focus:outline-none focus:ring-0 disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !inputText.trim()}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-30 disabled:hover:bg-indigo-600 flex items-center justify-center mr-1"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
