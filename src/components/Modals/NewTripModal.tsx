import React, { useState } from 'react';
import { X, Check, MapPin, Clock, Route, DollarSign, Sparkles, Star } from 'lucide-react';
import { Trip, TransportMode, TripPurpose } from '../../types';
import { TRANSPORT_MODES, calculateTripCO2 } from '../../utils/transportUtils';
import { TransportIcon } from '../TransportIcon';
import { playHapticSound } from '../../utils/haptics';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTrip: (trip: Omit<Trip, 'id'>) => void;
  currency: string;
  role: 'estudiante' | 'trabajador';
  soundEnabled: boolean;
}

export const NewTripModal: React.FC<NewTripModalProps> = ({
  isOpen,
  onClose,
  onSaveTrip,
  currency,
  role,
  soundEnabled,
}) => {
  const [mode, setMode] = useState<TransportMode>('metro');
  const [origin, setOrigin] = useState<string>('Casa');
  const [destination, setDestination] = useState<string>(
    role === 'estudiante' ? 'Campus Universitario' : 'Oficina / Trabajo'
  );
  const [distanceKm, setDistanceKm] = useState<number>(8.5);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [purpose, setPurpose] = useState<TripPurpose>(role === 'estudiante' ? 'estudio' : 'trabajo');
  const [cost, setCost] = useState<string>('1.25');
  const [time, setTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  // Real-time calculation of CO2
  const { co2Kg, co2SavedKg } = calculateTripCO2(mode, distanceKm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim() || distanceKm <= 0) return;

    if (soundEnabled) playHapticSound('success');

    const todayStr = new Date().toISOString().split('T')[0];

    onSaveTrip({
      date: todayStr,
      time,
      origin: origin.trim(),
      destination: destination.trim(),
      mode,
      distanceKm: Number(distanceKm),
      durationMinutes: Number(durationMinutes),
      purpose,
      cost: cost ? parseFloat(cost) : 0,
      co2Kg,
      co2SavedKg,
      isFavorite,
      notes: notes.trim(),
    });

    onClose();
  };

  const commonLocations = role === 'estudiante'
    ? ['Casa', 'Campus Universitario', 'Biblioteca', 'Estación Metro', 'Centro de Prácticas', 'Gimnasio']
    : ['Casa', 'Oficina / Empresa', 'Estación Central', 'Reunión Externa', 'Coworking', 'Gimnasio'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Route size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Registrar Trayecto</h2>
              <p className="text-xs text-slate-400">Calcula tu tiempo, gasto y huella de CO2</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (soundEnabled) playHapticSound('tap');
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Mode Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">
              Medio de Transporte
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(TRANSPORT_MODES) as TransportMode[]).map((key) => {
                const meta = TRANSPORT_MODES[key];
                const isSelected = mode === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setMode(key);
                      if (key === 'walking' || key === 'bicycle') {
                        setCost('0');
                      }
                      if (soundEnabled) playHapticSound('tap');
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/20 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <TransportIcon mode={key} className={`w-5 h-5 mb-1 ${isSelected ? 'text-emerald-400' : meta.color}`} />
                    <span className="text-[10px] font-medium leading-tight truncate w-full">
                      {meta.label.split('/')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Eco Preview Banner */}
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍃</span>
              <div>
                <p className="text-emerald-300 font-bold text-xs">
                  {co2Kg === 0 ? '¡100% Cero Emisiones!' : `${co2Kg} kg CO2 emitidos`}
                </p>
                <p className="text-[10px] text-emerald-400/80">
                  {co2SavedKg > 0 ? `Ahorras ${co2SavedKg} kg CO2 vs auto particular` : 'Medio de alta emisión'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                {TRANSPORT_MODES[mode].isEco ? 'Sostenible' : 'Fósil'}
              </span>
            </div>
          </div>

          {/* Origin and Destination */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-emerald-400" /> Origen
              </label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="Ej. Casa"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-rose-400" /> Destino
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ej. Campus / Trabajo"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Quick Location Pills */}
          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Destinos rápidos:</span>
            <div className="flex flex-wrap gap-1.5">
              {commonLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setDestination(loc);
                    if (soundEnabled) playHapticSound('tap');
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Distance and Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                <span>Distancia (km)</span>
                <span className="text-emerald-400 font-bold">{distanceKm} km</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
              />
              <div className="flex gap-1 mt-1">
                {[2, 5, 8.5, 12].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setDistanceKm(km)}
                    className="flex-1 text-[9px] py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                  >
                    {km}k
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                <span>Duración (min)</span>
                <span className="text-amber-400 font-bold">{durationMinutes} min</span>
              </label>
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
              />
              <div className="flex gap-1 mt-1">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMinutes(m)}
                    className="flex-1 text-[9px] py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Time & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <Clock size={12} className="text-slate-400" /> Hora Salida
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <DollarSign size={12} className="text-emerald-400" /> Costo ({currency})
              </label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs font-mono"
              />
            </div>
          </div>

          {/* Purpose & Favorite */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">Propósito:</span>
              {(['estudio', 'trabajo', 'retorno'] as TripPurpose[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                    purpose === p
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFavorite(!isFavorite);
                if (soundEnabled) playHapticSound('toggle');
              }}
              className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border transition-colors ${
                isFavorite
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Star size={11} className={isFavorite ? 'fill-amber-400 text-amber-400' : ''} />
              <span>Ruta Favorita</span>
            </button>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all text-xs"
            >
              <Check size={16} />
              <span>Guardar Trayecto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
