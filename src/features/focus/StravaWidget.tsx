"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bike, AlertTriangle } from 'lucide-react';
import { TAP_ANIMATION } from '@/lib/animations';

export function StravaWidget() {
  const [data, setData] = useState<{ authenticated: boolean; activities?: any[] } | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/strava/activities')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch");
        }
        const text = await res.text();
        if (!text) {
           throw new Error("Empty response");
        }
        return JSON.parse(text);
      })
      .then(d => {
        if (d.error) {
          setError(true);
        } else {
          setData(d);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="bg-zinc-900/60 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
        <p className="text-sm text-zinc-400 font-medium">
          Faltan configurar las credenciales de Strava en el entorno.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#fc4c02] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.authenticated) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={TAP_ANIMATION}
        className="bg-gradient-to-br from-[#fc4c02]/10 to-[#fc4c02]/5 border border-[#fc4c02]/20 rounded-2xl p-5 flex items-center justify-between cursor-pointer shadow-sm"
        onClick={() => window.location.href = '/api/strava/auth'}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#fc4c02]/20 flex items-center justify-center shrink-0 border border-[#fc4c02]/30">
            <Bike size={24} className="text-[#fc4c02]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-[#fc4c02]/80 mb-0.5">Strava</span>
            <h3 className="font-bold text-white text-base">Conectar con Strava</h3>
          </div>
        </div>
      </motion.div>
    );
  }

  const act = data?.activities?.[0];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={TAP_ANIMATION}
      className="bg-gradient-to-br from-[#fc4c02]/10 to-[#fc4c02]/5 border border-[#fc4c02]/20 rounded-2xl p-5 flex items-center gap-4 cursor-pointer shadow-sm"
    >
      <div className="w-12 h-12 rounded-full bg-[#fc4c02]/20 flex items-center justify-center shrink-0 border border-[#fc4c02]/30">
        <Bike size={24} className="text-[#fc4c02]" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-widest text-[#fc4c02]/80 mb-0.5">Última Actividad</span>
        <h3 className="font-bold text-white text-base">{act?.name || 'Ciclismo'}</h3>
        <p className="text-sm text-zinc-400 font-medium">
          {act ? `${(act.distance / 1000).toFixed(1)} km • ${Math.floor(act.moving_time / 60)}m` : '0 km • 0m'}
        </p>
      </div>
    </motion.div>
  );
}
