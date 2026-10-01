import React, { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Droplets, 
  Leaf, 
  ArrowRight, 
  Check, 
  Sparkles, 
  User, 
  Building2, 
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { UserProfile } from '../../types';
import { SAMPLE_PROFILES } from '../../data/seedData';
import { playHapticSound } from '../../utils/haptics';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
  currentProfile?: UserProfile;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  // Start with null so the user must explicitly choose Estudiante, Trabajador or Custom
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  // Custom user form state
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<'estudiante' | 'trabajador'>('estudiante');
  const [institution, setInstitution] = useState<string>('');
  const [dailyBudget, setDailyBudget] = useState<string>('8.00');
  const [waterGoal, setWaterGoal] = useState<string>('2000');
  const [currency, setCurrency] = useState<string>('$');

  const selectedProfile = SAMPLE_PROFILES.find((p) => p.id === selectedProfileId);
  const isReadyToLogin = isCustomMode ? Boolean(name.trim()) : Boolean(selectedProfileId);

  const handleSelectSample = (profile: UserProfile) => {
    setSelectedProfileId(profile.id);
    setIsCustomMode(false);
    setSelectionError(null);
    if (profile.soundEnabled) playHapticSound('tap');
  };

  const handleStartSession = () => {
    if (isCustomMode) {
      if (!name.trim()) {
        setSelectionError('Por favor ingresa tu nombre para continuar');
        playHapticSound('error');
        return;
      }
      const customProfile: UserProfile = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@huelladiaria.app`,
        role,
        institutionOrCompany: institution.trim() || (role === 'estudiante' ? 'Universidad' : 'Empresa'),
        currency,
        dailyBudget: parseFloat(dailyBudget) || 10,
        monthlyBudget: (parseFloat(dailyBudget) || 10) * 20,
        dailyWaterGoalMl: parseInt(waterGoal, 10) || 2000,
        soundEnabled: true,
        isLoggedIn: true,
      };
      playHapticSound('success');
      onLogin(customProfile);
    } else {
      if (!selectedProfileId) {
        setSelectionError('Por favor selecciona si eres Estudiante o Trabajador');
        playHapticSound('error');
        return;
      }
      const selected = SAMPLE_PROFILES.find((p) => p.id === selectedProfileId);
      if (selected) {
        playHapticSound('success');
        onLogin({ ...selected, isLoggedIn: true });
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-slate-100 overflow-y-auto">
      {/* Brand Header */}
      <div className="pt-2 text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 mx-auto flex items-center justify-center shadow-xl shadow-emerald-950/80 ring-2 ring-emerald-400/40 relative">
          <span className="text-3xl">🌱</span>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-xs shadow-md border-2 border-slate-950">
            💧
          </div>
        </div>

        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 inline-block mb-1">
            Android Commuter Edition
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            HUELLA DIARIA
          </h1>
          <p className="text-xs text-slate-400 max-w-[280px] mx-auto mt-0.5 leading-relaxed">
            Movilidad inteligente, control de gastos y cuidado de tu salud en cada trayecto.
          </p>
        </div>
      </div>

      {/* Main Selection Area */}
      <div className="my-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">
            ¿Quién está utilizando la app?
          </span>
          <span className="text-[11px] text-emerald-400 font-medium">
            Selecciona tu perfil
          </span>
        </div>

        {/* 2 Quick Profile Cards: Estudiante vs Trabajador */}
        <div className="space-y-2.5">
          {SAMPLE_PROFILES.map((prof) => {
            const isSelected = !isCustomMode && selectedProfileId === prof.id;
            const isStudent = prof.role === 'estudiante';

            return (
              <div
                key={prof.id}
                onClick={() => handleSelectSample(prof)}
                className={`p-3.5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? isStudent
                      ? 'border-emerald-500 bg-emerald-950/40 shadow-lg shadow-emerald-950 ring-1 ring-emerald-400'
                      : 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-950 ring-1 ring-blue-400'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-md ${
                        isStudent
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                          : 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white'
                      }`}
                    >
                      {isStudent ? <GraduationCap size={22} /> : <Briefcase size={22} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-sm text-white">{prof.name}</h3>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md ${
                            isStudent
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {isStudent ? 'Estudiante' : 'Trabajador'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {prof.institutionOrCompany}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? isStudent
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : 'bg-blue-500 border-blue-400 text-white'
                          : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                </div>

                {/* Sub-features for the profile */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Wallet size={12} className={isStudent ? 'text-emerald-400' : 'text-blue-400'} />
                    <span>Límite: {prof.currency}{prof.dailyBudget.toFixed(2)}/día</span>
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400 font-medium">
                    <Droplets size={12} />
                    <span>Meta: {prof.dailyWaterGoalMl} ml de agua</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Option: Create Custom / Other user */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              setIsCustomMode(!isCustomMode);
              playHapticSound('toggle');
            }}
            className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isCustomMode
                ? 'bg-slate-800 text-emerald-400 border-emerald-500/50 shadow-md'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <User size={14} />
            <span>{isCustomMode ? 'Ocultar formulario nuevo' : '+ Ingresar con otro nombre / rol'}</span>
          </button>
        </div>

        {/* Custom User Form Drawer */}
        {isCustomMode && (
          <div className="p-3.5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in duration-200 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Mateo García"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">¿Qué rol cumples?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('estudiante')}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold ${
                    role === 'estudiante'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <GraduationCap size={15} />
                  <span>Estudiante</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('trabajador')}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold ${
                    role === 'trabajador'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Briefcase size={15} />
                  <span>Trabajador</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {role === 'estudiante' ? 'Universidad o Instituto' : 'Empresa u Oficina'}
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder={role === 'estudiante' ? 'Ej. Univ. Nacional' : 'Ej. Tech Services'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Límite Diario ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Droplets size={12} className="text-cyan-400" /> Meta Agua (ml)
                </label>
                <input
                  type="number"
                  step="100"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-cyan-300 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Health & Hydration Announcement Banner */}
        <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 text-lg">
            💧
          </div>
          <div>
            <h4 className="text-xs font-bold text-cyan-200">
              Nuevo: Cuidado de Salud e Hidratación
            </h4>
            <p className="text-[10px] text-cyan-300/80 leading-tight">
              Registra tu ingesta de agua durante tus traslados diarios para evitar fatiga y golpes de calor.
            </p>
          </div>
        </div>
      </div>

      {/* Start Button & Guidance */}
      <div className="pt-2 space-y-2">
        {selectionError && (
          <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold text-center animate-in fade-in">
            {selectionError}
          </div>
        )}

        <button
          onClick={handleStartSession}
          className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all text-sm font-black active:scale-98 ${
            isReadyToLogin
              ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-950 ring-2 ring-emerald-400/40 cursor-pointer'
              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer hover:bg-slate-750'
          }`}
        >
          <span>
            {isReadyToLogin
              ? isCustomMode
                ? `Ingresar como ${name.trim()} (${role === 'estudiante' ? 'Estudiante' : 'Trabajador'})`
                : selectedProfile
                ? `Ingresar como ${selectedProfile.role === 'estudiante' ? 'Estudiante' : 'Trabajador'} (${selectedProfile.name})`
                : 'Ingresar a Huella Diaria'
              : 'Elige tu perfil arriba para Ingresar'}
          </span>
          <ArrowRight size={18} className={isReadyToLogin ? 'translate-x-0.5' : 'opacity-40'} />
        </button>

        <p className="text-[10px] text-center text-slate-500">
          * Tu sesión se mantendrá en tu dispositivo. Puedes cambiar de perfil o cerrar sesión en cualquier momento.
        </p>
      </div>
    </div>
  );
};
