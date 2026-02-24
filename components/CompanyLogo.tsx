import React, { useState } from 'react';
import { Building2, Factory, HardHat, Settings, Wrench, Compass, Landmark, Castle, Warehouse, Hammer, PenTool, Ruler, Zap, Shield, Truck } from 'lucide-react';

const ICONS = [
  Building2, Factory, HardHat, Settings, Wrench, Compass, 
  Landmark, Castle, Warehouse, Hammer, PenTool, Ruler, 
  Zap, Shield, Truck
];

const COLORS = [
  'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
  'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
  'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
  'text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20',
];

interface CompanyLogoProps {
  logo?: string | null;
  name: string;
  id: string;
  className?: string;
  iconSize?: number;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ logo, name, id, className = "w-full h-full", iconSize = 24 }) => {
  const [imageError, setImageError] = useState(false);

  if (logo && !imageError) {
    return (
      <img 
        src={logo} 
        alt={name} 
        className={`${className} object-contain`} 
        onError={() => setImageError(true)}
      />
    );
  }

  // Deterministic selection based on ID (or name if ID is missing)
  const hashString = id || name || 'default';
  let hash = 0;
  for (let i = 0; i < hashString.length; i++) {
    hash = hashString.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const Icon = ICONS[hash % ICONS.length];
  const colorClass = COLORS[hash % COLORS.length];

  return (
    <div className={`${className} flex items-center justify-center rounded-lg ${colorClass}`}>
      <Icon size={iconSize} />
    </div>
  );
};
