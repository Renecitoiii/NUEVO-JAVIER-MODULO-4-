import { Trip, Expense, UserProfile } from '../types';
import { calculateTripCO2 } from '../utils/transportUtils';

export function getTodayDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
}

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Camila Ríos',
  role: 'estudiante', // 'estudiante' o 'trabajador'
  institutionOrCompany: 'Universidad Central - Campus Norte',
  currency: '$',
  dailyBudget: 8.50,
  monthlyBudget: 150.00,
  soundEnabled: true,
};

export function getInitialTrips(): Trip[] {
  const today = getTodayDateString(0);
  const yesterday = getTodayDateString(1);
  const twoDaysAgo = getTodayDateString(2);
  const threeDaysAgo = getTodayDateString(3);
  const fourDaysAgo = getTodayDateString(4);
  const fiveDaysAgo = getTodayDateString(5);
  const sixDaysAgo = getTodayDateString(6);

  const rawTrips: Array<Omit<Trip, 'co2Kg' | 'co2SavedKg'>> = [
    // Today
    {
      id: 'trip-today-1',
      date: today,
      time: '07:35',
      origin: 'Casa (Av. Las Palmeras)',
      destination: 'Campus Universitario (Facultad)',
      mode: 'metro',
      distanceKm: 8.4,
      durationMinutes: 28,
      purpose: 'estudio',
      cost: 1.25,
      isFavorite: true,
      notes: 'Línea 1 directa, sin congestión.',
    },
    {
      id: 'trip-today-2',
      date: today,
      time: '13:10',
      origin: 'Campus Universitario',
      destination: 'Biblioteca Central / Cafetería',
      mode: 'walking',
      distanceKm: 1.2,
      durationMinutes: 15,
      purpose: 'estudio',
      cost: 0,
      notes: 'Caminata entre clases.',
    },
    {
      id: 'trip-today-3',
      date: today,
      time: '18:15',
      origin: 'Biblioteca Central',
      destination: 'Casa (Av. Las Palmeras)',
      mode: 'bus',
      distanceKm: 9.1,
      durationMinutes: 42,
      purpose: 'retorno',
      cost: 1.50,
      isFavorite: true,
      notes: 'Hora pico, tráfico moderado.',
    },
    // Yesterday
    {
      id: 'trip-yest-1',
      date: yesterday,
      time: '07:45',
      origin: 'Casa',
      destination: 'Campus Universitario',
      mode: 'bicycle',
      distanceKm: 7.8,
      durationMinutes: 25,
      purpose: 'estudio',
      cost: 0,
      notes: 'Ciclovía despejada por la mañana.',
    },
    {
      id: 'trip-yest-2',
      date: yesterday,
      time: '14:30',
      origin: 'Campus Universitario',
      destination: 'Centro de Prácticas / Oficina',
      mode: 'bus',
      distanceKm: 4.5,
      durationMinutes: 20,
      purpose: 'trabajo',
      cost: 1.25,
    },
    {
      id: 'trip-yest-3',
      date: yesterday,
      time: '19:00',
      origin: 'Centro de Prácticas',
      destination: 'Casa',
      mode: 'metro',
      distanceKm: 8.9,
      durationMinutes: 30,
      purpose: 'retorno',
      cost: 1.25,
    },
    // 2 days ago
    {
      id: 'trip-2d-1',
      date: twoDaysAgo,
      time: '08:10',
      origin: 'Casa',
      destination: 'Oficina / Campus',
      mode: 'car',
      distanceKm: 11.2,
      durationMinutes: 45,
      purpose: 'trabajo',
      cost: 5.50,
      notes: 'Uso de automóvil compartido por lluvia fuerte.',
    },
    {
      id: 'trip-2d-2',
      date: twoDaysAgo,
      time: '17:40',
      origin: 'Oficina / Campus',
      destination: 'Casa',
      mode: 'car',
      distanceKm: 11.2,
      durationMinutes: 52,
      purpose: 'retorno',
      cost: 5.50,
    },
    // 3 days ago
    {
      id: 'trip-3d-1',
      date: threeDaysAgo,
      time: '07:30',
      origin: 'Casa',
      destination: 'Campus Universitario',
      mode: 'metro',
      distanceKm: 8.4,
      durationMinutes: 27,
      purpose: 'estudio',
      cost: 1.25,
    },
    {
      id: 'trip-3d-2',
      date: threeDaysAgo,
      time: '18:00',
      origin: 'Campus Universitario',
      destination: 'Casa',
      mode: 'metro',
      distanceKm: 8.4,
      durationMinutes: 29,
      purpose: 'retorno',
      cost: 1.25,
    },
    // 4 days ago
    {
      id: 'trip-4d-1',
      date: fourDaysAgo,
      time: '08:00',
      origin: 'Casa',
      destination: 'Trabajo / Pasantía',
      mode: 'bus',
      distanceKm: 6.8,
      durationMinutes: 35,
      purpose: 'trabajo',
      cost: 1.50,
    },
    {
      id: 'trip-4d-2',
      date: fourDaysAgo,
      time: '17:30',
      origin: 'Trabajo / Pasantía',
      destination: 'Casa',
      mode: 'bus',
      distanceKm: 6.8,
      durationMinutes: 38,
      purpose: 'retorno',
      cost: 1.50,
    },
    // 5 days ago
    {
      id: 'trip-5d-1',
      date: fiveDaysAgo,
      time: '09:00',
      origin: 'Casa',
      destination: 'Parque / Tiendas',
      mode: 'bicycle',
      distanceKm: 5.0,
      durationMinutes: 18,
      purpose: 'personal',
      cost: 0,
    },
    // 6 days ago
    {
      id: 'trip-6d-1',
      date: sixDaysAgo,
      time: '08:15',
      origin: 'Casa',
      destination: 'Campus',
      mode: 'metro',
      distanceKm: 8.4,
      durationMinutes: 28,
      purpose: 'estudio',
      cost: 1.25,
    },
  ];

  return rawTrips.map(t => {
    const { co2Kg, co2SavedKg } = calculateTripCO2(t.mode, t.distanceKm);
    return {
      ...t,
      co2Kg,
      co2SavedKg,
    };
  });
}

export function getInitialExpenses(): Expense[] {
  const today = getTodayDateString(0);
  const yesterday = getTodayDateString(1);
  const twoDaysAgo = getTodayDateString(2);
  const threeDaysAgo = getTodayDateString(3);
  const fiveDaysAgo = getTodayDateString(5);

  return [
    {
      id: 'exp-today-1',
      date: today,
      time: '07:34',
      category: 'pasaje_metro',
      amount: 1.25,
      paymentMethod: 'tarjeta_transporte',
      note: 'Tarifa estudiante pase metro',
    },
    {
      id: 'exp-today-2',
      date: today,
      time: '18:14',
      category: 'pasaje_bus',
      amount: 1.50,
      paymentMethod: 'efectivo',
      note: 'Bus alimentador ruta norte',
    },
    {
      id: 'exp-yest-1',
      date: yesterday,
      time: '14:28',
      category: 'pasaje_bus',
      amount: 1.25,
      paymentMethod: 'tarjeta_transporte',
      note: 'Traslado al trabajo',
    },
    {
      id: 'exp-yest-2',
      date: yesterday,
      time: '18:55',
      category: 'pasaje_metro',
      amount: 1.25,
      paymentMethod: 'tarjeta_transporte',
      note: 'Retorno a casa',
    },
    {
      id: 'exp-2d-1',
      date: twoDaysAgo,
      time: '08:05',
      category: 'gasolina',
      amount: 22.00,
      paymentMethod: 'tarjeta_debito',
      fuelLiters: 15.2,
      note: 'Carga de combustible para semana de exámenes',
    },
    {
      id: 'exp-2d-2',
      date: twoDaysAgo,
      time: '08:50',
      category: 'estacionamiento',
      amount: 3.50,
      paymentMethod: 'efectivo',
      note: 'Parqueadero campus universitario',
    },
    {
      id: 'exp-3d-1',
      date: threeDaysAgo,
      time: '10:00',
      category: 'recarga_tarjeta',
      amount: 15.00,
      paymentMethod: 'digital',
      note: 'Recarga quincenal tarjeta de transporte',
    },
    {
      id: 'exp-5d-1',
      date: fiveDaysAgo,
      time: '19:30',
      category: 'taxi',
      amount: 6.80,
      paymentMethod: 'digital',
      note: 'Uber por retorno tarde de biblioteca',
    },
  ];
}
