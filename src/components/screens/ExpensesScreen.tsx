import React, { useState } from 'react';
import { 
  Plus, 
  Fuel, 
  CreditCard, 
  Wallet, 
  Trash2, 
  Check, 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Filter,
  Layers,
  Sparkles,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod, UserProfile, AppTheme } from '../../types';
import { EXPENSE_CATEGORIES } from '../../utils/transportUtils';
import { ExpenseCategoryIcon } from '../TransportIcon';
import { playHapticSound } from '../../utils/haptics';

interface ExpensesScreenProps {
  expenses: Expense[];
  userProfile: UserProfile;
  theme?: AppTheme;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({
  expenses,
  userProfile,
  theme = 'dark',
  onAddExpense,
  onDeleteExpense,
}) => {
  const isDark = theme === 'dark';

  // Form State
  const [activeTypeTab, setActiveTypeTab] = useState<'pasaje' | 'gasolina' | 'peaje' | 'recarga' | 'otro'>('pasaje');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('pasaje_metro');
  const [amount, setAmount] = useState<string>('1.25');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tarjeta_transporte');
  const [fuelLiters, setFuelLiters] = useState<string>('15');
  const [note, setNote] = useState<string>('');
  const [isSuccessToast, setIsSuccessToast] = useState<string | null>(null);

  // Filter for history
  const [historyFilter, setHistoryFilter] = useState<'all' | 'transit' | 'fuel'>('all');

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];

  // Daily and monthly calculations
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const totalTodaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Current month expenses
  const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM
  const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthPrefix));
  const totalMonthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown: Pasajes, Combustible, Peajes
  const publicTransitSpent = monthExpenses
    .filter((e) => EXPENSE_CATEGORIES[e.category]?.isPublicTransit)
    .reduce((sum, e) => sum + e.amount, 0);

  const fuelSpent = monthExpenses
    .filter((e) => EXPENSE_CATEGORIES[e.category]?.isFuel)
    .reduce((sum, e) => sum + e.amount, 0);

  const peajesSpent = monthExpenses
    .filter((e) => e.category === 'peaje')
    .reduce((sum, e) => sum + e.amount, 0);

  const otherSpent = totalMonthSpent - publicTransitSpent - fuelSpent - peajesSpent;

  // Percentage of daily and monthly budget used (MetaPresupuesto)
  const dailyBudgetPercent = Math.min(100, Math.round((totalTodaySpent / userProfile.dailyBudget) * 100));
  const monthlyBudgetPercent = Math.round((totalMonthSpent / userProfile.monthlyBudget) * 100);

  // Budget alert flags
  const isWarningBudget = monthlyBudgetPercent >= 80 && monthlyBudgetPercent < 100;
  const isOverBudget = monthlyBudgetPercent >= 100;

  // Quick Amount presets
  const quickAmounts = activeTypeTab === 'gasolina'
    ? [10, 20, 30, 50]
    : activeTypeTab === 'peaje'
    ? [1.50, 2.50, 3.50, 5.00, 8.00]
    : [1.00, 1.25, 1.50, 2.50, 5.00, 10.00];

  const handleTypeTabChange = (type: 'pasaje' | 'gasolina' | 'peaje' | 'recarga' | 'otro') => {
    setActiveTypeTab(type);
    if (userProfile.soundEnabled) playHapticSound('tap');

    if (type === 'pasaje') {
      setSelectedCategory('pasaje_bus');
      setAmount('1.25');
      setPaymentMethod('tarjeta_transporte');
      setNote('Pasaje de transporte');
    } else if (type === 'gasolina') {
      setSelectedCategory('gasolina');
      setAmount('25.00');
      setPaymentMethod('tarjeta_debito');
      setNote('Carga de combustible');
    } else if (type === 'peaje') {
      setSelectedCategory('peaje');
      setAmount('2.50');
      setPaymentMethod('tarjeta_transporte');
      setNote('Pago de peaje en autopista');
    } else if (type === 'recarga') {
      setSelectedCategory('recarga_tarjeta');
      setAmount('15.00');
      setPaymentMethod('digital');
      setNote('Recarga de tarjeta de transporte');
    } else {
      setSelectedCategory('estacionamiento');
      setAmount('3.00');
      setPaymentMethod('efectivo');
      setNote('');
    }
  };

  const handleQuickAmountClick = (val: number) => {
    setAmount(val.toFixed(2));
    if (userProfile.soundEnabled) playHapticSound('tap');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    if (userProfile.soundEnabled) playHapticSound('success');

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddExpense({
      date: todayStr,
      time: timeStr,
      category: selectedCategory,
      amount: numAmount,
      paymentMethod,
      note: note.trim() || undefined,
      fuelLiters: selectedCategory === 'gasolina' && fuelLiters ? parseFloat(fuelLiters) : undefined,
    });

    const categoryLabel = EXPENSE_CATEGORIES[selectedCategory]?.label ?? 'Gasto';
    setIsSuccessToast(`¡${categoryLabel} de ${userProfile.currency}${numAmount.toFixed(2)} registrado!`);
    setTimeout(() => setIsSuccessToast(null), 3000);

    // Reset amount
    if (activeTypeTab === 'pasaje') setAmount('1.25');
    else if (activeTypeTab === 'gasolina') setAmount('20.00');
  };

  // Filtered expenses list
  const filteredHistory = expenses.filter((e) => {
    if (historyFilter === 'transit') return EXPENSE_CATEGORIES[e.category]?.isPublicTransit;
    if (historyFilter === 'fuel') return EXPENSE_CATEGORIES[e.category]?.isFuel;
    return true;
  });

  return (
    <div className="flex-1 p-4 space-y-4 pb-8">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider block">
            Control de Finanzas
          </span>
          <h2 className="text-base font-bold text-white leading-tight">
            Pasajes y Gasolina
          </h2>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Mes en curso</span>
          <span className="text-sm font-mono font-bold text-white">
            {userProfile.currency}{totalMonthSpent.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccessToast && (
        <div className="p-3 rounded-2xl bg-[#2ECC71]/20 border border-[#2ECC71]/40 text-[#2ECC71] text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-[#2ECC71]" />
            <span>{isSuccessToast}</span>
          </div>
          <span className="text-[10px] bg-[#2ECC71]/30 px-2 py-0.5 rounded-full font-mono">OK</span>
        </div>
      )}

      {/* Monthly Budget Alert Banners */}
      {isOverBudget && (
        <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <ShieldAlert size={18} className="text-rose-400 shrink-0" />
          <div>
            <p className="font-bold">¡Límite mensual excedido ({monthlyBudgetPercent}%)!</p>
            <p className="text-[10px] text-rose-300/80">
              Has gastado {userProfile.currency}{totalMonthSpent.toFixed(2)} de tu límite mensual de {userProfile.currency}{userProfile.monthlyBudget.toFixed(2)}.
            </p>
          </div>
        </div>
      )}

      {isWarningBudget && (
        <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertTriangle size={18} className="text-amber-400 shrink-0" />
          <div>
            <p className="font-bold">Atención: Cerca del límite mensual ({monthlyBudgetPercent}%)</p>
            <p className="text-[10px] text-amber-300/80">
              Te quedan {userProfile.currency}{(userProfile.monthlyBudget - totalMonthSpent).toFixed(2)} para lo que resta del mes.
            </p>
          </div>
        </div>
      )}

      {/* Budget & Spending Health Card */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-3 ${
        isDark 
          ? 'bg-gradient-to-br from-[#2C3E50] to-[#1A252F] border-slate-700/80 text-white' 
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Top: Daily Limit */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Wallet size={13} className="text-amber-400" /> Gasto de Hoy
            </span>
            <span className="font-mono">
              <strong className={totalTodaySpent > userProfile.dailyBudget ? 'text-rose-400' : 'text-[#2ECC71]'}>
                {userProfile.currency}{totalTodaySpent.toFixed(2)}
              </strong>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                {' '}/ {userProfile.currency}{userProfile.dailyBudget.toFixed(2)}
              </span>
            </span>
          </div>

          {/* Daily Progress bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                dailyBudgetPercent > 90
                  ? 'bg-rose-500'
                  : dailyBudgetPercent > 70
                  ? 'bg-amber-400'
                  : 'bg-[#2ECC71]'
              }`}
              style={{ width: `${dailyBudgetPercent}%` }}
            />
          </div>
          <div className={`flex justify-between text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>{dailyBudgetPercent}% del presupuesto diario</span>
            <span>
              {userProfile.dailyBudget - totalTodaySpent > 0
                ? `Te quedan ${userProfile.currency}${(userProfile.dailyBudget - totalTodaySpent).toFixed(2)}`
                : 'Exceso diario'}
            </span>
          </div>
        </div>

        {/* Monthly Limit Progress */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Layers size={13} className="text-blue-400" /> Consumo Mensual
            </span>
            <span className="font-mono">
              <strong className={monthlyBudgetPercent > 100 ? 'text-rose-400' : 'text-[#2ECC71]'}>
                {userProfile.currency}{totalMonthSpent.toFixed(2)}
              </strong>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                {' '}/ {userProfile.currency}{userProfile.monthlyBudget.toFixed(2)}
              </span>
            </span>
          </div>

          <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                monthlyBudgetPercent > 100
                  ? 'bg-rose-500'
                  : monthlyBudgetPercent > 80
                  ? 'bg-amber-400'
                  : 'bg-[#2ECC71]'
              }`}
              style={{ width: `${Math.min(100, monthlyBudgetPercent)}%` }}
            />
          </div>
          <div className={`flex justify-between text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span>{monthlyBudgetPercent}% consumido este mes</span>
            <span>
              {userProfile.monthlyBudget - totalMonthSpent > 0
                ? `Disponible: ${userProfile.currency}${(userProfile.monthlyBudget - totalMonthSpent).toFixed(2)}`
                : 'Límite superado'}
            </span>
          </div>
        </div>

        {/* Breakdown Pills: Transit vs Fuel vs Peajes */}
        <div className={`grid grid-cols-3 gap-2 pt-2 border-t ${isDark ? 'border-slate-700/80' : 'border-slate-200'}`}>
          <div className={`p-2 rounded-xl border ${
            isDark ? 'bg-[#1A252F] border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`flex items-center gap-1 text-[10px] mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>🚌</span> <span className="truncate">Pasajes</span>
            </div>
            <p className="text-xs font-black font-mono text-amber-400">
              {userProfile.currency}{publicTransitSpent.toFixed(2)}
            </p>
            <span className={`text-[8px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total mes</span>
          </div>

          <div className={`p-2 rounded-xl border ${
            isDark ? 'bg-[#1A252F] border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`flex items-center gap-1 text-[10px] mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>⛽</span> <span className="truncate">Gasolina</span>
            </div>
            <p className="text-xs font-black font-mono text-rose-400">
              {userProfile.currency}{fuelSpent.toFixed(2)}
            </p>
            <span className={`text-[8px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total mes</span>
          </div>

          <div className={`p-2 rounded-xl border ${
            isDark ? 'bg-[#1A252F] border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`flex items-center gap-1 text-[10px] mb-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <span>🛣️</span> <span className="truncate">Peajes</span>
            </div>
            <p className="text-xs font-black font-mono text-cyan-400">
              {userProfile.currency}{peajesSpent.toFixed(2)}
            </p>
            <span className={`text-[8px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total mes</span>
          </div>
        </div>
      </div>

      {/* METAPRESUPUESTO ALERTS BANNER */}
      {isOverBudget && (
        <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-start gap-2.5 text-rose-300 animate-pulse shadow-md shadow-rose-950/20">
          <ShieldAlert size={20} className="shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-black text-xs text-rose-200 flex items-center gap-1.5">
              <span>¡Alerta de MetaPresupuesto Superada!</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-100 font-mono">
                {monthlyBudgetPercent}%
              </span>
            </h4>
            <p className="text-[11px] text-rose-300 leading-snug">
              Has excedido tu presupuesto mensual por <strong>{userProfile.currency}{(totalMonthSpent - userProfile.monthlyBudget).toFixed(2)}</strong>. Te sugerimos priorizar transporte público o caminata.
            </p>
          </div>
        </div>
      )}

      {isWarningBudget && !isOverBudget && (
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-start gap-2.5 text-amber-200 shadow-sm">
          <AlertTriangle size={18} className="shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-xs text-amber-300">
              Alerta de Presupuesto: 80% Consumido
            </h4>
            <p className="text-[11px] text-amber-200/90 leading-snug">
              Has alcanzado el {monthlyBudgetPercent}% de tu cuota mensual. Te quedan <strong>{userProfile.currency}{(userProfile.monthlyBudget - totalMonthSpent).toFixed(2)}</strong> disponibles.
            </p>
          </div>
        </div>
      )}

      {/* FORMULARIO RÁPIDO DE PASAJES, GASOLINA Y PEAJES */}
      <div className={`p-4 rounded-3xl border shadow-md space-y-4 ${
        isDark ? 'bg-[#2C3E50] border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
            <Zap size={14} className="text-amber-400" />
            <span>Registro Rápido de Gastos</span>
          </h3>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold">
            Pasajes • Gasolina • Peajes
          </span>
        </div>

        {/* Tab switch: Pasajes vs Gasolina vs Peajes vs Recargas vs Otros */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleTypeTabChange('pasaje')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeTypeTab === 'pasaje'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm leading-none">🚌</span>
            <span className="truncate">Pasajes</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeTabChange('gasolina')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeTypeTab === 'gasolina'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm leading-none">⛽</span>
            <span className="truncate">Gasolina</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeTabChange('peaje')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeTypeTab === 'peaje'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm leading-none">🛣️</span>
            <span className="truncate">Peaje</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeTabChange('recarga')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeTypeTab === 'recarga'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm leading-none">💳</span>
            <span className="truncate">Recargas</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeTabChange('otro')}
            className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-0.5 transition-all ${
              activeTypeTab === 'otro'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-sm leading-none">🅿️</span>
            <span className="truncate">Otros</span>
          </button>
        </div>

        {/* Sub-Category selector within active tab */}
        {activeTypeTab === 'peaje' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('peaje');
                setNote('Peaje autopista urbana');
                if (userProfile.soundEnabled) playHapticSound('tap');
              }}
              className="p-2.5 rounded-xl border border-cyan-500 bg-cyan-500/10 text-white ring-1 ring-cyan-400 flex items-center gap-2 text-xs font-semibold"
            >
              <span className="text-lg">🛣️</span>
              <div className="text-left">
                <p className="leading-tight">Peaje Urbano</p>
                <span className="text-[10px] text-cyan-300">Autopista / TAG</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('peaje');
                setNote('Peaje troncal interurbano');
                if (userProfile.soundEnabled) playHapticSound('tap');
              }}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/40 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold"
            >
              <span className="text-lg">🚧</span>
              <div className="text-left">
                <p className="leading-tight">Peaje Troncal</p>
                <span className="text-[10px] text-slate-400">Ruta interprovincial</span>
              </div>
            </button>
          </div>
        )}

        {/* Sub-Category selector within active tab */}
        {activeTypeTab === 'pasaje' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('pasaje_bus');
                if (userProfile.soundEnabled) playHapticSound('tap');
              }}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                selectedCategory === 'pasaje_bus'
                  ? 'border-amber-500 bg-amber-500/20 text-white ring-1 ring-amber-400'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400'
              }`}
            >
              <span className="text-lg">🚌</span>
              <div className="text-left">
                <p className="leading-tight">Autobús / Colectivo</p>
                <span className="text-[10px] text-slate-400">Ruta urbana</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('pasaje_metro');
                if (userProfile.soundEnabled) playHapticSound('tap');
              }}
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                selectedCategory === 'pasaje_metro'
                  ? 'border-emerald-500 bg-emerald-500/20 text-white ring-1 ring-emerald-400'
                  : 'border-slate-800 bg-slate-800/40 text-slate-400'
              }`}
            >
              <span className="text-lg">🚇</span>
              <div className="text-left">
                <p className="leading-tight">Metro / Tren Ligero</p>
                <span className="text-[10px] text-slate-400">Vía rápida</span>
              </div>
            </button>
          </div>
        )}

        {activeTypeTab === 'otro' && (
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { cat: 'estacionamiento' as ExpenseCategory, label: 'Parqueo', emoji: '🅿️' },
              { cat: 'peaje' as ExpenseCategory, label: 'Peaje', emoji: '🛣️' },
              { cat: 'taxi' as ExpenseCategory, label: 'Taxi / VTC', emoji: '🚕' },
            ].map((item) => (
              <button
                key={item.cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(item.cat);
                  if (userProfile.soundEnabled) playHapticSound('tap');
                }}
                className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                  selectedCategory === item.cat
                    ? 'border-emerald-500 bg-emerald-500/20 text-white ring-1 ring-emerald-400'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="text-base mb-0.5">{item.emoji}</div>
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input: Amount with big number */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-1">
              <span>Monto a Registrar ({userProfile.currency})</span>
              {activeTypeTab === 'gasolina' && (
                <span className="text-rose-400 font-mono text-[11px]">
                  {fuelLiters ? `~${fuelLiters} Litros` : ''}
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-lg font-black text-slate-400 font-mono">
                {userProfile.currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.05"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl py-3 pl-9 pr-3 text-xl font-black text-white font-mono shadow-inner outline-none"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuickAmountClick(q)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-colors ${
                    parseFloat(amount) === q
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  +{userProfile.currency}{q.toFixed(q % 1 === 0 ? 0 : 2)}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Fuel Liters Input */}
          {activeTypeTab === 'gasolina' && (
            <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Litros aproximados
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(e.target.value)}
                  placeholder="Litros"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono text-xs"
                />
              </div>
              <div className="flex flex-col justify-center text-[10px] text-slate-400">
                <span className="font-semibold text-rose-300">Precio promedio:</span>
                <span>
                  {parseFloat(amount) > 0 && parseFloat(fuelLiters) > 0
                    ? `${userProfile.currency}${(parseFloat(amount) / parseFloat(fuelLiters)).toFixed(2)} / litro`
                    : 'Ingresa litros para calcular'}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Método de Pago
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'tarjeta_transporte' as PaymentMethod, label: 'Pase / Tarjeta', icon: '💳' },
                { id: 'efectivo' as PaymentMethod, label: 'Efectivo', icon: '💵' },
                { id: 'tarjeta_debito' as PaymentMethod, label: 'Débito/Créd.', icon: '🏦' },
                { id: 'digital' as PaymentMethod, label: 'Billetera', icon: '📱' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(m.id);
                    if (userProfile.soundEnabled) playHapticSound('tap');
                  }}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    paymentMethod === m.id
                      ? 'border-amber-400 bg-amber-500/20 text-white font-bold'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <span className="text-sm block">{m.icon}</span>
                  <span className="text-[9px] leading-tight block truncate">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Note */}
          <div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota opcional (ej. Recarga quincenal, Gasolinera Shell)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-slate-950 font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-950 transition-all text-xs"
          >
            <Plus size={18} strokeWidth={3} />
            <span>Registrar Gasto Inmediato</span>
          </button>
        </form>
      </div>

      {/* HISTORIAL DE GASTOS */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white">Historial de Gastos</span>
            <span className="text-[10px] text-slate-400">({filteredHistory.length})</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-[10px]">
            <button
              onClick={() => setHistoryFilter('all')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                historyFilter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setHistoryFilter('transit')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                historyFilter === 'transit'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Pasajes
            </button>
            <button
              onClick={() => setHistoryFilter('fuel')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-colors ${
                historyFilter === 'fuel'
                  ? 'bg-rose-500/20 text-rose-300 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Gasolina
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            No hay gastos que coincidan con el filtro seleccionado.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map((exp) => {
              const catMeta = EXPENSE_CATEGORIES[exp.category];
              return (
                <div
                  key={exp.id}
                  className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-base border border-slate-700/60 shrink-0">
                      {catMeta?.emoji ?? '💵'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {catMeta?.label ?? exp.category}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {exp.date} • {exp.time} {exp.note ? `• ${exp.note}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-white block">
                        -{userProfile.currency}{exp.amount.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-400 capitalize">
                        {exp.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (userProfile.soundEnabled) playHapticSound('delete');
                        onDeleteExpense(exp.id);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                      title="Eliminar gasto"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
