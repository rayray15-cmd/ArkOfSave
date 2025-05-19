import React from 'react';
import { CardShell } from '../ui/Card';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export const KPICard: React.FC<KPICardProps> = ({ 
  label, 
  value, 
  description, 
  icon: Icon,
  variant = 'default'
}) => {
  const variantStyles = {
    default: {
      icon: 'text-indigo-500 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
      ring: 'ring-indigo-500/10 dark:ring-indigo-400/10'
    },
    success: {
      icon: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      ring: 'ring-emerald-500/10 dark:ring-emerald-400/10'
    },
    warning: {
      icon: 'text-amber-500 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      ring: 'ring-amber-500/10 dark:ring-amber-400/10'
    },
    danger: {
      icon: 'text-red-500 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-500/10',
      ring: 'ring-red-500/10 dark:ring-red-400/10'
    }
  };

  return (
    <CardShell className="relative overflow-hidden">
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <div className={`p-2 rounded-lg ${variantStyles[variant].bg} mb-3`}>
          <Icon size={20} className={variantStyles[variant].icon} />
        </div>
        
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          {label}
        </p>
        
        <p className="text-2xl font-semibold tracking-tight">
          {value}
        </p>
        
        {description && (
          <p className={`text-sm mt-1 ${variantStyles[variant].icon}`}>
            {description}
          </p>
        )}
        
        <div 
          className={`absolute inset-px rounded-lg ring-1 ${variantStyles[variant].ring}`} 
          aria-hidden="true" 
        />
      </div>
    </CardShell>
  );
};