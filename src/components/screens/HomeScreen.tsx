import React, { useState } from 'react';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Route, 
  Trash2, 
  Copy, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Award,
  Zap,
  Star
} from 'lucide-react';
import { Trip, UserProfile, TransportMode, WaterLog, AppTheme } from '../../types';
import { TRANSPORT_MODES, calculateTripCO2 } from '../../utils/transportUtils';
import { TransportIcon } from '../TransportIcon';
import { playHapticSound } from '../../utils/haptics';
import { HydrationWidget } from '../HydrationWidget';

interface HomeScreenProps {
  trips: Trip[];
  userProfile: UserProfile;
  waterLogs: WaterLog[];
  selectedDate: string;
  theme?: AppTheme;
  onSelectDate: (date: string) => void;
  onOpenNewTripModal: () => void;
  onDeleteTrip: (id: string) => void;
  onDuplicateTrip: (trip: Trip) => void;
  onQuickLog: (mode: TransportMode, origin: string, dest: string, km: number, min: number, cost: number) => void;
  onAddWater: (amountMl: number, context?: 'durante_viaje' | 'antes_viaje' | 'llegada' | 'rutina', note?: string) => void;
  onDeleteWater: (id: string) => void;
  expensesTodayTotal: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  trips,
  userProfile,
  waterLogs,
  selectedDate,
  theme = 'dark',
  onSelectDate,
  onOpenNewTripModal,
  onDeleteTrip,
  onDuplicateTrip,
  onQuickLog,
  onAddWater,
  onDeleteWater,
  expensesTodayTotal,
}) => {
  const isDark = theme === 'dark';
  const [quickSavedFeedback, setQuickSavedFeedback] = useState<string | null>(null);
  
  // Fast commute displacement tracker form state
  const [showFastTracker, setShowFastTracker] = useState<boolean>(false);
  const [fastOrigin, setFastOrigin] = useState<string>('');
  const [fastDest, setFastDest] = useState<string>('');
  const [fastMode, setFastMode] = useState<TransportMode>('metro');
  const [fastDuration, setFastDuration] = useState<number>(25);

  // Speed estimation (km per min) for automatic distance calculation
  const speedPerMin: Record<TransportMode, number> = {
    metro: 0.5,       // 30 km/h
    bus: 0.35,        // 21 km/h
    car: 0.6,         // 36 km/h
    motorcycle: 0.6,  // 36 km/h
    bicycle: 0.28,    // 17 km/h
    walking: 0.08,    // 4.8 km/h
    scooter: 0.25,    // 15 km/h
    taxi: 0.55        // 33 km/h
  };

  const estimatedFastKm = Number((fastDuration * (speedPerMin[fastMode] || 0.4)).toFixed(1));
  const { co2Kg: fastCO2, co2SavedKg: fastSavedCO2 } = calculateTripCO2(fastMode, estimatedFastKm);

  const handleSaveFastDisplacement = (e: React.FormEvent) => {
    e.preventDefault();
    const origin = fastOrigin.trim() || (userProfile.role === 'estudiante' ? 'Casa' : 'Hogar');
    const dest = fastDest.trim() || (userProfile.role === 'estudiante' ? 'Universidad' : 'Oficina');
    const cost = fastMode === 'metro' ? 1.25 : fastMode === 'bus' ? 1.50 : fastMode === 'car' ? 3.50 : 0;

    onQuickLog(fastMode, origin, dest, estimatedFastKm, fastDuration, cost);
    setQuickSavedFeedback(`¡Trayecto ${origin} ➔ ${dest} (${fastDuration} min) guardado!`);
    setTimeout(() => setQuickSavedFeedback(null), 3000);
    setFastOrigin('');
    setFastDest('');
    setShowFastTracker(false);
  };

  // Filter trips for selected date
  const filteredTrips = trips.filter((t) => t.date === selectedDate);

  // Daily statistics
  const totalKm = filteredTrips.reduce((acc, t) => acc + t.distanceKm, 0);
  const totalMinutes = filteredTrips.reduce((acc, t) => acc + t.durationMinutes, 0);
  const totalCO2Kg = filteredTrips.reduce((acc, t) => acc + t.co2Kg, 0);
  const totalCO2SavedKg = filteredTrips.reduce((acc, t) => acc + t.co2SavedKg, 0);
  const totalTripCost = filteredTrips.reduce((acc, t) => acc + (t.cost || 0), 0);

  // Date helper functions
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    onSelectDate(d.toISOString().split('T')[0]);
    if (userProfile.soundEnabled) playHapticSound('tap');
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    onSelectDate(d.toISOString().split('T')[0]);
    if (userProfile.soundEnabled) playHapticSound('tap');
  };

  const handleTodayClick = () => {
    onSelectDate(new Date().toISOString().split('T')[0]);
    if (userProfile.soundEnabled) playHapticSound('tap');
  };

  // Quick commute presets based on student or worker role
  const quickPresets = userProfile.role === 'estudiante'
    ? [
        {
          label: 'Metro al Campus',
          mode: 'metro' as TransportMode,
          origin: 'Casa',
          dest: 'Campus Universitario',
          km: 8.4,
          min: 28,
          cost: 1.25,
          emoji: '🚇',
        },
        {
          label: 'Bus de Regreso',
          mode: 'bus' as TransportMode,
          origin: 'Campus Central',
          dest: 'Casa',
          km: 9.1,
          min: 35,
          cost: 1.50,
          emoji: '🚌',
        },
        {
          label: 'Bici al Campus',
          mode: 'bicycle' as TransportMode,
          origin: 'Casa',
          dest: 'Facultad',
          km: 7.8,
          min: 25,
          cost: 0,
          emoji: '🚲',
        },
      ]
    : [
        {
          label: 'Metro a Oficina',
          mode: 'metro' as TransportMode,
          origin: 'Casa',
          dest: 'Oficina Central',
          km: 10.2,
          min: 32,
          cost: 1.50,
          emoji: '🚇',
        },
        {
          label: 'Bus Retorno',
          mode: 'bus' as TransportMode,
          origin: 'Oficina Central',
          dest: 'Casa',
          km: 10.2,
          min: 40,
          cost: 1.50,
          emoji: '🚌',
        },
        {
          label: 'Caminata Activa',
          mode: 'walking' as TransportMode,
          origin: 'Metro Estación',
          dest: 'Oficina',
          km: 1.5,
          min: 18,
          cost: 0,
          emoji: '🚶',
        },
      ];

  const handleExecuteQuickPreset = (preset: typeof quickPresets[0]) => {
    onQuickLog(preset.mode, preset.origin, preset.dest, preset.km, preset.min, preset.cost);
    if (userProfile.soundEnabled) playHapticSound('success');
    setQuickSavedFeedback(`¡Trayecto "${preset.label}" registrado!`);
    setTimeout(() => setQuickSavedFeedback(null), 2500);
  };

  return (
    <div className="flex-1 p-4 space-y-4 pb-8">
      {/* Date Bar & Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider block">
            {isToday ? '🟢 Registro de Hoy' : '📅 Histórico de Trayectos'}
          </span>
          <h2 className="text-base font-bold text-white leading-tight">
            Hola, {userProfile.name.split(' ')[0]} 👋
          </h2>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 text-xs shadow-inner">
          <button
            onClick={handlePrevDay}
            className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Día anterior"
          >
            <ChevronLeft size={16} />
          </button>
          
          <button
            onClick={handleTodayClick}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors ${
              isToday ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            {isToday ? 'Hoy' : selectedDate}
          </button>

          <button
            onClick={handleNextDay}
            className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Día siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick feedback toast */}
      {quickSavedFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span>{quickSavedFeedback}</span>
          <span className="text-[10px] bg-emerald-500/30 px-2 py-0.5 rounded-full">Listo</span>
        </div>
      )}

      {/* 4 Daily Key Metric Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Distance Card */}
        <div className={`p-3 rounded-2xl border shadow-sm relative overflow-hidden group ${
          isDark ? 'bg-[#2C3E50] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Distancia Total</span>
            <Route size={14} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono">{totalKm.toFixed(1)}</span>
            <span className="text-xs text-cyan-400 font-semibold">km</span>
          </div>
          <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {filteredTrips.length} {filteredTrips.length === 1 ? 'trayecto' : 'trayectos'} registrados
          </span>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-cyan-500/5 rounded-tl-full pointer-events-none" />
        </div>

        {/* Time in transit Card */}
        <div className={`p-3 rounded-2xl border shadow-sm relative overflow-hidden ${
          isDark ? 'bg-[#2C3E50] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tiempo en Tránsito</span>
            <Clock size={14} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black font-mono">{totalMinutes}</span>
            <span className="text-xs text-amber-400 font-semibold">min</span>
          </div>
          <span className={`text-[10px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {Math.floor(totalMinutes / 60) > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : 'En movimiento'}
          </span>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-amber-500/5 rounded-tl-full pointer-events-none" />
        </div>

        {/* CO2 Footprint Card */}
        <div className={`p-3 rounded-2xl border shadow-sm relative overflow-hidden ${
          isDark ? 'bg-[#2C3E50] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Emisión de CO2</span>
            <span className="text-xs">🍃</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[#2ECC71] font-mono">{totalCO2Kg.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-semibold">kg</span>
          </div>
          <span className="text-[10px] text-[#2ECC71] font-medium block mt-0.5 truncate">
            {totalCO2SavedKg > 0 ? `+${totalCO2SavedKg.toFixed(2)} kg evitados` : 'Cálculo de impacto'}
          </span>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-[#2ECC71]/5 rounded-tl-full pointer-events-none" />
        </div>

        {/* Daily Spend Card */}
        <div className={`p-3 rounded-2xl border shadow-sm relative overflow-hidden ${
          isDark ? 'bg-[#2C3E50] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Gasto del Día</span>
            <span className="text-xs text-[#2ECC71] font-mono font-bold">{userProfile.currency}</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs text-slate-400">{userProfile.currency}</span>
            <span className="text-xl font-black font-mono">
              {(expensesTodayTotal || totalTripCost).toFixed(2)}
            </span>
          </div>
          <span className={`text-[10px] block mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Límite: {userProfile.currency}{userProfile.dailyBudget.toFixed(2)}
          </span>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-emerald-500/5 rounded-tl-full pointer-events-none" />
        </div>
      </div>

      {/* NUEVA FUNCIÓN: HIDRATACIÓN Y SALUD EN EL TRANSCURSO DE VIAJES */}
      <HydrationWidget
        waterLogs={waterLogs}
        userProfile={userProfile}
        selectedDate={selectedDate}
        onAddWater={onAddWater}
        onDeleteWater={onDeleteWater}
      />

      {/* Quick Commute Presets (1-Tap Fast Logging) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Zap size={14} className="text-amber-400" />
            <span>Rutas Frecuentes (1 Toque)</span>
          </span>
          <span className="text-[10px] text-slate-400">Atajos rápidos</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleExecuteQuickPreset(preset)}
              className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-left transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-base">{preset.emoji}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-400 font-mono">
                  +{preset.km}k
                </span>
              </div>
              <div>
                <p className="text-[11px] font-bold leading-tight truncate">
                  {preset.label}
                </p>
                <p className={`text-[9px] font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {preset.min} min • {preset.cost > 0 ? `${userProfile.currency}${preset.cost.toFixed(2)}` : 'Gratis'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fast Displacement Tracker Form (feat(tracker)) */}
      <div className={`p-3.5 rounded-3xl border shadow-md space-y-3 transition-all ${
        isDark ? 'bg-[#2C3E50] border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="p-1.5 rounded-xl bg-[#2ECC71]/20 text-[#2ECC71]">
              <Route size={14} />
            </span>
            <div>
              <h3 className="text-xs font-black text-white leading-tight">
                Registro Rápido de Desplazamiento
              </h3>
              <p className="text-[10px] text-slate-400">Origen, destino, transporte y cálculo de tiempo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowFastTracker(!showFastTracker);
              if (userProfile.soundEnabled) playHapticSound('toggle');
            }}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2ECC71]/20 text-[#2ECC71] hover:bg-[#2ECC71]/30 transition-colors"
          >
            {showFastTracker ? 'Ocultar' : 'Desplegar'}
          </button>
        </div>

        {showFastTracker && (
          <form onSubmit={handleSaveFastDisplacement} className="space-y-3 pt-1 border-t border-slate-700/60">
            {/* Origin & Destination Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                  Punto de Origen
                </label>
                <div className="relative">
                  <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="text"
                    value={fastOrigin}
                    onChange={(e) => setFastOrigin(e.target.value)}
                    placeholder={userProfile.role === 'estudiante' ? 'Ej: Casa / Hogar' : 'Ej: Casa / Depto'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2ECC71]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                  Punto de Destino
                </label>
                <div className="relative">
                  <MapPin size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="text"
                    value={fastDest}
                    onChange={(e) => setFastDest(e.target.value)}
                    placeholder={userProfile.role === 'estudiante' ? 'Ej: Campus / Facultad' : 'Ej: Oficina / Trabajo'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2ECC71]"
                  />
                </div>
              </div>
            </div>

            {/* Transport Mode Selection */}
            <div>
              <label className="text-[10px] font-semibold text-slate-300 block mb-1">
                Medio de Transporte
              </label>
              <div className="grid grid-cols-6 gap-1">
                {(['metro', 'bus', 'car', 'motorcycle', 'bicycle', 'walking'] as TransportMode[]).map((modeKey) => (
                  <button
                    key={modeKey}
                    type="button"
                    onClick={() => {
                      setFastMode(modeKey);
                      if (userProfile.soundEnabled) playHapticSound('tap');
                    }}
                    className={`py-1.5 px-1 rounded-xl text-[10px] flex flex-col items-center gap-0.5 border transition-all ${
                      fastMode === modeKey
                        ? 'border-[#2ECC71] bg-[#2ECC71]/20 text-white font-bold ring-1 ring-[#2ECC71]'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">
                      {modeKey === 'metro' ? '🚇' : modeKey === 'bus' ? '🚌' : modeKey === 'car' ? '🚗' : modeKey === 'motorcycle' ? '🏍️' : modeKey === 'bicycle' ? '🚲' : '🚶'}
                    </span>
                    <span className="truncate text-[9px] capitalize">{modeKey === 'bicycle' ? 'Bici' : modeKey === 'walking' ? 'Pie' : modeKey}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider & Calculations */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-300 font-semibold flex items-center gap-1">
                  <Clock size={12} className="text-amber-400" />
                  <span>Duración: <strong>{fastDuration} min</strong></span>
                </span>
                <span className="font-mono text-[10px] text-cyan-300">
                  ~{estimatedFastKm} km estimados
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={fastDuration}
                onChange={(e) => setFastDuration(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#2ECC71]"
              />
            </div>

            {/* Calculated CO2 & Time impact preview */}
            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">
                Emisión: <strong className="text-emerald-400">{fastCO2} kg CO2</strong>
              </span>
              <span className="text-cyan-400">
                {fastSavedCO2 > 0 ? `+${fastSavedCO2} kg ahorrados vs auto` : 'Modo estándar'}
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2ECC71] hover:bg-[#27ae60] text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98"
            >
              <span>Guardar Desplazamiento</span>
            </button>
          </form>
        )}

        {!showFastTracker && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowFastTracker(true);
                if (userProfile.soundEnabled) playHapticSound('tap');
              }}
              className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white font-bold py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs transition-all"
            >
              <Zap size={14} className="text-amber-400" />
              <span>Registro Rápido (1 Min)</span>
            </button>
            <button
              onClick={() => {
                if (userProfile.soundEnabled) playHapticSound('tap');
                onOpenNewTripModal();
              }}
              className="flex-1 bg-gradient-to-r from-[#2ECC71] to-[#27ae60] hover:brightness-105 active:scale-98 text-slate-950 font-black py-2.5 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-[#2ECC71]/25 transition-all text-xs"
            >
              <Plus size={16} strokeWidth={2.8} />
              <span>Formulario Completo</span>
            </button>
          </div>
        )}
      </div>

      {showFastTracker && (
        <button
          onClick={() => {
            if (userProfile.soundEnabled) playHapticSound('tap');
            onOpenNewTripModal();
          }}
          className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs"
        >
          <Plus size={16} />
          <span>Abrir Formulario Detallado con Favoritos</span>
        </button>
      )}

      {/* Trips Timeline of the day */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Trayectos de {isToday ? 'Hoy' : selectedDate}
          </span>
          <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {filteredTrips.length} {filteredTrips.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {filteredTrips.length === 0 ? (
          <div className={`p-6 rounded-3xl border text-center space-y-2 ${
            isDark ? 'bg-[#2C3E50]/60 border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-xl ${
              isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              🚲
            </div>
            <p className="text-xs font-semibold">
              No hay trayectos registrados para este día
            </p>
            <p className={`text-[11px] max-w-[240px] mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Presiona el botón verde de arriba o usa un atajo de 1 toque para registrar tu viaje de hoy.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTrips.map((trip) => {
              const modeMeta = TRANSPORT_MODES[trip.mode];
              return (
                <div
                  key={trip.id}
                  className={`p-3.5 rounded-2xl border shadow-sm transition-all space-y-2 ${
                    isDark 
                      ? 'bg-[#2C3E50] border-slate-700/80 hover:border-slate-600 text-white' 
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  {/* Top row: Transport badge & time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${modeMeta.bgLight} border ${modeMeta.borderLight}`}>
                        <TransportIcon mode={trip.mode} className={`w-4 h-4 ${modeMeta.color}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {modeMeta.label}
                          </span>
                          {trip.isFavorite && (
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {trip.purpose} • {trip.time} hrs
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {trip.cost !== undefined && trip.cost > 0 ? (
                        <span className="text-xs font-mono font-bold text-emerald-400 block">
                          {userProfile.currency}{trip.cost.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full block">
                          Sin costo
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {trip.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  {/* Route path */}
                  <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                    <span className="text-slate-300 font-medium truncate flex-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{trip.origin}</span>
                    </span>
                    <span className="text-slate-500 font-mono">➔</span>
                    <span className="text-slate-300 font-medium truncate flex-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                      <span className="truncate">{trip.destination}</span>
                    </span>
                  </div>

                  {/* Bottom metrics & actions */}
                  <div className="flex items-center justify-between pt-0.5 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded-md">
                        {trip.distanceKm} km
                      </span>

                      {trip.co2Kg === 0 ? (
                        <span className="text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                          <span>🌱</span> Cero CO2
                        </span>
                      ) : (
                        <span className="text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md font-mono">
                          {trip.co2Kg} kg CO2
                        </span>
                      )}

                      {trip.co2SavedKg > 0 && (
                        <span className="text-emerald-400 hidden sm:inline">
                          (-{trip.co2SavedKg} kg vs auto)
                        </span>
                      )}

                      {trip.waterIntakeMl && trip.waterIntakeMl > 0 && (
                        <span className="text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-0.5">
                          <span>💧</span> +{trip.waterIntakeMl}ml
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Quick commute water intake */}
                      <button
                        onClick={() => {
                          onAddWater(250, 'durante_viaje', `En trayecto ${trip.origin} ➔ ${trip.destination}`);
                          if (userProfile.soundEnabled) playHapticSound('success');
                        }}
                        className="p-1 rounded-lg text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10 transition-colors flex items-center gap-0.5 text-[9px]"
                        title="Tomar 250ml de agua en este trayecto"
                      >
                        <span>💧</span>
                        <span className="hidden sm:inline">+250ml</span>
                      </button>

                      {/* Duplicate trip */}
                      <button
                        onClick={() => {
                          if (userProfile.soundEnabled) playHapticSound('tap');
                          onDuplicateTrip(trip);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Repetir este trayecto hoy"
                      >
                        <Copy size={13} />
                      </button>

                      {/* Delete trip */}
                      <button
                        onClick={() => {
                          if (userProfile.soundEnabled) playHapticSound('delete');
                          onDeleteTrip(trip.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Commuter Tip Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0 text-lg">
          💡
        </div>
        <div>
          <h4 className="text-xs font-bold text-white mb-0.5">
            Consejo para {userProfile.role === 'estudiante' ? 'Estudiantes' : 'Trabajadores'}
          </h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {userProfile.role === 'estudiante'
              ? 'Aprovecha las tarifas con carné universitario en metro/tren y combina con caminata para ahorrar hasta un 60% mensual en transporte.'
              : 'Si compartes viaje (carpool) o alternas 2 días en transporte público, reduces tus gastos de gasolina en más de $40 mensuales y 18 kg de CO2.'}
          </p>
        </div>
      </div>
    </div>
  );
};
