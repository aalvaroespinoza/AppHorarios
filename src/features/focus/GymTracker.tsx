"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, X, Timer, Check } from 'lucide-react';
import NativeCard from '@/core/components/ui/NativeCard';
import { SPRING_CONFIG, TAP_ANIMATION } from '@/lib/animations';

const EXERCISES = [
  { id: 1, name: 'Press Banca', kg: '80', reps: '8' },
  { id: 2, name: 'Dominadas', kg: '+10', reps: '10' },
  { id: 3, name: 'Press Inclinado', kg: '30', reps: '10' },
  { id: 4, name: 'Remo Gironda', kg: '65', reps: '12' },
];

export function GymTracker() {
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [setsCompleted, setSetsCompleted] = useState<Record<number, boolean>>({});
  const [restTime, setRestTime] = useState(0);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTime > 0) {
      interval = setInterval(() => {
        setRestTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restTime]);

  const toggleSet = (id: number) => {
    setSetsCompleted(prev => {
      const isCurrentlyDone = prev[id];
      if (!isCurrentlyDone) {
        // Trigger Rest Time (90s)
        setRestTime(90);
      }
      return { ...prev, [id]: !isCurrentlyDone };
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };



  return (
    <>
      <AnimatePresence>
        {!selectedRoutine && (
          <motion.div
            layoutId="gym-card"
            onClick={() => setSelectedRoutine("push-pull")}
            transition={SPRING_CONFIG}
            className="w-full cursor-pointer"
          >
            <NativeCard className="bg-zinc-900/60 border border-zinc-800 p-5 flex items-center justify-between active:scale-95 transition-transform shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <Dumbbell size={24} className="text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400/80 mb-0.5">Entrenamiento</span>
                  <h3 className="font-bold text-white text-base">Día de Pecho/Espalda</h3>
                </div>
              </div>
            </NativeCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRoutine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedRoutine(null)}
            />
            
            <motion.div
              layoutId="gym-card"
              transition={SPRING_CONFIG}
              className="relative w-full max-w-md h-[80dvh] bg-[#121214] border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Dumbbell size={24} className="text-indigo-400" /> Pecho & Espalda
                  </h2>
                  <p className="text-sm text-zinc-400 font-medium">Enfócate en la técnica. 90s descanso.</p>
                </div>
                <button 
                  onClick={() => setSelectedRoutine(null)}
                  className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Timer Rest Floating Banner */}
              <AnimatePresence>
                {restTime > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={SPRING_CONFIG}
                    className="flex items-center justify-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 py-3 rounded-2xl font-bold tracking-widest text-lg"
                  >
                    <Timer size={20} className={restTime % 2 === 0 ? "text-indigo-400" : "text-indigo-200"} />
                    Descanso: {formatTime(restTime)}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ejercicios List */}
              <div className="flex flex-col overflow-y-auto hide-scrollbar flex-1 pb-10">
                <div className="flex items-center justify-between px-2 mb-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <span>Ejercicio</span>
                  <div className="flex items-center gap-6">
                    <span>Kg</span>
                    <span>Reps</span>
                    <span className="w-8 text-center">Done</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {EXERCISES.map((ex) => (
                    <div key={ex.id} className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                      <span className="text-sm font-bold text-white">{ex.name}</span>
                      <div className="flex items-center gap-6">
                        <span className="text-sm text-zinc-300 font-medium w-6 text-center">{ex.kg}</span>
                        <span className="text-sm text-zinc-300 font-medium w-6 text-center">{ex.reps}</span>
                        <motion.button
                          whileTap={TAP_ANIMATION}
                          onClick={() => toggleSet(ex.id)}
                          initial={false}
                          animate={{ 
                            scale: setsCompleted[ex.id] ? [1, 1.2, 1] : 1,
                            backgroundColor: setsCompleted[ex.id] ? 'rgba(74, 222, 128, 0.2)' : 'rgba(39, 39, 42, 1)',
                            borderColor: setsCompleted[ex.id] ? 'rgba(74, 222, 128, 0.4)' : 'rgba(63, 63, 70, 1)'
                          }}
                          transition={{ duration: 0.3 }}
                          className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors"
                        >
                          {setsCompleted[ex.id] && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              <Check size={16} className="text-emerald-400" />
                            </motion.div>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
