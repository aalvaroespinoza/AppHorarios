"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Clock, Settings, Map } from "lucide-react";

export function BottomTabBar() {
  const pathname = usePathname();

  const tabs = [
    { name: "Hoy", href: "/", icon: Clock },
    { name: "Mañana", href: "/manana", icon: Calendar },
    { name: "Horarios", href: "/horarios", icon: Map },
    { name: "Configuración", href: "/configuracion", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe pb-8 backdrop-blur-xl bg-zinc-900/70 border-t border-zinc-800">
      <ul className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          // Comprobar que empiece con la ruta, excepto para '/' donde debe ser exacto
          const isActive = tab.href === '/' ? pathname === '/' : pathname?.startsWith(tab.href);

          return (
            <li key={tab.name} className="flex-1">
              <Link
                href={tab.href}
                className="flex flex-col items-center justify-center w-full h-full gap-1"
              >
                <Icon
                  size={24}
                  className={`transition-colors duration-200 ${
                    isActive ? "text-blue-500" : "text-zinc-500"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? "text-blue-500" : "text-zinc-500"
                  }`}
                >
                  {tab.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
