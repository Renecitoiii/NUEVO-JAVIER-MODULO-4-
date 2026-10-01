import React, { useState } from 'react';
import { 
  Leaf, 
  Clock, 
  TrendingUp, 
  Award, 
  Sparkles, 
  HelpCircle, 
  TreePine, 
  Flame, 
  Zap, 
  Smile, 
  BarChart3, 
  Sliders, 
  ChevronRight, 
  Info 
} from 'lucide-react';
import { Trip, UserProfile, TransportMode, WaterLog, AppTheme } from '../../types';
import { TRANSPORT_MODES, BASELINE_CAR_EMISSION_PER_KM } from '../../utils/transportUtils';
import { playHapticSound } from '../../utils/haptics';

interface ImpactScreenProps {
  trips: Trip[];
  userProfile: UserProfile;
  waterLogs?: WaterLog[];
  theme?: AppTheme;
}

export const ImpactScreen: React.FC<ImpactScreenProps> = ({ 
  trips, 
  userProfile, 
  waterLogs = [],
  theme = 'dark'
}) => {
  const isDark = theme === 'dark';

  // Chart period selector: last 7 days
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [simDaysAlt, setSimDaysAlt] = useState<number>(2); // Simulator slider

  // Total water intake from logs and trips
  const totalWaterLoggedMl = waterLogs.reduce((acc, w) => acc + w.amountMl, 0);

  // Generate last 7 days array
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
    const dayNumber = d.getDate();
    return { dateStr, dayName, dayNumber };
  });

  // Aggregate stats per day for the last 7 days
  const dailyStats = last7Days.map(({ dateStr, dayName, dayNumber }) => {
    const dayTrips = trips.filter((t) => t.date === dateStr);
    const totalMinutes = dayTrips.reduce((acc, t) => acc + t.durationMinutes, 0);
    const totalKm = dayTrips.reduce((acc, t) => acc + t.distanceKm, 0);
    const realCO2 = dayTrips.reduce((acc, t) => acc + t.co2Kg, 0);
    const savedCO2 = dayTrips.reduce((acc, t) => acc + t.co2SavedKg, 0);
    const baselineCO2 = totalKm * BASELINE_CAR_EMISSION_PER_KM;

    return {
      dateStr,
      dayName: dayName.toUpperCase().replace('.', ''),
      dayNumber,
      totalMinutes,
      totalKm,
      realCO2: Number(realCO2.toFixed(2)),
      savedCO2: Number(savedCO2.toFixed(2)),
      baselineCO2: Number(baselineCO2.toFixed(2)),
      tripsCount: dayTrips.length,
      trips: dayTrips,
    };
  });

  // Overall totals across all logged trips
  const grandTotalMinutes = trips.reduce((acc, t) => acc + t.durationMinutes, 0);
  const grandTotalKm = trips.reduce((acc, t) => acc + t.distanceKm, 0);
  const grandTotalCO2 = trips.reduce((acc, t) => acc + t.co2Kg, 0);
  const grandTotalCO2Saved = trips.reduce((acc, t) => acc + t.co2SavedKg, 0);

  // Active mobility (walking + biking) km & calories burned (~40 kcal per km walking/biking)
  const activeTrips = trips.filter((t) => t.mode === 'walking' || t.mode === 'bicycle');
  const activeKm = activeTrips.reduce((acc, t) => acc + t.distanceKm, 0);
  const caloriesBurned = Math.round(activeKm * 42);

  // Trees equivalent (1 tree absorbs ~22 kg CO2 per year, so ~0.06 kg per day)
  const treesSaved = (grandTotalCO2Saved / 22).toFixed(1);

  // Modal share calculation (% transit, % active, % private)
  let publicTransitCount = 0;
  let activeMobilityCount = 0;
  let privateVehicleCount = 0;

  trips.forEach((t) => {
    if (t.mode === 'metro' || t.mode === 'bus') publicTransitCount += t.distanceKm;
    else if (t.mode === 'walking' || t.mode === 'bicycle' || t.mode === 'scooter') activeMobilityCount += t.distanceKm;
    else privateVehicleCount += t.distanceKm;
  });

  const totalModalKm = publicTransitCount + activeMobilityCount + privateVehicleCount || 1;
  const transitPercent = Math.round((publicTransitCount / totalModalKm) * 100);
  const activePercent = Math.round((activeMobilityCount / totalModalKm) * 100);
  const privatePercent = Math.max(0, 100 - transitPercent - activePercent);

  // Chart max values for scaling
  const maxMinutesInWeek = Math.max(60, ...dailyStats.map((d) => d.totalMinutes));
  const maxCO2InWeek = Math.max(2.5, ...dailyStats.map((d) => Math.max(d.realCO2, d.baselineCO2)));

  // Simulator calculations (switching X days/week from car to transit/bike)
  const avgTripKmOneWay = 8.5;
  const dailyKmCommute = avgTripKmOneWay * 2; // round trip 17 km
  const annualWorkWeeks = 48;
  const annualKmSwapped = simDaysAlt * dailyKmCommute * annualWorkWeeks;
  // Solo car emits 0.175 kg/km, transit emits ~0.030 kg/km -> saved ~0.145 kg/km
  const annualCO2SavedSim = Math.round(annualKmSwapped * 0.145);
  // Fuel cost savings: ~10 km per liter at $1.20/L = ~$0.12/km vs transit ($2.50/day)
  const annualMoneySavedSim = Math.round(simDaysAlt * annualWorkWeeks * 6.50);

  return (
    <div className="flex-1 p-4 space-y-4 pb-8">
      {/* Screen Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider block">
            Métricas Ambientales y Tiempo
          </span>
          <h2 className="text-base font-bold text-white leading-tight">
            Mi Impacto Ecológico
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full text-emerald-300 text-xs font-bold">
          <Leaf size={14} className="text-emerald-400" />
          <span>-{grandTotalCO2Saved.toFixed(1)} kg CO2</span>
        </div>
      </div>

      {/* Top 4 Impact Highlight Badges */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 text-center">
          <span className="text-lg block mb-0.5">🌳</span>
          <p className="text-xs font-black font-mono text-emerald-300">{treesSaved}</p>
          <span className="text-[8px] text-slate-400 font-medium leading-tight block">
            Árboles
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 text-center">
          <span className="text-lg block mb-0.5">⏱️</span>
          <p className="text-xs font-black font-mono text-cyan-300">
            {Math.floor(grandTotalMinutes / 60)}h{grandTotalMinutes % 60}m
          </p>
          <span className="text-[8px] text-slate-400 font-medium leading-tight block">
            Tiempo
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 text-center">
          <span className="text-lg block mb-0.5">🔥</span>
          <p className="text-xs font-black font-mono text-amber-300">{caloriesBurned}</p>
          <span className="text-[8px] text-slate-400 font-medium leading-tight block">
            Kcal
          </span>
        </div>

        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 text-center">
          <span className="text-lg block mb-0.5">💧</span>
          <p className="text-xs font-black font-mono text-cyan-300">{totalWaterLoggedMl}</p>
          <span className="text-[8px] text-slate-400 font-medium leading-tight block">
            ml Agua
          </span>
        </div>
      </div>

      {/* GRÁFICO 1: TIEMPO INVERTIDO EN TRASLADOS (7 DÍAS) */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-3 ${
        isDark ? 'bg-[#2C3E50] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold">Tiempo Invertido por Día</h3>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Minutos diarios en movilidad urbana</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400">
            Promedio: {Math.round(grandTotalMinutes / (dailyStats.length || 1))} m/día
          </span>
        </div>

        {/* Interactive SVG Bar Chart for Time */}
        <div className="pt-2">
          <div className="h-36 flex items-end justify-between gap-1.5 px-1 relative">
            {/* Horizontal guide lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-slate-700">
              <div className="border-b border-dashed border-slate-500 w-full" />
              <div className="border-b border-dashed border-slate-500 w-full" />
              <div className="border-b border-slate-700 w-full" />
            </div>

            {dailyStats.map((day, idx) => {
              const heightPercent = Math.max(8, Math.round((day.totalMinutes / maxMinutesInWeek) * 100));
              const isSelected = selectedDayIndex === idx;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => {
                    setSelectedDayIndex(isSelected ? null : idx);
                    if (userProfile.soundEnabled) playHapticSound('tap');
                  }}
                  className="flex-1 flex flex-col items-center justify-end h-full z-10 cursor-pointer group"
                >
                  {/* Tooltip / value preview on top */}
                  <span
                    className={`text-[9px] font-mono mb-1 transition-all ${
                      isSelected || day.totalMinutes > 0
                        ? 'text-cyan-400 font-bold opacity-100'
                        : 'text-transparent group-hover:text-slate-400 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {day.totalMinutes}m
                  </span>

                  {/* Visual Bar */}
                  <div className="w-full max-w-[28px] h-full flex items-end justify-center">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-md shadow-cyan-950 ring-2 ring-cyan-300'
                          : day.totalMinutes > 0
                          ? 'bg-gradient-to-t from-cyan-700/80 to-cyan-500 hover:from-cyan-600 hover:to-cyan-400'
                          : isDark ? 'bg-slate-800/60' : 'bg-slate-200'
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[10px] mt-2 font-mono font-medium transition-colors ${
                      isSelected ? 'text-cyan-400 font-bold scale-110' : isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Selected day detail drawer */}
          {selectedDayIndex !== null && (
            <div className={`mt-3 p-3 rounded-2xl border text-xs animate-in fade-in duration-200 ${
              isDark ? 'bg-cyan-950/30 border-cyan-500/30' : 'bg-cyan-50 border-cyan-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between font-bold text-cyan-500 mb-1">
                <span>Detalle: {dailyStats[selectedDayIndex].dateStr}</span>
                <span className="font-mono">{dailyStats[selectedDayIndex].totalMinutes} min totales</span>
              </div>
              <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {dailyStats[selectedDayIndex].tripsCount > 0
                  ? `${dailyStats[selectedDayIndex].tripsCount} trayectos registrados (${dailyStats[selectedDayIndex].totalKm} km recorridos).`
                  : 'Sin trayectos registrados en este día.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* GRÁFICO 2: HUELLA DE CO2 VS AUTO PARTICULAR (7 DÍAS) */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-3 ${
        isDark ? 'bg-[#2C3E50] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#2ECC71]/20 text-[#2ECC71]">
              <Leaf size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold">Huella de CO2 Real vs Auto</h3>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Comparativa de emisiones en kilogramos</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#2ECC71]" />
            <span className="text-[#2ECC71] font-semibold">Tu Huella Real</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-rose-500/70" />
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Si fueras en auto solo</span>
          </div>
        </div>

        {/* Double Bar Chart for CO2 */}
        <div className="pt-2">
          <div className="h-40 flex items-end justify-between gap-1.5 px-1 relative">
            {/* Guide line */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-slate-700">
              <div className="border-b border-dashed border-slate-500 w-full" />
              <div className="border-b border-dashed border-slate-500 w-full" />
              <div className="border-b border-slate-700 w-full" />
            </div>

            {dailyStats.map((day) => {
              const realHeightPercent = Math.max(6, Math.round((day.realCO2 / maxCO2InWeek) * 100));
              const baselineHeightPercent = Math.max(6, Math.round((day.baselineCO2 / maxCO2InWeek) * 100));

              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center justify-end h-full z-10">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Real CO2 Bar (Emerald #2ECC71) */}
                    <div
                      style={{ height: `${realHeightPercent}%` }}
                      className="w-1/2 max-w-[12px] rounded-t-sm bg-[#2ECC71] hover:bg-[#27ae60] transition-all shadow-sm"
                      title={`Tu CO2: ${day.realCO2} kg`}
                    />
                    {/* Baseline Car Bar (Red) */}
                    <div
                      style={{ height: `${baselineHeightPercent}%` }}
                      className="w-1/2 max-w-[12px] rounded-t-sm bg-rose-500/60 hover:bg-rose-500 transition-all"
                      title={`Auto particular: ${day.baselineCO2} kg`}
                    />
                  </div>

                  <span className={`text-[10px] mt-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>

          <div className={`mt-3 p-3 rounded-2xl border flex items-center justify-between text-xs ${
            isDark ? 'bg-[#1A252F] border-[#2ECC71]/30' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div>
              <p className="font-bold text-[#2ECC71]">Total de CO2 Ahorrado en la semana</p>
              <p className={`text-[10px] ${isDark ? 'text-emerald-400/80' : 'text-emerald-700'}`}>
                Gracias a Metro, Bus, Bici y Caminata
              </p>
            </div>
            <span className="text-base font-black font-mono text-[#2ECC71]">
              +{grandTotalCO2Saved.toFixed(2)} kg
            </span>
          </div>
        </div>
      </div>

      {/* DISTRIBUCIÓN MODAL (¿CÓMO TE MUEVES?) */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-3 ${
        isDark ? 'bg-[#2C3E50] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <h3 className="text-xs font-bold flex items-center gap-1.5">
          <BarChart3 size={15} className="text-[#2ECC71]" />
          <span>Distribución Modal (% por Distancia)</span>
        </h3>

        {/* Stacked Percentage Bar */}
        <div className={`w-full h-3 rounded-full flex overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
          <div
            style={{ width: `${transitPercent}%` }}
            className="bg-[#2ECC71] transition-all duration-500"
            title={`Transporte Público: ${transitPercent}%`}
          />
          <div
            style={{ width: `${activePercent}%` }}
            className="bg-cyan-400 transition-all duration-500"
            title={`Movilidad Activa: ${activePercent}%`}
          />
          <div
            style={{ width: `${privatePercent}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Transporte Privado: ${privatePercent}%`}
          />
        </div>

        {/* Modal Legend */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
          <div className={`p-2 rounded-xl border ${
            isDark ? 'bg-[#1A252F] border-slate-700/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-1 text-[11px] text-[#2ECC71] mb-0.5 font-bold">
              <span>🚇</span> <span>Público</span>
            </div>
            <p className="text-sm font-black font-mono">{transitPercent}%</p>
            <span className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Metro / Bus</span>
          </div>

          <div className={`p-2 rounded-xl border ${
            isDark ? 'bg-[#1A252F] border-slate-700/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-1 text-[11px] text-cyan-400 mb-0.5 font-bold">
              <span>🚲</span> <span>Activa</span>
            </div>
            <p className="text-sm font-black font-mono">{activePercent}%</p>
            <span className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bici / A pie</span>
          </div>

          <div className={`p-2 rounded-xl border ${
            isDark ? 'bg-[#1A252F] border-slate-700/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-1 text-[11px] text-rose-400 mb-0.5 font-bold">
              <span>🚗</span> <span>Privado</span>
            </div>
            <p className="text-sm font-black font-mono">{privatePercent}%</p>
            <span className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Auto / Moto / Taxi</span>
          </div>
        </div>
      </div>

      {/* SIMULADOR DE IMPACTO ALTERNATIVO (WHAT-IF) */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-3 ${
        isDark 
          ? 'bg-gradient-to-br from-[#2C3E50] to-[#1A252F] border-[#2ECC71]/30 text-white' 
          : 'bg-emerald-50/50 border-emerald-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#2ECC71]/20 text-[#2ECC71]">
              <Sliders size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold">Simulador de Ahorro y Futuro</h3>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>¿Y si dejas el auto/taxi algunos días?</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#2ECC71] font-mono bg-[#2ECC71]/15 px-2 py-0.5 rounded-full border border-[#2ECC71]/30">
            {simDaysAlt} {simDaysAlt === 1 ? 'día / sem' : 'días / sem'}
          </span>
        </div>

        {/* Interactive Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={simDaysAlt}
            onChange={(e) => {
              setSimDaysAlt(parseInt(e.target.value, 10));
              if (userProfile.soundEnabled) playHapticSound('tap');
            }}
            className="w-full accent-[#2ECC71] cursor-pointer h-2 bg-slate-700/60 rounded-lg"
          />
          <div className={`flex justify-between text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>1 día</span>
            <span>2 días</span>
            <span>3 días</span>
            <span>4 días</span>
            <span>5 días</span>
          </div>
        </div>

        {/* Results of simulation */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className={`p-2.5 rounded-2xl border ${
            isDark ? 'bg-[#1A252F] border-[#2ECC71]/30' : 'bg-white border-emerald-200'
          }`}>
            <span className="text-[10px] text-[#2ECC71] font-semibold block">Ahorro Anual Estimado</span>
            <p className="text-base font-black font-mono mt-0.5">
              +{userProfile.currency}{annualMoneySavedSim}
            </p>
            <span className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>En gasolina y peajes</span>
          </div>

          <div className={`p-2.5 rounded-2xl border ${
            isDark ? 'bg-[#1A252F] border-[#2ECC71]/30' : 'bg-white border-emerald-200'
          }`}>
            <span className="text-[10px] text-[#2ECC71] font-semibold block">CO2 Evitado al Año</span>
            <p className="text-base font-black font-mono text-[#2ECC71] mt-0.5">
              -{annualCO2SavedSim} kg
            </p>
            <span className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Eq. a {(annualCO2SavedSim / 22).toFixed(1)} árboles
            </span>
          </div>
        </div>
      </div>

      {/* INSIGNIAS DE COMMUTER SOSTENIBLE */}
      <div className={`p-4 rounded-3xl border space-y-3 ${
        isDark ? 'bg-[#2C3E50] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <h3 className="text-xs font-bold flex items-center gap-1.5">
          <Award size={15} className="text-amber-400" />
          <span>Insignias de Movilidad Desbloqueadas</span>
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2.5 rounded-2xl border flex items-center gap-2 ${
            isDark ? 'bg-[#1A252F] border-amber-500/30' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-2xl">🚇</span>
            <div>
              <p className="font-bold leading-tight">Master del Metro</p>
              <p className="text-[9px] text-amber-400 font-semibold">Nivel 2 • 50+ km</p>
            </div>
          </div>

          <div className={`p-2.5 rounded-2xl border flex items-center gap-2 ${
            isDark ? 'bg-[#1A252F] border-[#2ECC71]/30' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-2xl">🌱</span>
            <div>
              <p className="font-bold leading-tight">Eco-Estudiante</p>
              <p className="text-[9px] text-[#2ECC71] font-semibold">Ahorro &gt; 5 kg CO2</p>
            </div>
          </div>

          <div className={`p-2.5 rounded-2xl border flex items-center gap-2 ${
            isDark ? 'bg-[#1A252F] border-cyan-500/30' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-2xl">🚶</span>
            <div>
              <p className="font-bold leading-tight">Caminante Activo</p>
              <p className="text-[9px] text-cyan-400 font-semibold">Salud urbana</p>
            </div>
          </div>

          <div className={`p-2.5 rounded-2xl border flex items-center gap-2 ${
            isDark ? 'bg-[#1A252F] border-purple-500/30' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-bold leading-tight">Bajo Presupuesto</p>
              <p className="text-[9px] text-purple-400 font-semibold">Dentro del límite</p>
            </div>
          </div>

          <div className={`p-2.5 rounded-2xl border flex items-center gap-2 col-span-2 ${
            isDark ? 'bg-[#1A252F] border-blue-500/30' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-2xl">💧</span>
            <div>
              <p className="font-bold leading-tight">Viajero Hidratado</p>
              <p className="text-[9px] text-cyan-400 font-semibold">
                {totalWaterLoggedMl > 0 ? `${totalWaterLoggedMl} ml en ruta` : 'Empieza a hidratarte'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
