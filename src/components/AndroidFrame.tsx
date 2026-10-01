import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Sparkles, User, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';
import { UserProfile, ScreenTab } from '../types';
import { playHapticSound } from '../utils/haptics';

interface AndroidFrameProps {
  children: React.ReactNode;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onToggleSound: () => void;
  currentTab: ScreenTab;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  userProfile,
  onOpenProfile,
  onToggleSound,
}) => {
  // Live system clock for status bar
  const [currentTime, setCurrentTime] = useState<string>('08:00');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col items-center justify-center p-0 md:p-4 text-slate-100 font-sans">
      {/* Top Device Viewport Switcher (Desktop controls) */}
      <header className="hidden md:flex items-center justify-between w-full max-w-md mb-2 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-semibold">Huella Diaria</span>
          <span className="text-slate-500">• Android Edition</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-full p-0.5">
          <button
            onClick={() => {
              setIsPhoneFrame(true);
              if (userProfile.soundEnabled) playHapticSound('toggle');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              isPhoneFrame
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Vista de Dispositivo Android"
          >
            <Smartphone size={13} />
            <span>Móvil</span>
          </button>
          <button
            onClick={() => {
              setIsPhoneFrame(false);
              if (userProfile.soundEnabled) playHapticSound('toggle');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              !isPhoneFrame
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Pantalla Completa"
          >
            <Monitor size={13} />
            <span>Expandido</span>
          </button>
        </div>
      </header>

      {/* Main Container / Android Device Mockup */}
      <div
        className={`w-full transition-all duration-300 flex flex-col overflow-hidden bg-slate-950 relative ${
          isPhoneFrame
            ? 'max-w-[430px] h-[92vh] max-h-[890px] rounded-[44px] border-[8px] border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.15)] ring-1 ring-slate-700/60'
            : 'max-w-2xl min-h-screen md:min-h-[90vh] md:rounded-3xl border-0 md:border md:border-slate-800 shadow-2xl'
        }`}
      >
        {/* Android Status Bar */}
        <div className="h-10 px-6 flex items-center justify-between text-xs text-slate-300 bg-slate-950/80 backdrop-blur-md select-none shrink-0 z-40 border-b border-slate-900/50">
          <div className="flex items-center gap-1.5 font-semibold tracking-wide text-[12px]">
            <span>{currentTime}</span>
          </div>

          {/* Android Punch Hole Camera */}
          <div className="w-4 h-4 rounded-full bg-slate-950 border-[1.5px] border-slate-800 flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-950/60" />
          </div>

          {/* Android Status Icons */}
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider">5G</span>
            <Wifi size={14} className="text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-medium">89%</span>
              <Battery size={14} className="text-emerald-400 fill-emerald-400/30" />
            </div>
          </div>
        </div>

        {/* Top App Header */}
        <header className="px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-950">
              <span className="text-base leading-none">🌱</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                  HUELLA DIARIA
                </h1>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {userProfile.role === 'estudiante' ? 'Estudiante' : 'Trabajador'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
                {userProfile.institutionOrCompany}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                if (userProfile.soundEnabled) playHapticSound('toggle');
                onToggleSound();
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title={userProfile.soundEnabled ? 'Silenciar sonidos hápticos' : 'Activar sonidos hápticos'}
            >
              {userProfile.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-slate-500" />}
            </button>

            {/* User Profile Button */}
            <button
              onClick={() => {
                if (userProfile.soundEnabled) playHapticSound('tap');
                onOpenProfile();
              }}
              className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700 text-xs transition-colors"
              title="Ajustes de Perfil"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                {userProfile.name.charAt(0)}
              </div>
              <span className="text-[11px] font-medium text-slate-200 max-w-[65px] truncate">
                {userProfile.name.split(' ')[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Scrollable Viewport Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent flex flex-col">
          {children}
        </main>

        {/* Android Gesture Bar at bottom */}
        <div className="h-4 bg-slate-900/95 flex items-center justify-center shrink-0 z-30 pb-1">
          <div className="w-32 h-1 rounded-full bg-slate-600/70" />
        </div>
      </div>
    </div>
  );
};
