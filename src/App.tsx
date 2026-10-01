/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trip, Expense, UserProfile, ScreenTab, TransportMode } from './types';
import { getInitialTrips, getInitialExpenses, INITIAL_USER_PROFILE, getTodayDateString } from './data/seedData';
import { calculateTripCO2 } from './utils/transportUtils';
import { AndroidFrame } from './components/AndroidFrame';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './components/screens/HomeScreen';
import { ExpensesScreen } from './components/screens/ExpensesScreen';
import { ImpactScreen } from './components/screens/ImpactScreen';
import { NewTripModal } from './components/Modals/NewTripModal';
import { ProfileModal } from './components/Modals/ProfileModal';

const STORAGE_KEYS = {
  TRIPS: 'huella_diaria_trips_v1',
  EXPENSES: 'huella_diaria_expenses_v1',
  PROFILE: 'huella_diaria_profile_v1',
};

export default function App() {
  // Navigation State: 'inicio' | 'gastos' | 'impacto'
  const [currentTab, setCurrentTab] = useState<ScreenTab>('inicio');

  // Selected date for viewing / filtering trips
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString(0));

  // Modal States
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Trips State with localStorage persistence
  const [trips, setTrips] = useState<Trip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRIPS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getInitialTrips();
  });

  // Expenses State with localStorage persistence
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getInitialExpenses();
  });

  // User Profile State with localStorage persistence
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_USER_PROFILE;
  });

  // Save trips to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
    } catch {
      // quota or private browsing
    }
  }, [trips]);

  // Save expenses to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch {
      // quota or private browsing
    }
  }, [expenses]);

  // Save profile to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
    } catch {
      // quota or private browsing
    }
  }, [userProfile]);

  // --- TRIP ACTIONS ---
  const handleSaveTrip = (newTripData: Omit<Trip, 'id'>) => {
    const newTrip: Trip = {
      ...newTripData,
      id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTrips((prev) => [newTrip, ...prev]);

    // If trip had a cost, automatically log corresponding expense in Gastos!
    if (newTrip.cost && newTrip.cost > 0) {
      const expenseCategory = newTrip.mode === 'metro' 
        ? 'pasaje_metro' 
        : newTrip.mode === 'bus' 
        ? 'pasaje_bus' 
        : newTrip.mode === 'car' 
        ? 'gasolina' 
        : 'pasaje_bus';

      const newExpense: Expense = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: newTrip.date,
        time: newTrip.time,
        category: expenseCategory,
        amount: newTrip.cost,
        paymentMethod: 'tarjeta_transporte',
        note: `Trayecto: ${newTrip.origin} ➔ ${newTrip.destination}`,
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
  };

  const handleDeleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDuplicateTrip = (tripToDuplicate: Trip) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const duplicated: Trip = {
      ...tripToDuplicate,
      id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: getTodayDateString(0),
      time: timeStr,
    };
    setTrips((prev) => [duplicated, ...prev]);
  };

  const handleQuickLogTrip = (
    mode: TransportMode,
    origin: string,
    dest: string,
    km: number,
    min: number,
    cost: number
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const { co2Kg, co2SavedKg } = calculateTripCO2(mode, km);

    const quickTrip: Trip = {
      id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: getTodayDateString(0),
      time: timeStr,
      origin,
      destination: dest,
      mode,
      distanceKm: km,
      durationMinutes: min,
      purpose: userProfile.role === 'estudiante' ? 'estudio' : 'trabajo',
      cost,
      co2Kg,
      co2SavedKg,
    };

    setTrips((prev) => [quickTrip, ...prev]);

    // Also register the expense if cost > 0
    if (cost > 0) {
      const expCategory = mode === 'metro' ? 'pasaje_metro' : 'pasaje_bus';
      const autoExp: Expense = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: getTodayDateString(0),
        time: timeStr,
        category: expCategory,
        amount: cost,
        paymentMethod: 'tarjeta_transporte',
        note: `Ruta rápida: ${origin} ➔ ${dest}`,
      };
      setExpenses((prev) => [autoExp, ...prev]);
    }
  };

  // --- EXPENSE ACTIONS ---
  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // --- PROFILE & SETTINGS ACTIONS ---
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const handleToggleSound = () => {
    setUserProfile((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleResetData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRIPS);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    } catch {
      // ignore
    }
    setTrips(getInitialTrips());
    setExpenses(getInitialExpenses());
    setUserProfile(INITIAL_USER_PROFILE);
  };

  // Today's summary for badges
  const todayStr = getTodayDateString(0);
  const tripsTodayCount = trips.filter((t) => t.date === todayStr).length;
  const expensesTodayTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <AndroidFrame
      userProfile={userProfile}
      onOpenProfile={() => setIsProfileModalOpen(true)}
      onToggleSound={handleToggleSound}
      currentTab={currentTab}
    >
      {/* SCREEN NAVIGATION CONTROLLER */}
      {currentTab === 'inicio' && (
        <HomeScreen
          trips={trips}
          userProfile={userProfile}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
          onDeleteTrip={handleDeleteTrip}
          onDuplicateTrip={handleDuplicateTrip}
          onQuickLog={handleQuickLogTrip}
          expensesTodayTotal={expensesTodayTotal}
        />
      )}

      {currentTab === 'gastos' && (
        <ExpensesScreen
          expenses={expenses}
          userProfile={userProfile}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      )}

      {currentTab === 'impacto' && (
        <ImpactScreen
          trips={trips}
          userProfile={userProfile}
        />
      )}

      {/* ANDROID BOTTOM NAVIGATION BAR */}
      <BottomNavigation
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        tripsTodayCount={tripsTodayCount}
        expensesTodayAmount={expensesTodayTotal}
        currency={userProfile.currency}
        soundEnabled={userProfile.soundEnabled}
      />

      {/* MODALS */}
      <NewTripModal
        isOpen={isNewTripModalOpen}
        onClose={() => setIsNewTripModalOpen(false)}
        onSaveTrip={handleSaveTrip}
        currency={userProfile.currency}
        role={userProfile.role}
        soundEnabled={userProfile.soundEnabled}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        onResetData={handleResetData}
      />
    </AndroidFrame>
  );
}
