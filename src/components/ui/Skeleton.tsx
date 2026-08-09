import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-800/80 rounded-2xl ${className}`} />
  );
}

export function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <Skeleton className="w-10 h-10 rounded-full" />
      <Skeleton className="w-32 h-8" />
    </div>
  );
}
