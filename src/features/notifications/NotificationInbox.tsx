"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, CheckCheck, Trash2, Bus, 
  CheckSquare, Wallet, Calendar, AlertCircle, Sparkles, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: 'travel' | 'task' | 'finance' | 'academic' | 'system';
  link?: string;
}

const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Próxima Salida de Colectivo',
    description: 'Tu colectivo hacia Córdoba sale a las 07:10 hs desde Despeñaderos.',
    time: 'Hace 15 min',
    read: false,
    category: 'travel',
    link: '/viajes'
  },
  {
    id: 'notif-2',
    title: 'Tarea en Curso',
    description: 'Tenés pendiente completar la revisión del proyecto final.',
    time: 'Hace 1 hora',
    read: false,
    category: 'task',
    link: '/kanban'
  },
  {
    id: 'notif-3',
    title: 'Presupuesto Semanal',
    description: 'Se ha registrado el balance y límite de gastos para la semana.',
    time: 'Hoy, 09:30',
    read: true,
    category: 'finance',
    link: '/finanzas'
  },
  {
    id: 'notif-4',
    title: 'Cursado de Hoy',
    description: 'Física II en Aula 320 a las 11:20 hs.',
    time: 'Hoy, 08:00',
    read: true,
    category: 'academic',
    link: '/viajes#seccion-cursado'
  }
];

interface NotificationInboxProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationInbox({ isOpen, onClose, onUnreadCountChange }: NotificationInboxProps) {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lifeos_notifications');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNotifications(parsed);
          updateUnreadCount(parsed);
          return;
        } catch (e) {}
      }
      setNotifications(DEFAULT_NOTIFICATIONS);
      updateUnreadCount(DEFAULT_NOTIFICATIONS);
      localStorage.setItem('lifeos_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
  }, []);

  const updateUnreadCount = (list: SystemNotification[]) => {
    const unread = list.filter(n => !n.read).length;
    if (onUnreadCountChange) {
      onUnreadCountChange(unread);
    }
  };

  const saveNotifications = (updated: SystemNotification[]) => {
    setNotifications(updated);
    updateUnreadCount(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifeos_notifications', JSON.stringify(updated));
    }
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const handleClearAll = () => {
    saveNotifications([]);
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

  const unreadCount = notifications.filter(n => !n.read).length;

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
            className="w-full max-w-md bg-neutral-900/70 backdrop-blur-2xl border-t sm:border border-neutral-800 shadow-[0_0_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10 rounded-t-[32px] sm:rounded-3xl p-5 flex flex-col gap-4 text-white max-h-[85vh] overflow-hidden"
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

            {/* Lista de Notificaciones */}
            <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-neutral-800/80 pr-1 hide-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center text-neutral-500 gap-2">
                  <Bell size={32} className="opacity-30" />
                  <p className="text-xs font-medium">No hay notificaciones pendientes</p>
                </div>
              ) : (
                notifications.map((notif) => {
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

                      {/* Punto azul/esmeralda indicador de no leído */}
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
            {notifications.length > 0 && (
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg"
                >
                  <Trash2 size={13} />
                  <span>Vaciar bandeja</span>
                </button>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {notifications.length} {notifications.length === 1 ? 'aviso' : 'avisos'}
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
