"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, Sparkles, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavigationTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const defaultTabs: NavigationTab[] = [
  { id: '/', label: 'Viaje', icon: Home },
  { id: '/academia', label: 'Agenda', icon: BookOpen },
  { id: '/lifeos', label: 'LifeOS', icon: Sparkles },
];

export interface BottomTabBarProps {
  /** 
   * Lista de módulos que se mostrarán en la barra de navegación. 
   * Preparado para inyectar nuevos módulos dinámicamente en el futuro de LifeOS.
   */
  tabs?: NavigationTab[];
}

interface TabItemProps {
  tab: NavigationTab;
  isActive: boolean;
  onClick: (id: string) => void;
}

const TabItem: React.FC<TabItemProps> = ({ tab, isActive, onClick }) => {
  const Icon = tab.icon;
  
  return (
    <Link 
      href={tab.id}
      onClick={() => onClick(tab.id)}
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
};

export default function BottomTabBar({ tabs = defaultTabs }: BottomTabBarProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname || '/');

  useEffect(() => {
    setActiveTab(pathname || '/');
  }, [pathname]);

  return (
    <motion.nav 
      initial={{ y: "100%" }} 
      animate={{ y: 0 }} 
      transition={{ type: "spring", bounce: 0, duration: 0.6 }}
      className="fixed bottom-0 w-full z-50 backdrop-blur-xl bg-black/80 border-t border-zinc-800/80 pt-2 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => (
          <TabItem 
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={(id) => {
              setActiveTab(id);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ))}
      </div>
    </motion.nav>
  );
}
