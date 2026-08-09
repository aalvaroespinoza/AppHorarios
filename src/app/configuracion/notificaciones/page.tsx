'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NativeCard from '@/core/components/ui/NativeCard';
import { Bell, ChevronLeft, Bus, BookOpen, Clock, Settings, ShieldAlert } from 'lucide-react';
import { notificationService } from '@/core/services/notifications/notification.service';
import { oneSignalService } from '@/core/services/notifications/onesignal.service';
import { NotificationPreferences } from '@/core/services/notifications/notification.types';

export default function NotificacionesConfig() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    travel: true,
    schedule: true,
    reminder: true,
    system: true,
  });

  useEffect(() => {
    setIsMounted(true);
    
    // Check OneSignal permission status
    oneSignalService.initialize().then(() => {
      setIsInitializing(false);
      oneSignalService.getPermissionStatus().then(status => {
        setPermissionsGranted(status);
        if (status) setStatusMessage('Permiso ya concedido');
      });
    }).catch(() => {
      setIsInitializing(false);
      setStatusMessage('OneSignal no pudo inicializarse');
    });

    // Load preferences
    notificationService.getPreferences().then(prefs => {
      setPreferences(prefs);
    });
  }, []);

  const handleTogglePermission = async () => {
    if (isInitializing) {
      setStatusMessage('Aguardá, OneSignal todavía está inicializando...');
      return;
    }

    if (!permissionsGranted) {
      try {
        setStatusMessage('Solicitando permisos...');
        const granted = await oneSignalService.requestPermission();
        if (granted) {
          setPermissionsGranted(true);
          setStatusMessage('¡Permiso concedido!');
        } else {
          setStatusMessage('Permiso rechazado o no soportado por el navegador/PWA.');
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setStatusMessage(error.message);
        } else {
          setStatusMessage('La solicitud de permiso falló.');
        }
      }
    } else {
      alert("Para desactivar completamente las notificaciones, debés hacerlo desde los permisos de tu navegador.");
    }
  };

  const handleTogglePref = async (key: keyof NotificationPreferences) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    await notificationService.updatePreferences(newPrefs);
  };

  if (!isMounted) return <div className="min-h-[100dvh] bg-black" />;

  return (
    <main className="min-h-[100dvh] bg-zinc-950 text-white font-sans max-w-md mx-auto pb-10">
      <header className="bg-zinc-950/90 backdrop-blur-md pt-12 pb-4 px-2 sticky top-0 z-10 flex items-center gap-2">
        <button 
          onClick={() => router.back()}
          className="text-blue-500 p-2 flex items-center gap-1 active:opacity-50"
        >
          <ChevronLeft size={28} className="-ml-2" />
          <span className="text-lg -ml-1">Volver</span>
        </button>
      </header>
      
      <div className="px-4">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-6 pl-2">Notificaciones</h1>

        {/* SECCIÓN 1: Estado General */}
        <section className="mb-6">
          <NativeCard className="p-0 overflow-hidden bg-zinc-900 border-none divide-y divide-zinc-800">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`${permissionsGranted ? 'bg-green-500' : 'bg-red-500'} p-2 rounded-[10px] text-white`}>
                  <Bell size={24} fill="currentColor" />
                </div>
                <div>
                  <h2 className="font-medium text-lg">Estado de Push</h2>
                  <p className="text-sm text-zinc-400">
                    {permissionsGranted ? 'Notificaciones activadas' : 'Notificaciones desactivadas'}
                  </p>
                </div>
              </div>
              
              {!permissionsGranted && (
                <button
                  onClick={handleTogglePermission}
                  disabled={isInitializing}
                  className={`mt-4 w-full font-medium py-2.5 rounded-xl transition-colors ${isInitializing ? 'bg-zinc-700 text-zinc-400' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                >
                  {isInitializing ? 'Inicializando...' : 'Activar notificaciones'}
                </button>
              )}
              {statusMessage && (
                <p className="mt-3 text-sm text-blue-400 text-center">{statusMessage}</p>
              )}
            </div>
          </NativeCard>
          <p className="text-xs text-zinc-500 mt-3 px-2">
            AppHorarios usa notificaciones para avisarte cuando tenés que salir para tomar el colectivo, recordatorios y más.
          </p>
        </section>

        {/* SECCIÓN 2: Preferencias */}
        <section className="mb-6">
          <h2 className="text-[13px] uppercase text-zinc-500 font-medium tracking-wide mb-2 ml-4">Preferencias</h2>
          <NativeCard className="p-0 overflow-hidden bg-zinc-900 border-none divide-y divide-zinc-800">
            
            {/* Viajes */}
            <div className="flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-1.5 rounded-[10px] text-white">
                  <Bus size={18} fill="currentColor" />
                </div>
                <div>
                  <span className="font-medium text-[16px] text-white block">Viajes</span>
                  <span className="text-[12px] text-zinc-400">Avisos de colectivos</span>
                </div>
              </div>
              <div 
                onClick={() => handleTogglePref('travel')}
                className={`w-12 h-7 rounded-full p-0.5 cursor-pointer transition-colors ${preferences.travel ? 'bg-green-500' : 'bg-zinc-700'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${preferences.travel ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Agenda */}
            <div className="flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-1.5 rounded-[10px] text-white">
                  <BookOpen size={18} fill="currentColor" />
                </div>
                <div>
                  <span className="font-medium text-[16px] text-white block">Agenda</span>
                  <span className="text-[12px] text-zinc-400">Cambios de clase y exámenes</span>
                </div>
              </div>
              <div 
                onClick={() => handleTogglePref('schedule')}
                className={`w-12 h-7 rounded-full p-0.5 cursor-pointer transition-colors ${preferences.schedule ? 'bg-green-500' : 'bg-zinc-700'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${preferences.schedule ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Recordatorios */}
            <div className="flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500 p-1.5 rounded-[10px] text-white">
                  <Clock size={18} fill="currentColor" />
                </div>
                <div>
                  <span className="font-medium text-[16px] text-white block">Recordatorios</span>
                  <span className="text-[12px] text-zinc-400">Avisos programados en LiveOS</span>
                </div>
              </div>
              <div 
                onClick={() => handleTogglePref('reminder')}
                className={`w-12 h-7 rounded-full p-0.5 cursor-pointer transition-colors ${preferences.reminder ? 'bg-green-500' : 'bg-zinc-700'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${preferences.reminder ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Sistema */}
            <div className="flex items-center justify-between p-3 active:bg-zinc-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-zinc-600 p-1.5 rounded-[10px] text-white">
                  <Settings size={18} fill="currentColor" />
                </div>
                <div>
                  <span className="font-medium text-[16px] text-white block">Sistema</span>
                  <span className="text-[12px] text-zinc-400">Actualizaciones importantes</span>
                </div>
              </div>
              <div 
                onClick={() => handleTogglePref('system')}
                className={`w-12 h-7 rounded-full p-0.5 cursor-pointer transition-colors ${preferences.system ? 'bg-green-500' : 'bg-zinc-700'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${preferences.system ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>

          </NativeCard>
        </section>

      </div>
    </main>
  );
}
