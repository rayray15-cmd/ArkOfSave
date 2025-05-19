import { DivideIcon as LucideIcon } from 'lucide-react';

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  addedBy: string;
  splitWith?: string;
  splitAmount?: number;
  timestamp?: number;
}

export interface Budget {
  id: number;
  partner: string;
  spent: number;
  total: number;
  goals: BudgetGoal[];
  personalBudget?: {
    Ray?: number;
    Amber?: number;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: 'GBP' | 'USD' | 'EUR';
  categories: string[];
  notifications: boolean;
  weekStartsOn: 0 | 1;
  isAdmin?: boolean;
}

export interface BudgetGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
}

export interface RecurringPayment {
  id: number;
  description: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDue: string;
  category?: string;
  notes?: string;
  variableAmount?: boolean;
  reminderDays?: number;
  status?: 'paid' | 'pending' | 'overdue';
}

export interface Todo {
  id: number;
  text: string;
  done: boolean;
  due: string | null;
}

export interface FilterOptions {
  category: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
}

export interface CategoryRule {
  keyword: string;
  category: string;
}

export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
}

export interface ThemeConfig {
  isDarkMode: boolean;
  primaryColor: string;
}

export interface Debt {
  id: number;
  description: string;
  totalAmount: number;
  remainingAmount: number;
  date: string;
  addedBy: string;
  isShared: boolean;
  payments: DebtPayment[];
}

export interface PersonalDebt extends Omit<Debt, 'isShared'> {
  paymentAmount: number;
}

export interface DebtPayment {
  id: number;
  amount: number;
  date: string;
  addedBy: string;
}