import React from 'react';
import { Compass, Wallet, Leaf } from 'lucide-react';
import { ScreenTab } from '../types';
import { playHapticSound } from '../utils/haptics';

interface BottomNavigationProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  tripsTodayCount: number;
  expensesTodayAmount: number;
  currency: string;
  soundEnabled: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  tripsTodayCount,
  expensesTodayAmount,
  currency,
  soundEnabled,
}) => {
  const handleTabClick = (tab: ScreenTab) => {
    if (soundEnabled) {
      playHapticSound('tap');
    }
    onTabChange(tab);
  };

  const navItems = [
    {
      id: 'inicio' as ScreenTab,
      label: 'Inicio',
      icon: Compass,
      badge: tripsTodayCount > 0 ? `${tripsTodayCount}` : undefined,
      badgeColor: 'bg-emerald-500 text-white',
      desc: 'Trayectos del día',
    },
    {
      id: 'gastos' as ScreenTab,
      label: 'Gastos',
      icon: Wallet,
      badge: expensesTodayAmount > 0 ? `${currency}${expensesTodayAmount.toFixed(0)}` : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
      desc: 'Pasajes y gasolina',
    },
    {
      id: 'impacto' as ScreenTab,
      label: 'Mi Impacto',
      icon: Leaf,
      badge: 'Eco',
      badgeColor: 'bg-emerald-600/80 text-emerald-100',
      desc: 'Tiempo y CO2',
    },
  ];

  return (
    <nav 
      aria-label="Navegación principal Android" 
      className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-3 pt-2 pb-2 shrink-0 z-30 transition-all select-none"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-2xl transition-all duration-200 group active:scale-95 focus:outline-none`}
            >
              {/* Material 3 active pill background */}
              <div
                className={`relative flex items-center justify-center px-5 py-1 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400 scale-105 shadow-sm shadow-emerald-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 text-emerald-400' : 'text-slate-400 group-hover:scale-105'
                  }`}
                />

                {/* Badge if available */}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full font-semibold border border-slate-900 shadow-sm animate-in fade-in zoom-in ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-1 font-medium tracking-tight transition-colors duration-200 ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {item.label}
              </span>

              {/* Material You subtle bottom indicator line */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
