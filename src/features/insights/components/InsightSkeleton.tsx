import React from 'react';
import NativeCard from '@/core/components/ui/NativeCard';

export const InsightSkeleton: React.FC = () => {
  return (
    <NativeCard className="animate-pulse bg-neutral-900/50 border border-neutral-800">
      <div className="flex items-start gap-3 p-4">
        <div className="w-9 h-9 bg-neutral-800 rounded-full" />
        <div className="flex flex-col gap-2 flex-1 pt-1">
          <div className="w-24 h-3 bg-neutral-800 rounded-full" />
          <div className="w-full h-2 bg-neutral-800 rounded-full" />
          <div className="w-2/3 h-2 bg-neutral-800 rounded-full" />
        </div>
      </div>
    </NativeCard>
  );
};
