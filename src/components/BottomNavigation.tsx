import React from 'react';
import { Compass, Wallet, Leaf } from 'lucide-react';
import { ScreenTab, AppTheme } from '../types';
import { playHapticSound } from '../utils/haptics';

interface BottomNavigationProps {
  currentTab: ScreenTab;
  onTabChange: (tab: ScreenTab) => void;
  tripsTodayCount: number;
  expensesTodayAmount: number;
  currency: string;
  soundEnabled: boolean;
  theme?: AppTheme;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
  tripsTodayCount,
  expensesTodayAmount,
  currency,
  soundEnabled,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

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
      badgeColor: 'bg-[#2ECC71] text-slate-950 font-bold',
      desc: 'Trayectos del día',
    },
    {
      id: 'gastos' as ScreenTab,
      label: 'Gastos',
      icon: Wallet,
      badge: expensesTodayAmount > 0 ? `${currency}${expensesTodayAmount.toFixed(0)}` : undefined,
      badgeColor: 'bg-amber-400 text-slate-950 font-bold',
      desc: 'Pasajes y gasolina',
    },
    {
      id: 'impacto' as ScreenTab,
      label: 'Mi Impacto',
      icon: Leaf,
      badge: 'Eco',
      badgeColor: 'bg-[#2ECC71]/30 text-[#2ECC71] border border-[#2ECC71]/40 font-bold',
      desc: 'Tiempo y CO2',
    },
  ];

  return (
    <nav 
      aria-label="Navegación principal Android Jetpack Compose" 
      className={`border-t px-3 pt-2 pb-2 shrink-0 z-30 transition-all select-none backdrop-blur-md ${
        isDark 
          ? 'bg-[#2C3E50]/95 border-slate-700/80 text-white' 
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-md'
      }`}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTabClick(item.id);
              }}
              className="relative flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-2xl transition-all duration-200 group active:scale-95 focus:outline-none cursor-pointer"
            >
              {/* Jetpack Compose / Material 3 active pill background */}
              <div
                className={`relative flex items-center justify-center px-5 py-1 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-[#2ECC71]/25 text-[#2ECC71] scale-105 shadow-sm shadow-[#2ECC71]/20'
                    : isDark 
                    ? 'text-slate-400 hover:text-slate-200' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 text-[#2ECC71]' : 'group-hover:scale-105'
                  }`}
                />

                {/* Badge if available */}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full shadow-sm animate-in fade-in zoom-in ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-1 font-medium tracking-tight transition-colors duration-200 ${
                  isActive 
                    ? 'text-[#2ECC71] font-bold' 
                    : isDark 
                    ? 'text-slate-400 group-hover:text-slate-200' 
                    : 'text-slate-600 group-hover:text-slate-900'
                }`}
              >
                {item.label}
              </span>

              {/* Material You subtle bottom indicator line */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
