import { TransportMode, ExpenseCategory } from '../types';

// Emission factors in kg CO2 per kilometer (standard European / Latin American commuter averages)
export const EMISSION_FACTORS: Record<TransportMode, number> = {
  walking: 0,
  bicycle: 0,
  scooter: 0.012, // electric scooter grid average
  metro: 0.018,   // electric train/metro passenger-km
  bus: 0.038,     // urban bus per passenger
  motorcycle: 0.088,
  car: 0.175,     // solo private car
  taxi: 0.190,    // taxi / ride-hailing with deadhead distance
};

// Benchmark baseline: Solo gasoline car average emission (0.175 kg CO2/km)
export const BASELINE_CAR_EMISSION_PER_KM = 0.175;

export function calculateTripCO2(mode: TransportMode, distanceKm: number): { co2Kg: number; co2SavedKg: number } {
  const factor = EMISSION_FACTORS[mode] ?? 0.1;
  const co2Kg = Number((distanceKm * factor).toFixed(2));
  const baseline = distanceKm * BASELINE_CAR_EMISSION_PER_KM;
  const co2SavedKg = Number(Math.max(0, baseline - co2Kg).toFixed(2));
  return { co2Kg, co2SavedKg };
}

export interface TransportModeMeta {
  id: TransportMode;
  label: string;
  iconName: string;
  emoji: string;
  color: string;
  bgLight: string;
  borderLight: string;
  isEco: boolean;
  emissionDescription: string;
}

export const TRANSPORT_MODES: Record<TransportMode, TransportModeMeta> = {
  bus: {
    id: 'bus',
    label: 'Autobús / Colectivo',
    iconName: 'Bus',
    emoji: '🚌',
    color: 'text-amber-500',
    bgLight: 'bg-amber-500/10',
    borderLight: 'border-amber-500/30',
    isEco: true,
    emissionDescription: '78% menos CO2 que auto particular',
  },
  metro: {
    id: 'metro',
    label: 'Metro / Tren',
    iconName: 'Train',
    emoji: '🚇',
    color: 'text-emerald-500',
    bgLight: 'bg-emerald-500/10',
    borderLight: 'border-emerald-500/30',
    isEco: true,
    emissionDescription: '90% menos emisiones por pasajero',
  },
  bicycle: {
    id: 'bicycle',
    label: 'Bicicleta',
    iconName: 'Bike',
    emoji: '🚲',
    color: 'text-lime-500',
    bgLight: 'bg-lime-500/10',
    borderLight: 'border-lime-500/30',
    isEco: true,
    emissionDescription: 'Cero emisiones y ejercicio saludable',
  },
  walking: {
    id: 'walking',
    label: 'A pie / Caminata',
    iconName: 'Footprints',
    emoji: '🚶',
    color: 'text-teal-400',
    bgLight: 'bg-teal-400/10',
    borderLight: 'border-teal-400/30',
    isEco: true,
    emissionDescription: '100% Cero emisiones directas',
  },
  car: {
    id: 'car',
    label: 'Automóvil',
    iconName: 'Car',
    emoji: '🚗',
    color: 'text-rose-500',
    bgLight: 'bg-rose-500/10',
    borderLight: 'border-rose-500/30',
    isEco: false,
    emissionDescription: 'Mayor generador de CO2 individual',
  },
  motorcycle: {
    id: 'motorcycle',
    label: 'Motocicleta',
    iconName: 'Flame',
    emoji: '🏍️',
    color: 'text-orange-500',
    bgLight: 'bg-orange-500/10',
    borderLight: 'border-orange-500/30',
    isEco: false,
    emissionDescription: 'Emisión media y ahorro de tiempo',
  },
  scooter: {
    id: 'scooter',
    label: 'Scooter eléctrico',
    iconName: 'Zap',
    emoji: '🛴',
    color: 'text-cyan-400',
    bgLight: 'bg-cyan-400/10',
    borderLight: 'border-cyan-400/30',
    isEco: true,
    emissionDescription: 'Micro-movilidad eléctrica ultra ligera',
  },
  taxi: {
    id: 'taxi',
    label: 'Taxi / App de viaje',
    iconName: 'Navigation',
    emoji: '🚕',
    color: 'text-yellow-400',
    bgLight: 'bg-yellow-400/10',
    borderLight: 'border-yellow-400/30',
    isEco: false,
    emissionDescription: 'Alto costo e impacto en tráfico',
  },
};

export interface ExpenseCategoryMeta {
  id: ExpenseCategory;
  label: string;
  emoji: string;
  iconName: string;
  color: string;
  isPublicTransit: boolean;
  isFuel: boolean;
}

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, ExpenseCategoryMeta> = {
  pasaje_bus: {
    id: 'pasaje_bus',
    label: 'Pasaje Autobús',
    emoji: '🚌',
    iconName: 'Bus',
    color: 'text-amber-400',
    isPublicTransit: true,
    isFuel: false,
  },
  pasaje_metro: {
    id: 'pasaje_metro',
    label: 'Pasaje Metro/Tren',
    emoji: '🚇',
    iconName: 'Train',
    color: 'text-emerald-400',
    isPublicTransit: true,
    isFuel: false,
  },
  gasolina: {
    id: 'gasolina',
    label: 'Gasolina / Nafta',
    emoji: '⛽',
    iconName: 'Fuel',
    color: 'text-rose-400',
    isPublicTransit: false,
    isFuel: true,
  },
  recarga_tarjeta: {
    id: 'recarga_tarjeta',
    label: 'Recarga Tarjeta / Pase',
    emoji: '💳',
    iconName: 'CreditCard',
    color: 'text-blue-400',
    isPublicTransit: true,
    isFuel: false,
  },
  peaje: {
    id: 'peaje',
    label: 'Peaje / Caseta',
    emoji: '🛣️',
    iconName: 'Milestone',
    color: 'text-orange-400',
    isPublicTransit: false,
    isFuel: false,
  },
  estacionamiento: {
    id: 'estacionamiento',
    label: 'Estacionamiento / Parking',
    emoji: '🅿️',
    iconName: 'CircleParking',
    color: 'text-purple-400',
    isPublicTransit: false,
    isFuel: false,
  },
  taxi: {
    id: 'taxi',
    label: 'Taxi / Uber / DiDi',
    emoji: '🚕',
    iconName: 'CarTaxiFront',
    color: 'text-yellow-400',
    isPublicTransit: false,
    isFuel: false,
  },
  mantenimiento: {
    id: 'mantenimiento',
    label: 'Mantenimiento / Taller',
    emoji: '🔧',
    iconName: 'Wrench',
    color: 'text-slate-400',
    isPublicTransit: false,
    isFuel: false,
  },
};
