import React, { useState } from 'react';
import { 
  Droplets, 
  Plus, 
  Trash2, 
  HeartPulse, 
  Check, 
  Sparkles, 
  Clock, 
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { WaterLog, UserProfile } from '../types';
import { playHapticSound } from '../utils/haptics';

interface HydrationWidgetProps {
  waterLogs: WaterLog[];
  userProfile: UserProfile;
  selectedDate: string;
  onAddWater: (amountMl: number, context?: 'durante_viaje' | 'antes_viaje' | 'llegada' | 'rutina', note?: string) => void;
  onDeleteWater: (id: string) => void;
}

export const HydrationWidget: React.FC<HydrationWidgetProps> = ({
  waterLogs,
  userProfile,
  selectedDate,
  onAddWater,
  onDeleteWater,
}) => {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [waterToast, setWaterToast] = useState<string | null>(null);

  // Filter logs for selected date
  const dayLogs = waterLogs.filter((w) => w.date === selectedDate);
  const totalWaterTodayMl = dayLogs.reduce((sum, w) => sum + w.amountMl, 0);

  // Hydration calculations
  const goalMl = userProfile.dailyWaterGoalMl || 2000;
  const progressPercent = Math.min(100, Math.round((totalWaterTodayMl / goalMl) * 100));
  const glassesCount = (totalWaterTodayMl / 250).toFixed(1);
  const glassesGoal = (goalMl / 250).toFixed(0);

  const handleQuickAdd = (amount: number, label: string) => {
    onAddWater(amount, 'durante_viaje', `Ingesta en traslado (${label})`);
    if (userProfile.soundEnabled) playHapticSound('success');
    setWaterToast(`+${amount} ml de agua registrado 💧`);
    setTimeout(() => setWaterToast(null), 2500);
  };

  return (
    <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 shadow-md space-y-3 relative overflow-hidden">
      {/* Toast */}
      {waterToast && (
        <div className="absolute top-2 right-2 z-20 px-2.5 py-1 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-lg animate-in fade-in zoom-in">
          <span>💧</span>
          <span>{waterToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Droplets size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-extrabold text-white">Hidratación en Ruta</h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-cyan-500/20 text-cyan-300">
                Salud
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Cuida tu cuerpo en tus traslados diarios</p>
          </div>
        </div>

        {/* Glasses Count */}
        <div className="text-right">
          <span className="text-sm font-black font-mono text-cyan-300">
            {totalWaterTodayMl}
          </span>
          <span className="text-[10px] text-slate-400 font-mono"> / {goalMl} ml</span>
          <p className="text-[9px] text-cyan-400 font-semibold">
            {glassesCount} de {glassesGoal} vasos
          </p>
        </div>
      </div>

      {/* Animated Water Level Bar */}
      <div>
        <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden relative shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-cyan-400 to-teal-300 transition-all duration-500 relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
          <span className="font-semibold text-cyan-300">{progressPercent}% completado</span>
          <span>
            {totalWaterTodayMl >= goalMl ? (
              <strong className="text-emerald-400">¡Meta diaria alcanzada! 🎉</strong>
            ) : (
              `Faltan ${goalMl - totalWaterTodayMl} ml`
            )}
          </span>
        </div>
      </div>

      {/* Quick Ingestion Buttons (1-Tap during commute) */}
      <div>
        <span className="text-[10px] font-bold text-slate-300 block mb-1.5">
          Tomar agua ahora (1 toque):
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { amount: 150, label: 'Sorbos', icon: '🥤' },
            { amount: 250, label: '1 Vaso', icon: '🥛' },
            { amount: 500, label: 'Botella', icon: '🍶' },
            { amount: 750, label: 'Termo', icon: '💧' },
          ].map((btn) => (
            <button
              key={btn.amount}
              type="button"
              onClick={() => handleQuickAdd(btn.amount, btn.label)}
              className="p-2 rounded-2xl bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 text-center transition-all active:scale-95 group"
            >
              <span className="text-base block mb-0.5">{btn.icon}</span>
              <span className="text-xs font-black font-mono text-cyan-200 block">
                +{btn.amount}
              </span>
              <span className="text-[9px] text-slate-400 block truncate">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Health Tip for the Commute */}
      <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2 text-xs">
        <HeartPulse size={15} className="text-rose-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-300 leading-tight">
          {userProfile.role === 'estudiante'
            ? 'Los traslados a la universidad y el peso de la mochila aumentan la deshidratación. Beber agua cada 45 minutos previene dolores de cabeza y mejora tu memoria.'
            : 'En trayectos de trabajo con aire acondicionado en autobús o auto se pierde hidratación sin sentir sudor. Lleva siempre tu botella recargable.'}
        </p>
      </div>

      {/* Collapsible logs of today */}
      {dayLogs.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-[10px] text-slate-400 hover:text-slate-200 pt-1"
          >
            <span>Ver registros de agua de hoy ({dayLogs.length})</span>
            {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showHistory && (
            <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {dayLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/70 flex items-center justify-between text-[11px]"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-cyan-400 font-bold font-mono">+{log.amountMl} ml</span>
                    <span className="text-[10px] text-slate-400">
                      • {log.time} {log.note ? `• ${log.note}` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (userProfile.soundEnabled) playHapticSound('delete');
                      onDeleteWater(log.id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Eliminar registro de agua"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
