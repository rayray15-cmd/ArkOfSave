import React from 'react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onValueChange, 
  children,
  className = ""
}) => (
  <select
    value={value}
    onChange={e => onValueChange(e.target.value)}
    className={`
      flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm 
      ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
      placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 
      focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed 
      disabled:opacity-50 transition-colors ${className}
    `}
  >
    {children}
  </select>
);

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => children;
export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({ value, children }) => (
  <option value={value} className="py-2 px-3 text-sm cursor-pointer hover:bg-accent">{children}</option>
);
export const SelectTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => children;
export const SelectValue: React.FC<{ placeholder: string }> = ({ placeholder }) => (
  <option disabled className="text-muted-foreground">{placeholder}</option>
);