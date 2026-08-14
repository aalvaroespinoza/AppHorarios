"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, CheckCheck, Trash2, Bus, 
  CheckSquare, Wallet, Calendar, AlertCircle, Sparkles, ChevronRight, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTodaySchedule } from '@/hooks/useTodaySchedule';

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: 'travel' | 'task' | 'finance' | 'academic' | 'system';
  link?: string;
}

interface NotificationInboxProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationInbox({ isOpen, onClose, onUnreadCountChange }: NotificationInboxProps) {
  const {
    materiasDelDia,
    isToday,
    horaActualHHMM,
    recomendacionIda,
    recomendacionVuelta
  } = useTodaySchedule();

  const [readIds, setReadIds] = useState<string[]>([]);
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const storedRead = localStorage.getItem('lifeos_read_notifications');
        if (storedRead) setReadIds(JSON.parse(storedRead));
        
        const storedCleared = localStorage.getItem('lifeos_cleared_notifications');
        if (storedCleared) setClearedIds(JSON.parse(storedCleared));
      } catch (e) {}
    }
  }, []);

  // Generar notificaciones dinámicas y reales basadas en el contexto del usuario
  const activeNotifications: SystemNotification[] = useMemo(() => {
    if (!isMounted) return [];
    const list: SystemNotification[] = [];
    const [currentH, currentM] = (horaActualHHMM || "00:00").split(':').map(Number);
    const currentMinutes = (isNaN(currentH) ? 0 : currentH) * 60 + (isNaN(currentM) ? 0 : currentM);

    // 1. Notificación de Viaje de Ida (si faltan menos de 2 horas)
    if (recomendacionIda?.recomendado && isToday) {
      const [salidaH, salidaM] = recomendacionIda.recomendado.horaSalida.split(':').map(Number);
      const salidaMinutes = salidaH * 60 + salidaM;
      const diff = salidaMinutes - currentMinutes;

      if (diff > 0 && diff <= 120) {
        list.push({
          id: `notif-bus-ida-${recomendacionIda.recomendado.horaSalida}`,
          title: 'Próxima Salida de Colectivo',
          description: `Tu colectivo de ${recomendacionIda.recomendado.empresa} sale a las ${recomendacionIda.recomendado.horaSalida} hs hacia Córdoba (${diff} min restantes).`,
          time: diff <= 15 ? 'Ahora' : `En ${diff} min`,
          read: false,
          category: 'travel',
          link: '/viajes'
        });
      }
    }

    // 2. Notificación de Clases del Día (próxima hora o en curso)
    if (materiasDelDia && materiasDelDia.length > 0 && isToday) {
      materiasDelDia.forEach((materia, idx) => {
        const horaInicio = materia.horaInicio || "08:00";
        const [matH, matM] = horaInicio.split(':').map(Number);
        const matMinutes = matH * 60 + matM;
        const diff = matMinutes - currentMinutes;

        if (diff > -45 && diff <= 90) {
          list.push({
            id: `notif-class-${materia.id || idx}`,
            title: diff <= 0 ? 'Clase en Curso' : 'Próxima Materia',
            description: `${materia.nombre} • Aula ${materia.aula || 'Campus'} (${horaInicio} hs).`,
            time: diff <= 0 ? 'En curso' : `En ${diff} min`,
            read: false,
            category: 'academic',
            link: '/viajes#seccion-cursado'
          });
        }
      });
    }

    // 3. Notificación de Viaje de Vuelta (si faltan menos de 2 horas)
    if (recomendacionVuelta?.recomendado && isToday) {
      const [vueltaH, vueltaM] = recomendacionVuelta.recomendado.horaSalida.split(':').map(Number);
      const vueltaMinutes = vueltaH * 60 + vueltaM;
      const diff = vueltaMinutes - currentMinutes;

      if (diff > 0 && diff <= 120) {
        list.push({
          id: `notif-bus-vuelta-${recomendacionVuelta.recomendado.horaSalida}`,
          title: 'Regreso a Despeñaderos',
          description: `Colectivo de ${recomendacionVuelta.recomendado.empresa} sale a las ${recomendacionVuelta.recomendado.horaSalida} hs hacia Despeñaderos.`,
          time: `En ${diff} min`,
          read: false,
          category: 'travel',
          link: '/viajes'
        });
      }
    }

    // 4. Notificación de Tareas del Kanban pendientes
    if (typeof window !== 'undefined') {
      try {
        const storedKanban = localStorage.getItem('lifeos_kanban_tasks');
        if (storedKanban) {
          const kanban = JSON.parse(storedKanban);
          const pending = kanban.filter((t: any) => t.status === 'todo' || t.status === 'in-progress');
          if (pending.length > 0) {
            list.push({
              id: 'notif-kanban-pending',
              title: `${pending.length} ${pending.length === 1 ? 'Tarea pendiente' : 'Tareas pendientes'}`,
              description: `Tenés actividades pendientes en tu tablero: "${pending[0].title}"${pending.length > 1 ? ` y ${pending.length - 1} más.` : '.'}`,
              time: 'Hoy',
              read: false,
              category: 'task',
              link: '/kanban'
            });
          }
        }
      } catch (e) {}
    }

    // Filtrar las notificaciones que el usuario vació
    const nonCleared = list.filter(n => !clearedIds.includes(n.id));

    // Marcar como leídas según readIds
    return nonCleared.map(n => ({
      ...n,
      read: readIds.includes(n.id)
    }));
  }, [materiasDelDia, isToday, horaActualHHMM, recomendacionIda, recomendacionVuelta, isMounted, readIds, clearedIds]);

  // Actualizar contador no leídos hacia el Navbar
  useEffect(() => {
    const unread = activeNotifications.filter(n => !n.read).length;
    if (onUnreadCountChange) {
      onUnreadCountChange(unread);
    }
  }, [activeNotifications, onUnreadCountChange]);

  const handleMarkAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const next = [...readIds, id];
      setReadIds(next);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lifeos_read_notifications', JSON.stringify(next));
      }
    }
  };

  const handleMarkAllAsRead = () => {
    const allIds = activeNotifications.map(n => n.id);
    const next = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_read_notifications', JSON.stringify(next));
    }
  };

  const handleClearAll = () => {
    const allIds = activeNotifications.map(n => n.id);
    const next = Array.from(new Set([...clearedIds, ...allIds]));
    setClearedIds(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_cleared_notifications', JSON.stringify(next));
    }
  };

  const getCategoryIcon = (category: SystemNotification['category']) => {
    switch (category) {
      case 'travel':
        return <Bus size={15} className="text-cyan-400" />;
      case 'task':
        return <CheckSquare size={15} className="text-emerald-400" />;
      case 'finance':
        return <Wallet size={15} className="text-amber-400" />;
      case 'academic':
        return <Calendar size={15} className="text-violet-400" />;
      default:
        return <Bell size={15} className="text-cyan-400" />;
    }
  };

  const unreadCount = activeNotifications.filter(n => !n.read).length;

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4 bg-black/75 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="w-full max-w-md bg-neutral-900/80 backdrop-blur-2xl border-t sm:border border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10 rounded-t-[32px] sm:rounded-3xl p-5 flex flex-col gap-4 text-white max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grabber para iOS Sheet */}
            <div className="w-12 h-1.5 bg-neutral-700/60 rounded-full mx-auto sm:hidden" />

            {/* Header del Inbox */}
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                  <Bell size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                    Bandeja de Avisos
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-neutral-400 font-medium">LifeOS Notification Hub</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-semibold text-neutral-400 hover:text-cyan-400 px-2.5 py-1 rounded-lg hover:bg-neutral-800/50 transition-colors flex items-center gap-1"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck size={14} />
                    <span>Leídas</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-700 transition-all flex items-center justify-center active:scale-95"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Lista de Notificaciones Dinámicas Reales */}
            <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-neutral-800/80 pr-1 hide-scrollbar">
              {activeNotifications.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center text-neutral-500 gap-2">
                  <CheckCircle2 size={32} className="text-emerald-500/50" />
                  <p className="text-xs font-semibold text-neutral-300">Todo al día</p>
                  <p className="text-[11px] text-neutral-500">No hay notificaciones nuevas</p>
                </div>
              ) : (
                activeNotifications.map((notif) => {
                  const content = (
                    <div 
                      key={notif.id}
                      onClick={() => {
                        handleMarkAsRead(notif.id);
                        if (notif.link) onClose();
                      }}
                      className={`py-3.5 px-2 flex items-start gap-3 transition-colors rounded-2xl cursor-pointer ${
                        notif.read ? 'hover:bg-neutral-800/30 opacity-70' : 'bg-neutral-950/40 hover:bg-neutral-800/50'
                      }`}
                    >
                      {/* Icono de categoría */}
                      <div className="w-8 h-8 rounded-xl bg-neutral-800/80 flex items-center justify-center shrink-0 mt-0.5 border border-neutral-700/50">
                        {getCategoryIcon(notif.category)}
                      </div>

                      {/* Info de la Notificación */}
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-bold truncate leading-tight ${notif.read ? 'text-neutral-300' : 'text-white'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                            {notif.time}
                          </span>
                        </div>

                        <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                          {notif.description}
                        </p>
                      </div>

                      {/* Punto cyan indicador de no leído */}
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                      )}
                    </div>
                  );

                  return notif.link ? (
                    <Link key={notif.id} href={notif.link} className="block">
                      {content}
                    </Link>
                  ) : (
                    content
                  );
                })
              )}
            </div>

            {/* Footer con opción de limpiar */}
            {activeNotifications.length > 0 && (
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg"
                >
                  <Trash2 size={13} />
                  <span>Vaciar bandeja</span>
                </button>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {activeNotifications.length} {activeNotifications.length === 1 ? 'aviso' : 'avisos'}
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
