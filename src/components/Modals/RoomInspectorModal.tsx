import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Code2, 
  Table, 
  Play, 
  Copy, 
  Check, 
  Sparkles, 
  Terminal,
  Cpu
} from 'lucide-react';
import { Trip, Expense, MetaPresupuesto, UserProfile } from '../../types';
import { TrayectoDao, GastoDao, MetaPresupuestoDao, JETPACK_COMPOSE_SNIPPETS } from '../../db/roomDatabase';
import { playHapticSound } from '../../utils/haptics';

interface RoomInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: Trip[];
  expenses: Expense[];
  userProfile?: UserProfile;
  soundEnabled: boolean;
}

export const RoomInspectorModal: React.FC<RoomInspectorModalProps> = ({
  isOpen,
  onClose,
  trips,
  expenses,
  userProfile,
  soundEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'queries' | 'compose'>('tables');
  const [selectedTable, setSelectedTable] = useState<'trayecto' | 'gasto' | 'meta_presupuesto'>('trayecto');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentMonthStr = new Date().toISOString().substring(0, 7);

  const budgetEntity: MetaPresupuesto = {
    id: `budget-${currentMonthStr}`,
    month: currentMonthStr,
    dailyLimit: userProfile?.dailyBudget ?? 10.0,
    monthlyLimit: userProfile?.monthlyBudget ?? 180.0,
    warningThresholdPercent: 80,
    alertThresholdPercent: 100,
  };

  const trayectoDao = new TrayectoDao(trips);
  const gastoDao = new GastoDao(expenses);
  const metaPresupuestoDao = new MetaPresupuestoDao(budgetEntity);

  const avgDuration = trayectoDao.getAverageDurationMinutes();
  const totalDistance = trayectoDao.getTotalDistanceKm();
  const totalCO2 = trayectoDao.getTotalCO2Kg();
  const totalCO2Saved = trayectoDao.getTotalCO2SavedKg();

  const monthExpensesSum = gastoDao.getMonthExpensesSum(currentMonthStr);
  const expensesByCategory = gastoDao.getExpensesByCategory(currentMonthStr);
  const activeBudget = metaPresupuestoDao.getBudget();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    if (soundEnabled) playHapticSound('success');
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#2C3E50] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-700/80 flex items-center justify-between bg-[#1A252F]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#2ECC71]/20 text-[#2ECC71]">
              <Database size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Room Database & Jetpack Compose</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2ECC71]/20 text-[#2ECC71] font-mono">
                  v1.0
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">Inspector de entidades Room, DAOs y código Jetpack Compose</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (soundEnabled) playHapticSound('tap');
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-700/80 bg-[#243342] text-xs">
          <button
            onClick={() => {
              setActiveTab('tables');
              if (soundEnabled) playHapticSound('tap');
            }}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'tables'
                ? 'border-[#2ECC71] text-[#2ECC71] bg-[#1A252F]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Table size={14} />
            <span>Tablas Room ({trips.length + expenses.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('queries');
              if (soundEnabled) playHapticSound('tap');
            }}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'queries'
                ? 'border-[#2ECC71] text-[#2ECC71] bg-[#1A252F]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Terminal size={14} />
            <span>Consultas DAO</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('compose');
              if (soundEnabled) playHapticSound('tap');
            }}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'compose'
                ? 'border-[#2ECC71] text-[#2ECC71] bg-[#1A252F]'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Code2 size={14} />
            <span>Código Compose</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs bg-[#1A252F]">
          {/* TAB 1: ROOM TABLES */}
          {activeTab === 'tables' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setSelectedTable('trayecto')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedTable === 'trayecto'
                      ? 'border-[#2ECC71] bg-[#2ECC71]/10 text-white'
                      : 'border-slate-700 bg-[#2C3E50] text-slate-400'
                  }`}
                >
                  <p className="font-bold text-white text-[11px] truncate">@Entity "trayecto"</p>
                  <p className="text-[9px] text-slate-400">{trips.length} filas</p>
                </button>

                <button
                  onClick={() => setSelectedTable('gasto')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedTable === 'gasto'
                      ? 'border-[#2ECC71] bg-[#2ECC71]/10 text-white'
                      : 'border-slate-700 bg-[#2C3E50] text-slate-400'
                  }`}
                >
                  <p className="font-bold text-white text-[11px] truncate">@Entity "gasto"</p>
                  <p className="text-[9px] text-slate-400">{expenses.length} filas</p>
                </button>

                <button
                  onClick={() => setSelectedTable('meta_presupuesto')}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    selectedTable === 'meta_presupuesto'
                      ? 'border-[#2ECC71] bg-[#2ECC71]/10 text-white'
                      : 'border-slate-700 bg-[#2C3E50] text-slate-400'
                  }`}
                >
                  <p className="font-bold text-white text-[11px] truncate">@Entity "meta"</p>
                  <p className="text-[9px] text-slate-400">1 meta activa</p>
                </button>
              </div>

              {/* Table Data Preview */}
              <div className="bg-[#2C3E50] border border-slate-700 rounded-2xl p-2 overflow-x-auto">
                <table className="w-full text-[10px] text-left">
                  <thead>
                    <tr className="border-b border-slate-600 text-slate-400">
                      {selectedTable === 'trayecto' ? (
                        <>
                          <th className="p-1">Fecha</th>
                          <th className="p-1">Modo</th>
                          <th className="p-1">Ruta</th>
                          <th className="p-1">Km</th>
                          <th className="p-1">Min</th>
                          <th className="p-1">CO2</th>
                        </>
                      ) : selectedTable === 'gasto' ? (
                        <>
                          <th className="p-1">Fecha</th>
                          <th className="p-1">Categoría</th>
                          <th className="p-1">Monto</th>
                          <th className="p-1">Método</th>
                          <th className="p-1">Nota</th>
                        </>
                      ) : (
                        <>
                          <th className="p-1">Mes</th>
                          <th className="p-1">Límite Diario</th>
                          <th className="p-1">Límite Mensual</th>
                          <th className="p-1">Aviso (80%)</th>
                          <th className="p-1">Alerta (100%)</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-mono">
                    {selectedTable === 'trayecto' ? (
                      trips.slice(0, 6).map((t) => (
                        <tr key={t.id} className="text-slate-300">
                          <td className="p-1 text-slate-400">{t.date}</td>
                          <td className="p-1 text-[#2ECC71] font-bold">{t.mode}</td>
                          <td className="p-1 truncate max-w-[120px]">{t.origin} ➔ {t.destination}</td>
                          <td className="p-1">{t.distanceKm}k</td>
                          <td className="p-1">{t.durationMinutes}m</td>
                          <td className="p-1">{t.co2Kg}kg</td>
                        </tr>
                      ))
                    ) : selectedTable === 'gasto' ? (
                      expenses.slice(0, 6).map((e) => (
                        <tr key={e.id} className="text-slate-300">
                          <td className="p-1 text-slate-400">{e.date}</td>
                          <td className="p-1 text-amber-400 font-bold">{e.category}</td>
                          <td className="p-1 font-bold">${e.amount.toFixed(2)}</td>
                          <td className="p-1 capitalize">{e.paymentMethod}</td>
                          <td className="p-1 truncate max-w-[100px]">{e.note || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="text-slate-300">
                        <td className="p-1 text-[#2ECC71] font-bold">{activeBudget.month}</td>
                        <td className="p-1 font-mono">${activeBudget.dailyLimit.toFixed(2)}</td>
                        <td className="p-1 font-mono text-cyan-400">${activeBudget.monthlyLimit.toFixed(2)}</td>
                        <td className="p-1 text-amber-400 font-bold">{activeBudget.warningThresholdPercent}%</td>
                        <td className="p-1 text-rose-400 font-bold">{activeBudget.alertThresholdPercent}%</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ROOM DAO QUERIES */}
          {activeTab === 'queries' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-[#2C3E50] border border-slate-700 space-y-1">
                <span className="text-[10px] text-[#2ECC71] font-mono font-bold block">
                  @Query("SELECT AVG(durationMinutes) FROM trayecto")
                </span>
                <p className="text-sm font-black font-mono text-white">
                  {avgDuration} minutos en promedio
                </p>
                <span className="text-[9px] text-slate-400">Calculado sobre {trips.length} trayectos</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#2C3E50] border border-slate-700 space-y-1">
                <span className="text-[10px] text-[#2ECC71] font-mono font-bold block">
                  @Query("SELECT SUM(amount) FROM gasto WHERE strftime('%Y-%m', date) = :month")
                </span>
                <p className="text-sm font-black font-mono text-white">
                  ${monthExpensesSum.toFixed(2)} acumulados en {currentMonthStr}
                </p>
                <span className="text-[9px] text-slate-400">Total gastado en movilidad este mes</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#2C3E50] border border-slate-700 space-y-1">
                <span className="text-[10px] text-[#2ECC71] font-mono font-bold block">
                  @Query("SELECT SUM(distanceKm), SUM(co2Kg), SUM(co2SavedKg) FROM trayecto")
                </span>
                <div className="grid grid-cols-3 gap-1 pt-0.5 text-slate-300 font-mono text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block">Distancia</span>
                    <strong>{totalDistance} km</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">CO2 Real</span>
                    <strong className="text-emerald-400">{totalCO2} kg</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">CO2 Ahorrado</span>
                    <strong className="text-cyan-400">+{totalCO2Saved} kg</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#2C3E50] border border-slate-700 space-y-1">
                <span className="text-[10px] text-[#2ECC71] font-mono font-bold block">
                  @Query("SELECT * FROM meta_presupuesto WHERE month = :month LIMIT 1")
                </span>
                <p className="text-sm font-black font-mono text-white">
                  Meta: ${activeBudget.monthlyLimit.toFixed(2)}/mes • Límite Diario: ${activeBudget.dailyLimit.toFixed(2)}
                </p>
                <div className="flex gap-2 text-[9px] text-slate-300 font-mono pt-0.5">
                  <span className="text-amber-400">Umbral Aviso: {activeBudget.warningThresholdPercent}%</span>
                  <span className="text-rose-400">Umbral Alerta: {activeBudget.alertThresholdPercent}%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JETPACK COMPOSE CODE */}
          {activeTab === 'compose' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Archivos Kotlin para Android Studio</span>
                <span className="text-[10px] text-[#2ECC71]">Jetpack Compose & Room</span>
              </div>

              {/* Snippet: BottomNavigationBar */}
              <div className="p-3 rounded-2xl bg-[#2C3E50] border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#2ECC71]">
                    HuellaDiariaBottomNavigation.kt
                  </span>
                  <button
                    onClick={() => handleCopy(JETPACK_COMPOSE_SNIPPETS.navigationBar, 'nav')}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center gap-1 text-[10px]"
                  >
                    {copiedKey === 'nav' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'nav' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <pre className="text-[9px] font-mono text-slate-300 bg-[#1A252F] p-2 rounded-xl overflow-x-auto max-h-36">
                  {JETPACK_COMPOSE_SNIPPETS.navigationBar}
                </pre>
              </div>

              {/* Snippet: Room Entities & DAO */}
              <div className="p-3 rounded-2xl bg-[#2C3E50] border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#2ECC71]">
                    AppDatabase.kt (Entities & DAOs)
                  </span>
                  <button
                    onClick={() => handleCopy(JETPACK_COMPOSE_SNIPPETS.roomEntities, 'room')}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center gap-1 text-[10px]"
                  >
                    {copiedKey === 'room' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'room' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <pre className="text-[9px] font-mono text-slate-300 bg-[#1A252F] p-2 rounded-xl overflow-x-auto max-h-36">
                  {JETPACK_COMPOSE_SNIPPETS.roomEntities}
                </pre>
              </div>

              {/* Snippet: Theme */}
              <div className="p-3 rounded-2xl bg-[#2C3E50] border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#2ECC71]">
                    Theme.kt (#2ECC71 & #2C3E50)
                  </span>
                  <button
                    onClick={() => handleCopy(JETPACK_COMPOSE_SNIPPETS.themeConfig, 'theme')}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center gap-1 text-[10px]"
                  >
                    {copiedKey === 'theme' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copiedKey === 'theme' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <pre className="text-[9px] font-mono text-slate-300 bg-[#1A252F] p-2 rounded-xl overflow-x-auto max-h-28">
                  {JETPACK_COMPOSE_SNIPPETS.themeConfig}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
