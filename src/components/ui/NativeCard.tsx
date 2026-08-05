import React from 'react';

interface NativeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function NativeCard({ children, className = '', ...props }: NativeCardProps) {
  return (
    <div 
      className={`bg-zinc-900 rounded-3xl border border-zinc-800 p-5 overflow-hidden shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
