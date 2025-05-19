import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input 
    className={`
      flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm 
      ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
      placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 
      focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed 
      disabled:opacity-50 transition-colors dark:bg-gray-800 dark:border-gray-700 
      dark:text-white dark:placeholder-gray-400 ${className}
    `} 
    {...props} 
  />
);