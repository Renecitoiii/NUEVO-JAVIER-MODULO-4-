import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Sparkles, 
  User, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor, 
  LogOut, 
  GraduationCap, 
  Briefcase,
  Sun,
  Moon,
  Database
} from 'lucide-react';
import { UserProfile, ScreenTab, AppTheme } from '../types';
import { playHapticSound } from '../utils/haptics';

interface AndroidFrameProps {
  children: React.ReactNode;
  userProfile: UserProfile;
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onOpenRoomInspector?: () => void;
  onOpenProfile: () => void;
  onToggleSound: () => void;
  onLogout?: () => void;
  currentTab: ScreenTab;
  bottomBar?: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  userProfile,
  theme = 'dark',
  onToggleTheme,
  onOpenRoomInspector,
  onOpenProfile,
  onToggleSound,
  onLogout,
  bottomBar,
}) => {
  // Live system clock for status bar
  const [currentTime, setCurrentTime] = useState<string>('08:00');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  const isDark = theme === 'dark';

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
    <div className={`min-h-screen flex flex-col items-center justify-center p-0 md:p-4 font-sans transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-[#1A252F] via-[#2C3E50] to-[#121A21] text-slate-100' 
        : 'bg-gradient-to-br from-slate-100 via-emerald-50/50 to-slate-200 text-slate-900'
    }`}>
      {/* Top Device Viewport Switcher & Inspector (Desktop controls) */}
      <header className="hidden md:flex items-center justify-between w-full max-w-md mb-2 px-2 text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-ping" />
          <span className="text-[#2ECC71] font-bold">Huella Diaria</span>
          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>• Jetpack Compose & Room</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Room Inspector trigger button */}
          {onOpenRoomInspector && (
            <button
              onClick={() => {
                if (userProfile.soundEnabled) playHapticSound('tap');
                onOpenRoomInspector();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#2C3E50] text-[#2ECC71] border border-[#2ECC71]/40 hover:bg-[#243342] shadow-sm transition-all"
              title="Abrir Room Database & Jetpack Compose Inspector"
            >
              <Database size={12} />
              <span>Room DB</span>
            </button>
          )}

          {/* Device frame toggle */}
          <div className={`flex items-center gap-0.5 rounded-full p-0.5 border ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
          }`}>
            <button
              onClick={() => {
                setIsPhoneFrame(true);
                if (userProfile.soundEnabled) playHapticSound('toggle');
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                isPhoneFrame
                  ? 'bg-[#2ECC71] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vista Móvil"
            >
              <Smartphone size={12} />
              <span>Móvil</span>
            </button>
            <button
              onClick={() => {
                setIsPhoneFrame(false);
                if (userProfile.soundEnabled) playHapticSound('toggle');
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                !isPhoneFrame
                  ? 'bg-[#2ECC71] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Pantalla Completa"
            >
              <Monitor size={12} />
              <span>Expandido</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container / Android Device Mockup */}
      <div
        className={`w-full transition-all duration-300 flex flex-col overflow-hidden relative ${
          isDark ? 'bg-[#1A252F] text-slate-100' : 'bg-slate-50 text-slate-900'
        } ${
          isPhoneFrame
            ? `max-w-[430px] h-[92vh] max-h-[890px] rounded-[44px] border-[8px] ${
                isDark ? 'border-[#2C3E50]' : 'border-slate-800'
              } shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(46,204,113,0.15)] ring-1 ${
                isDark ? 'ring-slate-700/60' : 'ring-slate-300'
              }`
            : `max-w-2xl min-h-screen md:min-h-[90vh] md:rounded-3xl border-0 md:border ${
                isDark ? 'md:border-[#2C3E50]' : 'md:border-slate-300'
              } shadow-2xl`
        }`}
      >
        {/* Android Status Bar */}
        <div className={`h-10 px-6 flex items-center justify-between text-xs backdrop-blur-md select-none shrink-0 z-40 border-b ${
          isDark 
            ? 'bg-[#1A252F]/90 text-slate-300 border-slate-800/80' 
            : 'bg-white/90 text-slate-700 border-slate-200'
        }`}>
          <div className="flex items-center gap-1.5 font-semibold tracking-wide text-[12px]">
            <span>{currentTime}</span>
          </div>

          {/* Android Punch Hole Camera */}
          <div className="w-4 h-4 rounded-full bg-slate-950 border-[1.5px] border-slate-800 flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71]/60" />
          </div>

          {/* Android Status Icons */}
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[10px] font-bold text-[#2ECC71] tracking-wider">5G</span>
            <Wifi size={14} className={isDark ? 'text-slate-300' : 'text-slate-600'} />
            <div className="flex items-center gap-0.5">
              <span className={`text-[10px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>89%</span>
              <Battery size={14} className="text-[#2ECC71] fill-[#2ECC71]/30" />
            </div>
          </div>
        </div>

        {/* Top App Header */}
        <header className={`px-3.5 py-2.5 backdrop-blur-md border-b flex items-center justify-between shrink-0 z-30 transition-colors ${
          isDark 
            ? 'bg-[#2C3E50]/95 border-slate-700/80 text-white' 
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2ECC71] to-[#27ae60] flex items-center justify-center shadow-md shadow-emerald-950/40">
              <span className="text-base leading-none">🌱</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-xs tracking-tight leading-tight">
                  HUELLA DIARIA
                </h1>
                <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-bold tracking-wider flex items-center gap-1 border ${
                  userProfile.role === 'estudiante'
                    ? 'bg-[#2ECC71]/20 text-[#2ECC71] border-[#2ECC71]/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}>
                  {userProfile.role === 'estudiante' ? <GraduationCap size={10} /> : <Briefcase size={10} />}
                  <span>{userProfile.role === 'estudiante' ? 'Estudiante' : 'Trabajador'}</span>
                </span>
              </div>
              <p className={`text-[10px] truncate max-w-[140px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {userProfile.institutionOrCompany}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme Toggle (Light / Dark Mode) */}
            {onToggleTheme && (
              <button
                onClick={() => {
                  if (userProfile.soundEnabled) playHapticSound('toggle');
                  onToggleTheme();
                }}
                className={`p-1.5 rounded-full transition-colors ${
                  isDark ? 'text-amber-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            )}

            {/* Room Inspector Quick Button */}
            {onOpenRoomInspector && (
              <button
                onClick={() => {
                  if (userProfile.soundEnabled) playHapticSound('tap');
                  onOpenRoomInspector();
                }}
                className={`p-1.5 rounded-full transition-colors ${
                  isDark ? 'text-[#2ECC71] hover:bg-slate-700' : 'text-[#27ae60] hover:bg-slate-100'
                }`}
                title="Room Database & DAO Inspector"
              >
                <Database size={15} />
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={() => {
                if (userProfile.soundEnabled) playHapticSound('toggle');
                onToggleSound();
              }}
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title={userProfile.soundEnabled ? 'Silenciar sonidos hápticos' : 'Activar sonidos hápticos'}
            >
              {userProfile.soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} className="text-slate-400" />}
            </button>

            {/* User Profile Button */}
            <button
              onClick={() => {
                if (userProfile.soundEnabled) playHapticSound('tap');
                onOpenProfile();
              }}
              className={`flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full border text-xs transition-colors ${
                isDark ? 'bg-slate-800/90 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
              title="Ajustes de Perfil"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                userProfile.role === 'estudiante'
                  ? 'bg-[#2ECC71]/30 text-[#2ECC71]'
                  : 'bg-blue-500/30 text-blue-400'
              }`}>
                {userProfile.name.charAt(0)}
              </div>
              <span className="text-[11px] font-medium max-w-[55px] truncate">
                {userProfile.name.split(' ')[0]}
              </span>
            </button>

            {/* Logout / Switch User Button */}
            {onLogout && (
              <button
                onClick={() => {
                  if (userProfile.soundEnabled) playHapticSound('toggle');
                  onLogout();
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-amber-400 transition-colors"
                title="Cambiar de usuario o Cerrar sesión"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Viewport Content */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin flex flex-col relative ${
          isDark 
            ? 'bg-[#1A252F] scrollbar-thumb-slate-800 scrollbar-track-transparent' 
            : 'bg-slate-50 scrollbar-thumb-slate-300 scrollbar-track-transparent text-slate-900'
        }`}>
          {children}
        </main>

        {/* Fixed Bottom Navigation Bar (Android Material 3 Scaffold) */}
        {bottomBar && (
          <div className="shrink-0 z-30">
            {bottomBar}
          </div>
        )}

        {/* Android Gesture Bar at bottom */}
        <div className={`h-4 flex items-center justify-center shrink-0 z-30 pb-1 ${
          isDark ? 'bg-[#2C3E50]/95' : 'bg-white'
        }`}>
          <div className="w-32 h-1 rounded-full bg-slate-500/60" />
        </div>
      </div>
    </div>
  );
};

