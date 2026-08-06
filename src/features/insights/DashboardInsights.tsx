"use client";

import React, { useState } from 'react';
import { Send, BrainCircuit } from 'lucide-react';
import { InsightCard } from './components/InsightCard';
import { InsightSkeleton } from './components/InsightSkeleton';
import { EmptyInsights } from './components/EmptyInsights';

/**
 * Contenedor principal de Insights en el Dashboard.
 * Conectado con el Brain Engine para demostrar el flujo End-to-End.
 */
export const DashboardInsights: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setInsights([]); // Limpiamos para el ejemplo 1 a 1
    
    try {
      const res = await fetch('/api/core/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      const data = await res.json();
      
      if (data && data.intent) {
        let title = 'Insight';
        let description = 'Analizado por LifeOS';

        // Mapeo simple del JSON devuelto a la UI visual
        if (data.intent === 'expense' && data.extractedEntities) {
          title = 'Gasto Registrado';
          description = `${data.extractedEntities.description || 'Gasto'} - $${data.extractedEntities.amount}`;
        } else if (data.intent === 'task' && data.extractedEntities) {
          title = 'Tarea Pendiente';
          description = `${data.extractedEntities.title}`;
          if (data.extractedEntities.dueDate) {
            description += ` (Para: ${new Date(data.extractedEntities.dueDate).toLocaleDateString()})`;
          }
        } else if (data.intent === 'event' && data.extractedEntities) {
          title = 'Evento Detectado';
          description = `${data.extractedEntities.title}`;
        } else {
          title = 'Intención Desconocida';
          description = data.reasoning || 'No pude clasificar el mensaje.';
        }

        setInsights([{ title, description, type: data.intent }]);
      }
    } catch (error) {
      console.error('Error in BrainEngine:', error);
      setInsights([{ title: 'Error de Red', description: 'No se pudo conectar con el Brain Engine.', type: 'unknown' }]);
    } finally {
      setIsLoading(false);
      setText('');
    }
  };

  return (
    <div className="flex flex-col gap-4 my-2">
      
      {/* Smart Input (Brain Engine) */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3 text-indigo-400">
          <BrainCircuit size={18} />
        </div>
        <input 
          type="text" 
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          placeholder="Ej: Compré café por 2500..."
          className="w-full bg-neutral-900/50 border border-neutral-800 text-sm text-neutral-200 placeholder-neutral-500 rounded-2xl py-3 pl-10 pr-12 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
        />
        <button 
          type="submit" 
          disabled={isLoading || !text.trim()}
          className="absolute right-2 p-2 bg-indigo-500/20 text-indigo-300 rounded-xl hover:bg-indigo-500/30 transition-colors disabled:opacity-30 disabled:hover:bg-indigo-500/20"
        >
          <Send size={14} />
        </button>
      </form>

      {/* Resultados Visuales */}
      {isLoading ? (
        <InsightSkeleton />
      ) : insights.length === 0 ? (
        <EmptyInsights />
      ) : (
        <div className="flex flex-col gap-3">
          {insights.map((insight) => (
            <InsightCard 
              key={insight.id || crypto.randomUUID()} 
              title={insight.title} 
              description={insight.description} 
              type={insight.type} 
            />
          ))}
        </div>
      )}

    </div>
  );
};
