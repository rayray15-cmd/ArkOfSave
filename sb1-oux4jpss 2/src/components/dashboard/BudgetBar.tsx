import React from 'react';

interface BudgetBarProps {
  remaining: number;
  percent: number;
}

export const BudgetBar: React.FC<BudgetBarProps> = ({ remaining, percent }) => (
  <div className="mb-4 last:mb-0 text-sm">
    <div className="flex justify-between mb-1 gap-2">
      <span className="tabular-nums text-gray-600 truncate">
        {remaining.toLocaleString(undefined, { style: 'currency', currency: 'GBP' })} left
      </span>
    </div>
    <div className="h-2 w-full bg-gray-200/70 rounded-full overflow-hidden">
      <div 
        className="h-full bg-indigo-500" 
        style={{ width: `${Math.min(percent, 100)}%` }} 
      />
    </div>
  </div>
);