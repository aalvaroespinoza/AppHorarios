'use client';

import { useState, useEffect } from 'react';

export default function RelojMinimalista() {
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-AR', { hour12: false }));
    };
    
    updateTime(); // llamada inicial
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <div className="text-xs text-zinc-500 font-mono tracking-wider tabular-nums h-[16px] min-w-[55px] opacity-0">...</div>;
  }

  return (
    <div className="text-xs text-zinc-500 font-mono tracking-wider tabular-nums">
      {time}
    </div>
  );
}
