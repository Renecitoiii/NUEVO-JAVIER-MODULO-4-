/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trip, Expense, UserProfile, ScreenTab, TransportMode, WaterLog, AppTheme } from './types';
import { 
  getInitialTrips, 
  getInitialExpenses, 
  getInitialWaterLogs, 
  INITIAL_USER_PROFILE, 
  getTodayDateString 
} from './data/seedData';
import { calculateTripCO2 } from './utils/transportUtils';
import { AndroidFrame } from './components/AndroidFrame';
import { BottomNavigation } from './components/BottomNavigation';
import { HomeScreen } from './components/screens/HomeScreen';
import { ExpensesScreen } from './components/screens/ExpensesScreen';
import { ImpactScreen } from './components/screens/ImpactScreen';
import { NewTripModal } from './components/Modals/NewTripModal';
import { ProfileModal } from './components/Modals/ProfileModal';
import { RoomInspectorModal } from './components/Modals/RoomInspectorModal';
import { LoginScreen } from './components/Auth/LoginScreen';

const STORAGE_KEYS = {
  TRIPS: 'huella_diaria_trips_v1',
  EXPENSES: 'huella_diaria_expenses_v1',
  PROFILE: 'huella_diaria_profile_v1',
  WATER: 'huella_diaria_water_v1',
  THEME: 'huella_diaria_theme_v1',
  CURRENT_TAB: 'huella_diaria_current_tab_v1',
};

export default function App() {
  // Navigation State: 'inicio' | 'gastos' | 'impacto'
  // Persisted in localStorage so it stays strictly on the user's chosen section
  const [currentTab, setCurrentTab] = useState<ScreenTab>(() => {
    try {
      const savedTab = localStorage.getItem(STORAGE_KEYS.CURRENT_TAB);
      if (savedTab === 'inicio' || savedTab === 'gastos' || savedTab === 'impacto') {
        return savedTab as ScreenTab;
      }
    } catch {
      // ignore
    }
    return 'inicio';
  });

  // Save current tab whenever user manually changes it
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_TAB, currentTab);
    } catch {
      // ignore
    }
  }, [currentTab]);

  // Selected date for viewing / filtering trips
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString(0));

  // Modal States
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isRoomInspectorOpen, setIsRoomInspectorOpen] = useState<boolean>(false);

  // App Theme State: Dark / Light with emerald #2ECC71 and surface #2C3E50
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    } catch {
      // ignore
    }
    return 'dark';
  });

  // User Profile State: Loaded from localStorage, starts at Login if not logged in
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      ...INITIAL_USER_PROFILE,
      isLoggedIn: false,
    };
  });

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

  // Water Logs State with localStorage persistence
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getInitialWaterLogs();
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

  // Save water logs to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(waterLogs));
    } catch {
      // quota or private browsing
    }
  }, [waterLogs]);

  // Save theme to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // --- WATER / HYDRATION ACTIONS ---
  const handleAddWater = (
    amountMl: number, 
    context: 'durante_viaje' | 'antes_viaje' | 'llegada' | 'rutina' = 'durante_viaje', 
    note?: string
  ) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: WaterLog = {
      id: `water-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      date: getTodayDateString(0),
      time: timeStr,
      amountMl,
      context,
      note,
    };
    setWaterLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteWater = (id: string) => {
    setWaterLogs((prev) => prev.filter((w) => w.id !== id));
  };

  // --- TRIP ACTIONS ---
  const handleSaveTrip = (newTripData: Omit<Trip, 'id'>) => {
    const newTrip: Trip = {
      ...newTripData,
      id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setTrips((prev) => [newTrip, ...prev]);

    // If trip included water intake, automatically log water consumption!
    if (newTrip.waterIntakeMl && newTrip.waterIntakeMl > 0) {
      handleAddWater(
        newTrip.waterIntakeMl, 
        'durante_viaje', 
        `En trayecto: ${newTrip.origin} ➔ ${newTrip.destination}`
      );
    }

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
      waterIntakeMl: 250, // automatically suggest hydration for commute
    };

    setTrips((prev) => [quickTrip, ...prev]);

    // Also auto log hydration
    handleAddWater(250, 'durante_viaje', `Ruta rápida: ${origin} ➔ ${dest}`);

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

  // --- PROFILE & AUTH ACTIONS ---
  const handleLogin = (profile: UserProfile) => {
    const updated: UserProfile = {
      ...profile,
      isLoggedIn: true,
    };
    setUserProfile(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    const loggedOut: UserProfile = {
      ...userProfile,
      isLoggedIn: false,
    };
    setUserProfile(loggedOut);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(loggedOut));
      localStorage.setItem(STORAGE_KEYS.CURRENT_TAB, 'inicio');
    } catch {
      // ignore
    }
    setCurrentTab('inicio');
  };

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
      localStorage.removeItem(STORAGE_KEYS.WATER);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_TAB);
    } catch {
      // ignore
    }
    setTrips(getInitialTrips());
    setExpenses(getInitialExpenses());
    setWaterLogs(getInitialWaterLogs());
    setUserProfile({
      ...INITIAL_USER_PROFILE,
      isLoggedIn: false,
    });
    setCurrentTab('inicio');
  };

  // Today's summary for badges
  const todayStr = getTodayDateString(0);
  const tripsTodayCount = trips.filter((t) => t.date === todayStr).length;
  const expensesTodayTotal = expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  // If user is not logged in, render the login / welcome screen inside Android frame
  if (!userProfile.isLoggedIn) {
    return (
      <AndroidFrame
        userProfile={userProfile}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenProfile={() => {}}
        onToggleSound={handleToggleSound}
        currentTab="inicio"
      >
        <LoginScreen onLogin={handleLogin} currentProfile={userProfile} />
      </AndroidFrame>
    );
  }

  return (
    <AndroidFrame
      userProfile={userProfile}
      theme={theme}
      onToggleTheme={handleToggleTheme}
      onOpenRoomInspector={() => setIsRoomInspectorOpen(true)}
      onOpenProfile={() => setIsProfileModalOpen(true)}
      onToggleSound={handleToggleSound}
      onLogout={handleLogout}
      currentTab={currentTab}
      bottomBar={
        <BottomNavigation
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          tripsTodayCount={tripsTodayCount}
          expensesTodayAmount={expensesTodayTotal}
          currency={userProfile.currency}
          soundEnabled={userProfile.soundEnabled}
          theme={theme}
        />
      }
    >
      {/* PERSISTENT SCREEN VIEWPORTS (KEPT MOUNTED TO PRESERVE STATE AND PREVENT RESETS) */}
      <div className={currentTab === 'inicio' ? 'flex-1 flex flex-col' : 'hidden'}>
        <HomeScreen
          trips={trips}
          userProfile={userProfile}
          waterLogs={waterLogs}
          selectedDate={selectedDate}
          theme={theme}
          onSelectDate={setSelectedDate}
          onOpenNewTripModal={() => setIsNewTripModalOpen(true)}
          onDeleteTrip={handleDeleteTrip}
          onDuplicateTrip={handleDuplicateTrip}
          onQuickLog={handleQuickLogTrip}
          onAddWater={handleAddWater}
          onDeleteWater={handleDeleteWater}
          expensesTodayTotal={expensesTodayTotal}
        />
      </div>

      <div className={currentTab === 'gastos' ? 'flex-1 flex flex-col' : 'hidden'}>
        <ExpensesScreen
          expenses={expenses}
          userProfile={userProfile}
          theme={theme}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      </div>

      <div className={currentTab === 'impacto' ? 'flex-1 flex flex-col' : 'hidden'}>
        <ImpactScreen
          trips={trips}
          userProfile={userProfile}
          waterLogs={waterLogs}
          theme={theme}
        />
      </div>

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
        onLogout={handleLogout}
      />

      {/* ROOM DATABASE & JETPACK COMPOSE INSPECTOR MODAL */}
      <RoomInspectorModal
        isOpen={isRoomInspectorOpen}
        onClose={() => setIsRoomInspectorOpen(false)}
        trips={trips}
        expenses={expenses}
        userProfile={userProfile}
        soundEnabled={userProfile.soundEnabled}
      />
    </AndroidFrame>
  );
}
