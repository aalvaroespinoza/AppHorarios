"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Clock, Settings, Sunrise, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomTabBar() {
  const pathname = usePathname();

  // Para simular el estado activo si no estamos usando el router real de Next.js
  // (Aunque lo ideal es usar usePathname)
  const [activeTab, setActiveTab] = useState(pathname || '/');

  const tabs = [
    { id: '/', label: 'Hoy', icon: Home },
    { id: '/manana', label: 'Mañana', icon: Sunrise },
    { id: '/horarios', label: 'Horarios', icon: Clock },
    { id: '/configuracion', label: 'Ajustes', icon: Settings },
  ];

  return (
    <motion.nav 
      initial={{ y: "100%" }} 
      animate={{ y: 0 }} 
      transition={{ type: "spring", bounce: 0, duration: 0.6 }}
      className="fixed bottom-0 w-full z-50 backdrop-blur-xl bg-black/70 border-t border-zinc-800 pb-safe pt-2 px-4"
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.id || activeTab === tab.id;
          
          return (
            <Link 
              key={tab.id} 
              href={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center w-16 h-12"
            >
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2}
                className={`mb-1 transition-colors duration-200 ${
                  isActive ? 'text-blue-500' : 'text-zinc-500'
                }`}
              />
              <span 
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-blue-500' : 'text-zinc-500'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Spacer para dispositivos con Home Indicator (notch inferior) en iOS */}
      <div className="h-6 w-full sm:hidden"></div>
    </motion.nav>
  );
}
