import React from 'react';
import { BrainCircuit } from 'lucide-react';

export const EmptyInsights: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-neutral-900/50 flex items-center justify-center text-neutral-500 border border-neutral-800">
        <BrainCircuit size={20} />
      </div>
      <p className="text-sm text-neutral-400">
        LifeOS está analizando tu rutina. <br />
        <span className="text-xs text-neutral-500">Pronto verás sugerencias inteligentes aquí.</span>
      </p>
    </div>
  );
};
