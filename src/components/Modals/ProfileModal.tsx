import React, { useState } from 'react';
import { X, Check, User, GraduationCap, Briefcase, DollarSign, RotateCcw, Volume2, Droplets, LogOut } from 'lucide-react';
import { UserProfile } from '../../types';
import { playHapticSound } from '../../utils/haptics';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onResetData: () => void;
  onLogout?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onResetData,
  onLogout,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [role, setRole] = useState<'estudiante' | 'trabajador'>(userProfile.role);
  const [institutionOrCompany, setInstitutionOrCompany] = useState(userProfile.institutionOrCompany);
  const [currency, setCurrency] = useState(userProfile.currency);
  const [dailyBudget, setDailyBudget] = useState(userProfile.dailyBudget.toString());
  const [monthlyBudget, setMonthlyBudget] = useState(userProfile.monthlyBudget.toString());
  const [dailyWaterGoalMl, setDailyWaterGoalMl] = useState(
    (userProfile.dailyWaterGoalMl || 2000).toString()
  );
  const [soundEnabled, setSoundEnabled] = useState(userProfile.soundEnabled);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (soundEnabled) playHapticSound('success');
    onSaveProfile({
      ...userProfile,
      name: name.trim() || 'Usuario',
      role,
      institutionOrCompany: institutionOrCompany.trim() || (role === 'estudiante' ? 'Campus Universitario' : 'Empresa'),
      currency,
      dailyBudget: parseFloat(dailyBudget) || 5,
      monthlyBudget: parseFloat(monthlyBudget) || 120,
      dailyWaterGoalMl: parseInt(dailyWaterGoalMl, 10) || 2000,
      soundEnabled,
    });
    onClose();
  };

  const currencies = ['$', '€', 'S/.', 'MXN$', 'CLP$', 'COP$'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <User size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Perfil y Preferencias</h2>
              <p className="text-[11px] text-slate-400">Configuración de Huella Diaria</p>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
          {/* Role selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Tu Rol Principal</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('estudiante');
                  if (institutionOrCompany.includes('Empresa') || institutionOrCompany.includes('Oficina')) {
                    setInstitutionOrCompany('Universidad Central');
                  }
                  if (soundEnabled) playHapticSound('tap');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  role === 'estudiante'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap size={16} />
                <span>Estudiante</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('trabajador');
                  if (institutionOrCompany.includes('Universidad') || institutionOrCompany.includes('Campus')) {
                    setInstitutionOrCompany('Oficina Corporativa');
                  }
                  if (soundEnabled) playHapticSound('tap');
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition-all ${
                  role === 'trabajador'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase size={16} />
                <span>Trabajador</span>
              </button>
            </div>
          </div>

          {/* Name & Institution */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {role === 'estudiante' ? 'Universidad o Instituto' : 'Empresa o Lugar de Trabajo'}
            </label>
            <input
              type="text"
              value={institutionOrCompany}
              onChange={(e) => setInstitutionOrCompany(e.target.value)}
              placeholder={role === 'estudiante' ? 'Ej. Univ. Tecnológica' : 'Ej. Tech Solutions'}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Símbolo de Moneda</label>
            <div className="flex gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => {
                    setCurrency(curr);
                    if (soundEnabled) playHapticSound('tap');
                  }}
                  className={`flex-1 py-1.5 rounded-lg border text-center font-mono font-bold text-xs ${
                    currency === curr
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Presupuesto Diario</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">{currency}</span>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Presupuesto Mensual</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">{currency}</span>
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Daily Water Goal Input */}
          <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30">
            <label className="block text-cyan-300 font-semibold mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Droplets size={14} className="text-cyan-400" />
                <span>Meta de Hidratación Diaria</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{dailyWaterGoalMl} ml</span>
            </label>
            <input
              type="number"
              step="100"
              min="500"
              max="5000"
              value={dailyWaterGoalMl}
              onChange={(e) => setDailyWaterGoalMl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-200 font-mono focus:outline-none focus:border-cyan-400 text-xs"
            />
            <div className="flex gap-1 mt-1.5">
              {[1500, 2000, 2500, 3000].map((ml) => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => {
                    setDailyWaterGoalMl(ml.toString());
                    if (soundEnabled) playHapticSound('tap');
                  }}
                  className="flex-1 text-[9px] py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono"
                >
                  {ml}ml
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 size={16} className="text-emerald-400" />
              <div>
                <p className="text-slate-200 font-semibold">Respuesta Háptica / Sonidos</p>
                <p className="text-[10px] text-slate-400">Sensación táctil al registrar y navegar</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="accent-emerald-500 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Switch User / Logout Button */}
          {onLogout && (
            <div className="pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-amber-500/20"
              >
                <LogOut size={14} />
                <span>Cerrar Sesión / Cambiar de Usuario</span>
              </button>
            </div>
          )}

          {/* Reset Demo Data Button */}
          <div className="pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Deseas restaurar los datos de ejemplo iniciales?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/70 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Restaurar datos de prueba</span>
            </button>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
            >
              <Check size={16} />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
