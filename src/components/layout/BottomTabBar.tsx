"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomTabBar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname || '/');

  useEffect(() => {
    setActiveTab(pathname || '/');
  }, [pathname]);

  const tabs = [
    { id: '/', label: 'Viaje', icon: Home },
    { id: '/academia', label: 'Agenda', icon: BookOpen },
    { id: '/finanzas', label: 'Finanzas', icon: Wallet },
  ];

  return (
    <motion.nav 
      initial={{ y: "100%" }} 
      animate={{ y: 0 }} 
      transition={{ type: "spring", bounce: 0, duration: 0.6 }}
      className="fixed bottom-0 w-full z-50 backdrop-blur-xl bg-black/80 border-t border-zinc-800/80 pb-safe pt-2 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Link 
              key={tab.id} 
              href={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="relative flex flex-col items-center justify-center w-20 h-14"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="flex flex-col items-center"
              >
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`mb-1 transition-colors duration-300 ${
                    isActive ? 'text-blue-500' : 'text-zinc-500'
                  }`}
                />
                <span 
                  className={`text-[10px] font-semibold tracking-wide transition-colors duration-300 ${
                    isActive ? 'text-blue-500' : 'text-zinc-500'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
      {/* Spacer para dispositivos con Home Indicator (notch inferior) en iOS */}
      <div className="h-6 w-full sm:hidden"></div>
    </motion.nav>
  );
}
