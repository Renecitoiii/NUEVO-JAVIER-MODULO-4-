export type TransportMode = 
  | 'metro' 
  | 'bus' 
  | 'car' 
  | 'motorcycle' 
  | 'bicycle' 
  | 'walking' 
  | 'scooter' 
  | 'taxi';

export type TripPurpose = 'estudio' | 'trabajo' | 'personal' | 'retorno';

export interface Trip {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  origin: string;
  destination: string;
  mode: TransportMode;
  distanceKm: number;
  durationMinutes: number;
  purpose: TripPurpose;
  cost?: number;
  co2Kg: number;
  co2SavedKg: number; // vs private car solo
  isFavorite?: boolean;
  notes?: string;
  waterIntakeMl?: number; // Water drank during this commute
}

export interface WaterLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  amountMl: number; // e.g. 250, 500
  tripId?: string; // commute during which it was consumed
  context?: 'durante_viaje' | 'antes_viaje' | 'llegada' | 'rutina';
  note?: string;
}

export type ExpenseCategory = 
  | 'pasaje_bus' 
  | 'pasaje_metro' 
  | 'gasolina' 
  | 'recarga_tarjeta' 
  | 'peaje' 
  | 'estacionamiento' 
  | 'taxi' 
  | 'mantenimiento';

export type PaymentMethod = 'efectivo' | 'tarjeta_transporte' | 'tarjeta_debito' | 'digital';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  note?: string;
  fuelLiters?: number; // optional for gasolina
}

export interface MetaPresupuesto {
  id: string;
  month: string; // YYYY-MM
  dailyLimit: number;
  monthlyLimit: number;
  warningThresholdPercent: number; // e.g. 80
  alertThresholdPercent: number; // e.g. 100
}

export type AppTheme = 'dark' | 'light';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'estudiante' | 'trabajador';
  institutionOrCompany: string;
  currency: string;
  dailyBudget: number;
  monthlyBudget: number;
  dailyWaterGoalMl: number; // Target daily hydration (e.g. 2000 ml)
  soundEnabled: boolean;
  isLoggedIn: boolean;
  theme?: AppTheme;
}

export type ScreenTab = 'inicio' | 'gastos' | 'impacto';
