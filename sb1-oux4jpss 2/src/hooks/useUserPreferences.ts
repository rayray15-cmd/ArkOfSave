import { useState, useEffect } from 'react';
import { UserPreferences } from '../types';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  currency: 'GBP',
  categories: [],
  notifications: true,
  weekStartsOn: 1,
  isAdmin: false,
};

export const useUserPreferences = () => {
  const user = localStorage.getItem('user');
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem(`preferences_${user}`);
    const basePrefs = stored ? JSON.parse(stored) : DEFAULT_PREFERENCES;
    // Set Ray as admin
    if (user === 'Ray') {
      basePrefs.isAdmin = true;
    }
    return basePrefs;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(`preferences_${user}`, JSON.stringify(preferences));
    }
  }, [preferences, user]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  return { preferences, updatePreferences };
};