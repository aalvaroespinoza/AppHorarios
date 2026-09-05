import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-900 border border-zinc-800 rounded-sm ${className}`} />
  );
}

export function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="w-8 h-8 rounded-sm" />
      <Skeleton className="w-32 h-8 rounded-sm" />
    </div>
  );
}
