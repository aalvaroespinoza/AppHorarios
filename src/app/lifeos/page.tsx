"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Loader2, Sparkles, Mic, 
  Bell, DollarSign, Calendar, StickyNote, 
  ChevronRight, Bot, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useLocalStorageState } from '@/core/hooks/useLocalStorageState';
import { useActionDispatcher } from '@/core/engine/useActionDispatcher';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  status: 'loading' | 'success' | 'error';
  metadata?: any;
  action?: {
    label: string;
    url: string;
  };
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => unknown) | null;
  onerror: ((this: ISpeechRecognition, ev: ISpeechRecognitionErrorEvent) => unknown) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => unknown) | null;
}

const SUGGESTIONS = [
  "Gasté $3500 en nafta",
  "Recordame mañana estudiar",
  "Agendame una reunión el viernes a las 18",
  "¿Qué tengo mañana?"
];

export default function LifeOSConsole() {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const { dispatch } = useActionDispatcher();
  const [history, setHistory, isMounted] = useLocalStorageState<ChatMessage[]>('lifeos_history', []);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const textBeforeDictationRef = useRef('');
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isMounted) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, inputText, isMounted]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as unknown as { SpeechRecognition: new () => ISpeechRecognition }).SpeechRecognition || 
                              (window as unknown as { webkitSpeechRecognition: new () => ISpeechRecognition }).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-AR';

        recognition.onresult = (event: ISpeechRecognitionEvent) => {
          if (isSubmittingRef.current) return; // Evitar modificar input si se está enviando

          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptChunk;
            } else {
              interimTranscript += transcriptChunk;
            }
          }

          if (finalTranscript) {
            textBeforeDictationRef.current = textBeforeDictationRef.current 
              ? `${textBeforeDictationRef.current} ${finalTranscript}`.trim()
              : finalTranscript.trim();
          }

          const currentText = textBeforeDictationRef.current 
            ? `${textBeforeDictationRef.current} ${interimTranscript}`.trim()
            : interimTranscript.trim();

          setInputText(currentText);
        };

        recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
          console.error('Error en reconocimiento de voz:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            alert('Permiso de micrófono denegado. Por favor, habilítalo en tu navegador.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta el dictado por voz nativo.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      textBeforeDictationRef.current = inputText.trim();
      isSubmittingRef.current = false;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("El micrófono ya estaba ocupado o hubo un error al iniciar:", e);
        setIsListening(false);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    isSubmittingRef.current = true;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.abort(); // Cancelar incondicionalmente para evitar onresult póstumos
      setIsListening(false);
    }

    const commandText = inputText.trim();
    const timestamp = new Date().toISOString();
    const userMsgId = crypto.randomUUID();
    const asstMsgId = crypto.randomUUID();

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: commandText,
      timestamp,
      status: 'success'
    };

    const asstMsg: ChatMessage = {
      id: asstMsgId,
      role: 'assistant',
      text: '',
      timestamp: new Date().toISOString(),
      status: 'loading'
    };

    setHistory((prev) => [...prev, userMsg, asstMsg]);
    
    setInputText('');
    textBeforeDictationRef.current = '';
    setIsSubmitting(true);

    try {
      const recentHistory = history
        .slice(-6)
        .map(msg => ({ role: msg.role, text: msg.text }));

      const response = await fetch('/api/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: commandText,
          history: recentHistory
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error en el servidor' }));
        throw new Error(errorData.error || 'Error en el servidor');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.error || 'Error procesando tu petición');
      }

      const intent = responseData.data;
      const result = await dispatch(intent);

      let actionObj = undefined;
      if (result.success) {
        if (intent.type === 'create_expense') actionObj = { label: 'Ver Finanzas', url: '/finanzas' };
        if (intent.type === 'create_reminder' || intent.type === 'create_task' || intent.type === 'TASK') actionObj = { label: 'Ver Deadlines', url: '/horarios' };
        if (intent.type === 'create_event' || intent.type === 'EVENT') actionObj = { label: 'Ver Calendario', url: '/horarios' };
        if (intent.type === 'TRACK_HARDWARE') actionObj = { label: 'Ver Bóveda', url: '/boveda' };
      }
      
      setHistory((prev) => 
        prev.map((msg) => 
          msg.id === asstMsgId 
            ? { 
                ...msg, 
                status: result.success || result.needs_input ? 'success' : 'error', 
                text: result.userMessage,
                action: actionObj,
                metadata: { intent, result }
              } 
            : msg
        )
      );

    } catch (error: unknown) {
      console.error('Error enviando al cerebro:', error);
      setHistory((prev) => 
        prev.map((msg) => 
          msg.id === asstMsgId 
            ? { 
                ...msg, 
                status: 'error', 
                text: error instanceof Error ? error.message : 'Error procesando el comando' 
              } 
            : msg
        )
      );
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleQuickAction = (prefix: string) => {
    setInputText(prefix);
  };

  const isAIThinking = history.some(h => h.role === 'assistant' && h.status === 'loading');

  if (!isMounted) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#0a0a0c] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#0a0a0c] text-neutral-200 pt-[env(safe-area-inset-top)] pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
      
      {/* Header Nativo y Discreto */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a0c] sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <Sparkles size={16} className="text-indigo-400" />
          </div>
          <h1 className="text-base font-semibold tracking-tight text-white">LifeOS</h1>
        </div>
        
        {/* Indicador de estado de IA */}
        <div className="flex items-center gap-2">
          {isAIThinking ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <Loader2 size={12} className="animate-spin text-indigo-400" />
              <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-wider">Procesando</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800/50 border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">En línea</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Área principal de conversación */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0c]">
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth">
            {history.length === 0 ? (
              <div className="flex flex-col h-full items-center justify-center max-w-sm mx-auto">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-white/5 flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/10"
                >
                  <Sparkles size={28} className="text-indigo-400" />
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-xl font-semibold text-white mb-2 text-center tracking-tight"
                >
                  ¿Cómo te ayudo hoy?
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-sm text-neutral-400 text-center mb-8"
                >
                  Usa lenguaje natural para gestionar tu vida, finanzas y horarios.
                </motion.p>
                
                <div className="w-full space-y-2.5">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + (idx * 0.1) }}
                      onClick={() => setInputText(suggestion)}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] active:scale-[0.98] transition-all text-left group"
                    >
                      <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">{suggestion}</span>
                      <ChevronRight size={16} className="text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {history.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-4">
                    {msg.role === 'user' ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="self-end max-w-[85%]"
                      >
                        <div className="bg-indigo-600 text-white px-4 py-3 rounded-[20px] rounded-tr-[4px] text-[15px] shadow-sm leading-relaxed">
                          {msg.text}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95, transformOrigin: "bottom left" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="self-start max-w-[90%] flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot size={14} className="text-indigo-400" />
                        </div>
                        
                        <div className="flex flex-col gap-2 w-full">
                          {msg.status === 'loading' ? (
                            <div className="bg-white/[0.03] border border-white/5 px-4 py-3.5 rounded-[20px] rounded-tl-[4px] flex items-center gap-3 w-fit">
                              <div className="flex gap-1.5">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
                              </div>
                            </div>
                          ) : msg.status === 'error' ? (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-[20px] rounded-tl-[4px] text-[15px] shadow-sm leading-relaxed">
                              {msg.text}
                            </div>
                          ) : (
                            <div className="bg-white/[0.04] border border-white/5 text-neutral-100 px-4 py-3 rounded-[20px] rounded-tl-[4px] text-[15px] shadow-sm leading-relaxed flex flex-col gap-2">
                              <span>{msg.text}</span>
                              {msg.action && (
                                <Link 
                                  href={msg.action.url}
                                  className="mt-1 w-fit flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-medium transition-colors"
                                >
                                  {msg.action.label}
                                  <ExternalLink size={12} />
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Footer: Acciones Rápidas & Input */}
          <div className="w-full bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/5 flex-shrink-0 pb-4 pt-3">
            <div className="max-w-md mx-auto w-full px-3 flex flex-col gap-3">
              
              {/* Acciones Rápidas (Chips) */}
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 px-1 -mx-1 snap-x">
                <button onClick={() => handleQuickAction('Recordatorio: ')} className="snap-start flex-shrink-0 flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-300 transition-colors">
                  <Bell size={12} className="text-amber-400" />
                  <span>Recordatorio</span>
                </button>
                <button onClick={() => handleQuickAction('Gasté ')} className="snap-start flex-shrink-0 flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-300 transition-colors">
                  <DollarSign size={12} className="text-emerald-400" />
                  <span>Gasto</span>
                </button>
                <button onClick={() => handleQuickAction('Agendame ')} className="snap-start flex-shrink-0 flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-300 transition-colors">
                  <Calendar size={12} className="text-blue-400" />
                  <span>Evento</span>
                </button>
                <button onClick={() => handleQuickAction('Nota: ')} className="snap-start flex-shrink-0 flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-300 transition-colors">
                  <StickyNote size={12} className="text-purple-400" />
                  <span>Nota</span>
                </button>
              </div>

              {/* Formulario de Input */}
              <form onSubmit={handleSubmit} className="relative flex items-end bg-white/[0.03] rounded-[24px] p-1.5 border border-white/10 focus-within:border-indigo-500/50 focus-within:bg-white/[0.05] transition-all">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-full transition-colors flex-shrink-0 mb-0.5 ${
                    isListening 
                      ? 'text-red-500 bg-red-500/10' 
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
                </button>
                
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  disabled={isSubmitting}
                  placeholder="Escribe o dicta algo..."
                  rows={1}
                  className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none text-[16px] text-white placeholder-neutral-500 py-2.5 px-2 focus:outline-none focus:ring-0 disabled:opacity-50 resize-none overflow-y-auto leading-relaxed"
                  style={{
                    height: inputText ? `${Math.min(120, Math.max(44, inputText.split('\n').length * 24 + 20))}px` : '44px'
                  }}
                />
                
                <button 
                  type="submit" 
                  disabled={isSubmitting || !inputText.trim()}
                  className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all disabled:opacity-30 disabled:hover:bg-indigo-600 flex items-center justify-center flex-shrink-0 mb-0.5 ml-1 disabled:scale-95 active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} className="ml-0.5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}
