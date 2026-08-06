"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Check, X, Edit2 } from 'lucide-react';
import type { useAgenda } from '@/hooks/useAgenda';

interface ParsedResult {
  titulo: string;
  fecha: string | null; // ISO string
  displayFecha: string; // "lunes 10 a las 15:00"
  diaSemana: string; // "lunes" (para guardar en useAgenda si hace falta)
  horaInicio: string; // "15:00"
}

export default function VoiceRecorder({ agenda, onClose }: { agenda: ReturnType<typeof useAgenda>, onClose: () => void }) {
  const [isRecording, setIsRecording] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<ParsedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorStr, setErrorStr] = useState('');

  // Editable fields during confirmation
  const [editTitulo, setEditTitulo] = useState('');
  const [editDisplayFecha, setEditDisplayFecha] = useState('');

  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setErrorStr('Tu navegador no soporta reconocimiento de voz.');
        setIsRecording(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'es-AR';
      recognition.interimResults = true;
      recognition.continuous = false;

      let finalTranscript = '';
      
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        finalTranscript = currentTranscript;
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        setErrorStr(`Error de voz: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        if (isRecording) {
          processTranscript(finalTranscript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err: any) {
      setErrorStr(err.message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // Autostart
  useEffect(() => {
    const timer = setTimeout(startRecording, 100);
    return () => clearTimeout(timer);
  }, []);

  const processTranscript = async (textToProcessObj: string) => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Fallback if empty
    const textToProcess = textToProcessObj.trim();
    if (!textToProcess) {
      setErrorStr('No escuché nada. Intenta de nuevo.');
      setIsProcessing(false);
      return;
    }

    try {
      const chrono = await import('chrono-node');
      const results = chrono.es.parse(textToProcess);

      if (results.length === 0) {
        // No date found
        setParsedData({
          titulo: textToProcess,
          fecha: null,
          displayFecha: 'Sin fecha específica',
          diaSemana: 'lunes', // default
          horaInicio: '09:00', // default
        });
        setEditTitulo(textToProcess);
        setEditDisplayFecha('Sin fecha específica');
        setIsProcessing(false);
        return;
      }

      const parsed = results[0];
      const parsedDate = parsed.start.date();
      
      // Extract title by removing the matched text
      const titulo = textToProcess.replace(parsed.text, '').replace(/\s+/g, ' ').trim() || 'Recordatorio';

      const mapDays: Record<number, string> = {
        1: 'lunes', 2: 'martes', 3: 'miercoles', 4: 'jueves', 5: 'viernes', 6: 'sabado', 0: 'domingo'
      };
      const diaSemana = mapDays[parsedDate.getDay()];
      const horaInicio = `${parsedDate.getHours().toString().padStart(2, '0')}:${parsedDate.getMinutes().toString().padStart(2, '0')}`;
      
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
      const displayFecha = parsedDate.toLocaleDateString('es-AR', options);

      setParsedData({
        titulo: titulo.charAt(0).toUpperCase() + titulo.slice(1),
        fecha: parsedDate.toISOString(),
        displayFecha,
        diaSemana,
        horaInicio
      });

      setEditTitulo(titulo.charAt(0).toUpperCase() + titulo.slice(1));
      setEditDisplayFecha(displayFecha);
    } catch (err) {
      console.error(err);
      setErrorStr('Error procesando el texto');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAndSave = () => {
    if (!parsedData) return;
    
    // 1. Guardar en Agenda local
    agenda.agregarEvento({
      id: `voice-${Date.now()}`,
      titulo: editTitulo,
      horaInicio: parsedData.horaInicio,
      horaFin: parsedData.horaInicio, // No fin para recordatorios simples
      dia: parsedData.diaSemana
    });

    // 2. Disparar iOS Shortcut
    // Formato exacto JSON stringificado según URL scheme de Apple: input=text&text=...
    const payload = JSON.stringify({
      titulo: editTitulo,
      fecha: parsedData.fecha // ISO string
    });
    const url = `shortcuts://x-callback-url/run-shortcut?name=CrearRecordatorioApp&input=text&text=${encodeURIComponent(payload)}`;
    
    window.location.href = url;
    onClose();
  };

  return (
    <div className="flex flex-col gap-3 relative">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-zinc-300 font-bold text-sm flex items-center gap-2">
          <Mic size={16} className={isRecording ? 'text-red-500 animate-pulse' : 'text-zinc-500'}/> 
          Dictado Inteligente
        </h3>
        <button onClick={() => { stopRecording(); onClose(); }} className="text-zinc-500 hover:text-white p-1"><X size={16}/></button>
      </div>

      {!parsedData && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[120px] relative overflow-hidden">
          {isRecording && <div className="absolute inset-0 bg-red-500/5 animate-pulse" />}
          <p className="text-zinc-300 text-center text-sm font-medium relative z-10 italic">
            {transcript || (isRecording ? "Escuchando..." : "")}
          </p>
          
          {errorStr && <p className="text-red-400 text-xs mt-2 font-bold">{errorStr}</p>}
          
          {isProcessing && <p className="text-blue-400 text-xs mt-2 font-bold animate-pulse">Procesando NLP...</p>}
        </div>
      )}

      {isRecording && !isProcessing && (
        <button 
          onClick={stopRecording}
          className="bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl py-2 flex items-center justify-center gap-2 font-bold text-sm hover:bg-red-500/30 transition-colors"
        >
          <Square size={14} className="fill-current"/> Detener
        </button>
      )}

      {parsedData && (
        <div className="flex flex-col gap-3">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-4 flex flex-col gap-3">
            <h4 className="text-blue-400 text-xs font-bold uppercase tracking-wider">Entendí:</h4>
            
            <div className="flex flex-col gap-1">
              <label className="text-zinc-500 text-[10px] uppercase font-bold">Título</label>
              <input 
                value={editTitulo}
                onChange={e => setEditTitulo(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-white text-sm font-semibold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-500 text-[10px] uppercase font-bold">Cuándo</label>
              <input 
                value={editDisplayFecha}
                onChange={e => setEditDisplayFecha(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-300 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => { setParsedData(null); setTranscript(''); startRecording(); }}
              className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-bold hover:bg-zinc-700 flex items-center justify-center gap-1.5"
            >
              Reintentar
            </button>
            <button 
              onClick={confirmAndSave}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-500 flex items-center justify-center gap-1.5"
            >
              <Check size={16}/> Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
