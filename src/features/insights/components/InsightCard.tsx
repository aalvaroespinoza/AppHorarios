import React from 'react';
import { Sparkles } from 'lucide-react';
import NativeCard from '@/core/components/ui/NativeCard';

interface InsightCardProps {
  title: string;
  description: string;
  type?: 'task' | 'expense' | 'event';
}

export const InsightCard: React.FC<InsightCardProps> = ({ title, description, type }) => {
  return (
    <NativeCard className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-500/20">
      <div className="flex items-start gap-3 p-4">
        <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-300">
          <Sparkles size={18} />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-medium text-indigo-100">{title}</h4>
          <p className="text-xs text-indigo-200/70">{description}</p>
        </div>
      </div>
    </NativeCard>
  );
};
