import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './Button';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </Button>
  );
};