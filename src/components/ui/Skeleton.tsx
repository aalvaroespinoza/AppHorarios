import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-surface border border-line rounded-2xl ${className}`} />
  );
}

export function SkeletonHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="w-8 h-8 rounded-2xl" />
      <Skeleton className="w-32 h-8 rounded-2xl" />
    </div>
  );
}
