import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to migrate local storage data
export async function migrateLocalStorageToSupabase() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No user found');

    // Migrate expenses
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    if (expenses.length > 0) {
      const { error: expensesError } = await supabase
        .from('expenses')
        .upsert(expenses.map(expense => ({
          ...expense,
          user_id: user.id,
          created_at: new Date(expense.timestamp || Date.now()).toISOString()
        })));
      if (expensesError) throw expensesError;
    }

    // Migrate budget goals
    const budgetGoals = JSON.parse(localStorage.getItem('budgetGoals') || '[]');
    if (budgetGoals.length > 0) {
      const { error: goalsError } = await supabase
        .from('budget_goals')
        .upsert(budgetGoals.map(goal => ({
          ...goal,
          user_id: user.id
        })));
      if (goalsError) throw goalsError;
    }

    // Migrate recurring payments
    const recurrings = JSON.parse(localStorage.getItem('recurrings') || '[]');
    if (recurrings.length > 0) {
      const { error: recurringsError } = await supabase
        .from('recurring_payments')
        .upsert(recurrings.map(recurring => ({
          ...recurring,
          user_id: user.id
        })));
      if (recurringsError) throw recurringsError;
    }

    // Migrate savings goals
    const savingsGoals = JSON.parse(localStorage.getItem('savingsGoals') || '[]');
    if (savingsGoals.length > 0) {
      const { error: savingsError } = await supabase
        .from('savings_goals')
        .upsert(savingsGoals.map(goal => ({
          ...goal,
          user_id: user.id
        })));
      if (savingsError) throw savingsError;
    }

    // Migrate todos
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    if (todos.length > 0) {
      const { error: todosError } = await supabase
        .from('todos')
        .upsert(todos.map(todo => ({
          ...todo,
          user_id: user.id
        })));
      if (todosError) throw todosError;
    }

    // Migrate debts
    const debts = JSON.parse(localStorage.getItem('debts') || '[]');
    if (debts.length > 0) {
      const { error: debtsError } = await supabase
        .from('debts')
        .upsert(debts.map(debt => ({
          ...debt,
          user_id: user.id
        })));
      if (debtsError) throw debtsError;
    }

    // Migrate debt payments
    const debtPayments = debts.flatMap(debt => 
      debt.payments.map(payment => ({
        ...payment,
        debt_id: debt.id,
        user_id: user.id
      }))
    );
    if (debtPayments.length > 0) {
      const { error: paymentsError } = await supabase
        .from('debt_payments')
        .upsert(debtPayments);
      if (paymentsError) throw paymentsError;
    }

    // Migrate user preferences
    const preferences = JSON.parse(localStorage.getItem(`preferences_${user.email}`) || '{}');
    if (Object.keys(preferences).length > 0) {
      const { error: prefsError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          preferences
        });
      if (prefsError) throw prefsError;
    }

    // Clear local storage after successful migration
    localStorage.clear();
    
    return { success: true };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error };
  }
}

// Helper function to fetch all user data
export async function fetchUserData() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error('No user found');

    const [
      { data: expenses },
      { data: budgetGoals },
      { data: recurrings },
      { data: savingsGoals },
      { data: todos },
      { data: debts },
      { data: debtPayments },
      { data: userData }
    ] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', user.id),
      supabase.from('budget_goals').select('*').eq('user_id', user.id),
      supabase.from('recurring_payments').select('*').eq('user_id', user.id),
      supabase.from('savings_goals').select('*').eq('user_id', user.id),
      supabase.from('todos').select('*').eq('user_id', user.id),
      supabase.from('debts').select('*').eq('user_id', user.id),
      supabase.from('debt_payments').select('*').eq('user_id', user.id),
      supabase.from('users').select('*').eq('id', user.id).single()
    ]);

    // Process debts to include their payments
    const processedDebts = debts?.map(debt => ({
      ...debt,
      payments: debtPayments?.filter(payment => payment.debt_id === debt.id) || []
    })) || [];

    return {
      expenses: expenses || [],
      budgetGoals: budgetGoals || [],
      recurrings: recurrings || [],
      savingsGoals: savingsGoals || [],
      todos: todos || [],
      debts: processedDebts,
      preferences: userData?.preferences || {}
    };
  } catch (error) {
    console.error('Data fetch error:', error);
    return null;
  }
}