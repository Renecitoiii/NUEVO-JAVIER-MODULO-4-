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
import { Trip, UserProfile, TransportMode } from '../../types';
import { TRANSPORT_MODES, calculateTripCO2 } from '../../utils/transportUtils';
import { TransportIcon } from '../TransportIcon';
import { playHapticSound } from '../../utils/haptics';

interface HomeScreenProps {
  trips: Trip[];
  userProfile: UserProfile;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenNewTripModal: () => void;
  onDeleteTrip: (id: string) => void;
  onDuplicateTrip: (trip: Trip) => void;
  onQuickLog: (mode: TransportMode, origin: string, dest: string, km: number, min: number, cost: number) => void;
  expensesTodayTotal: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  trips,
  userProfile,
  selectedDate,
  onSelectDate,
  onOpenNewTripModal,
  onDeleteTrip,
  onDuplicateTrip,
  onQuickLog,
  expensesTodayTotal,
}) => {
  const [quickSavedFeedback, setQuickSavedFeedback] = useState<string | null>(null);

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
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Distancia Total</span>
            <Route size={14} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white font-mono">{totalKm.toFixed(1)}</span>
            <span className="text-xs text-cyan-400 font-semibold">km</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {filteredTrips.length} {filteredTrips.length === 1 ? 'trayecto' : 'trayectos'} registrados
          </span>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-cyan-500/5 rounded-tl-full pointer-events-none" />
        </div>

        {/* Time in transit Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Tiempo en Tránsito</span>
            <Clock size={14} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white font-mono">{totalMinutes}</span>
            <span className="text-xs text-amber-400 font-semibold">min</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {Math.floor(totalMinutes / 60) > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : 'En movimiento'}
          </span>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-amber-500/5 rounded-tl-full pointer-events-none" />
        </div>

        {/* CO2 Footprint Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Emisión de CO2</span>
            <span className="text-xs">🍃</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-emerald-400 font-mono">{totalCO2Kg.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-semibold">kg</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium block mt-0.5 truncate">
            {totalCO2SavedKg > 0 ? `+${totalCO2SavedKg.toFixed(2)} kg evitados` : 'Cálculo de impacto'}
          </span>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-emerald-500/5 rounded-tl-full pointer-events-none" />
        </div>

        {/* Daily Spend Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Gasto del Día</span>
            <span className="text-xs text-emerald-400 font-mono font-bold">{userProfile.currency}</span>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xs text-slate-400">{userProfile.currency}</span>
            <span className="text-xl font-black text-white font-mono">
              {(expensesTodayTotal || totalTripCost).toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            Límite: {userProfile.currency}{userProfile.dailyBudget.toFixed(2)}
          </span>
          <div className="absolute right-0 bottom-0 w-12 h-12 bg-emerald-500/5 rounded-tl-full pointer-events-none" />
        </div>
      </div>

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
                <p className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-300 leading-tight truncate">
                  {preset.label}
                </p>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                  {preset.min} min • {preset.cost > 0 ? `${userProfile.currency}${preset.cost.toFixed(2)}` : 'Gratis'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Action Button: Registrar Trayecto */}
      <button
        onClick={() => {
          if (userProfile.soundEnabled) playHapticSound('tap');
          onOpenNewTripModal();
        }}
        className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-98 text-white font-extrabold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all text-xs"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span>Registrar Nuevo Trayecto</span>
      </button>

      {/* Trips Timeline of the day */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-200">
            Trayectos de {isToday ? 'Hoy' : selectedDate}
          </span>
          <span className="text-[11px] text-slate-400">
            {filteredTrips.length} {filteredTrips.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
              🚲
            </div>
            <p className="text-xs font-semibold text-slate-200">
              No hay trayectos registrados para este día
            </p>
            <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto">
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
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-sm hover:border-slate-700/80 transition-all space-y-2"
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
                    </div>

                    <div className="flex items-center gap-1">
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
