import React from 'react';
import { 
  Bus, 
  Train, 
  Car, 
  Flame, 
  Bike, 
  Footprints, 
  Zap, 
  Navigation,
  Fuel,
  CreditCard,
  Milestone,
  CircleParking,
  CarTaxiFront,
  Wrench
} from 'lucide-react';
import { TransportMode, ExpenseCategory } from '../types';

interface TransportIconProps {
  mode: TransportMode;
  className?: string;
  size?: number;
}

export const TransportIcon: React.FC<TransportIconProps> = ({ mode, className = 'w-5 h-5', size = 20 }) => {
  switch (mode) {
    case 'bus':
      return <Bus className={className} size={size} />;
    case 'metro':
      return <Train className={className} size={size} />;
    case 'car':
      return <Car className={className} size={size} />;
    case 'motorcycle':
      return <Flame className={className} size={size} />;
    case 'bicycle':
      return <Bike className={className} size={size} />;
    case 'walking':
      return <Footprints className={className} size={size} />;
    case 'scooter':
      return <Zap className={className} size={size} />;
    case 'taxi':
      return <Navigation className={className} size={size} />;
    default:
      return <Bus className={className} size={size} />;
  }
};

interface ExpenseCategoryIconProps {
  category: ExpenseCategory;
  className?: string;
  size?: number;
}

export const ExpenseCategoryIcon: React.FC<ExpenseCategoryIconProps> = ({ category, className = 'w-5 h-5', size = 20 }) => {
  switch (category) {
    case 'pasaje_bus':
      return <Bus className={className} size={size} />;
    case 'pasaje_metro':
      return <Train className={className} size={size} />;
    case 'gasolina':
      return <Fuel className={className} size={size} />;
    case 'recarga_tarjeta':
      return <CreditCard className={className} size={size} />;
    case 'peaje':
      return <Milestone className={className} size={size} />;
    case 'estacionamiento':
      return <CircleParking className={className} size={size} />;
    case 'taxi':
      return <CarTaxiFront className={className} size={size} />;
    case 'mantenimiento':
      return <Wrench className={className} size={size} />;
    default:
      return <CreditCard className={className} size={size} />;
  }
};
