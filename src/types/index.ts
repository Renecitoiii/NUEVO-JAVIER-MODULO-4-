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

export interface UserProfile {
  name: string;
  role: 'estudiante' | 'trabajador';
  institutionOrCompany: string;
  currency: string;
  dailyBudget: number;
  monthlyBudget: number;
  soundEnabled: boolean;
}

export type ScreenTab = 'inicio' | 'gastos' | 'impacto';
