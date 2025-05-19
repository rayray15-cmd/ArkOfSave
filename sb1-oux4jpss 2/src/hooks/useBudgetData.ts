import { useState, useMemo, useEffect } from 'react';
import { add, format, parseISO, isBefore, isToday, isValid } from 'date-fns';
import { useSupabase } from './useSupabase';
import { supabase } from '../lib/supabase';
import { 
  Expense, 
  Budget,
  RecurringPayment, 
  Todo, 
  FilterOptions,
  SavingsGoal,
  BudgetGoal,
  ThemeConfig
} from '../types';
import { autoCategorizePurchase } from '../lib/categories';
import toast from 'react-hot-toast';

export const useBudgetData = () => {
  const { data: supabaseData, refreshData } = useSupabase();
  const currentUser = localStorage.getItem('user');
  
  // Local state
  const [expenses, setExpenses] = useState<Expense[]>(supabaseData?.expenses || []);
  const [budgets, setBudgets] = useState<Budget[]>([
    { 
      id: 1, 
      partner: "Combined", 
      spent: 0, 
      total: 2000,
      goals: [],
      personalBudget: {
        Ray: 1000,
        Amber: 1000
      }
    }
  ]);
  const [recurrings, setRecurrings] = useState<RecurringPayment[]>(supabaseData?.recurrings || []);
  const [todos, setTodos] = useState<Todo[]>(supabaseData?.todos || []);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(supabaseData?.savingsGoals || []);
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>(supabaseData?.budgetGoals || []);
  const [theme, setTheme] = useState<ThemeConfig>({
    isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    primaryColor: '#6366f1'
  });

  // Form states
  const [expenseForm, setExpenseForm] = useState({ 
    description: "", 
    amount: "", 
    category: "Other",
    splitWith: undefined,
    splitAmount: undefined
  });
  const [recForm, setRecForm] = useState<{
    description: string;
    amount: string;
    frequency: 'weekly' | 'monthly' | 'yearly';
    nextDue: string;
    category?: string;
    notes?: string;
    variableAmount?: boolean;
    reminderDays?: number;
  }>({ 
    description: "", 
    amount: "", 
    frequency: "monthly", 
    nextDue: "",
    category: "Bills",
    notes: "",
    variableAmount: false,
    reminderDays: 7
  });
  const [budgetForm, setBudgetForm] = useState({ total: 0, type: '' });
  const [todoInput, setTodoInput] = useState("");
  const [todoDue, setTodoDue] = useState("");
  const [categoryForm, setCategoryForm] = useState("");

  // Filter state
  const [filter, setFilter] = useState<FilterOptions>({
    category: "All",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  // Update local state when Supabase data changes
  useEffect(() => {
    if (supabaseData) {
      setExpenses(supabaseData.expenses);
      setRecurrings(supabaseData.recurrings);
      setSavingsGoals(supabaseData.savingsGoals);
      setBudgetGoals(supabaseData.budgetGoals);
      setTodos(supabaseData.todos);
    }
  }, [supabaseData]);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.isDarkMode);
  }, [theme.isDarkMode]);

  // Calculate total expenses including split expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => {
      if (e.splitWith) {
        return sum + (e.splitAmount || e.amount / 2);
      }
      return sum + e.amount;
    }, 0);
  }, [expenses]);

  // Calculate total household income from localStorage
  const totalIncome = useMemo(() => {
    const incomeData = localStorage.getItem('income');
    if (!incomeData) return 0;
    
    const { ray, amber, otherSources } = JSON.parse(incomeData);
    const otherIncome = otherSources.reduce((sum: number, src: { amount: number }) => sum + src.amount, 0);
    return (ray || 0) + (amber || 0) + otherIncome;
  }, []);

  // Update budgets when income changes
  useEffect(() => {
    if (budgets[0]) {
      setBudgets([{
        ...budgets[0],
        total: totalIncome
      }]);
    }
  }, [totalIncome]);

  const netIncome = totalIncome - totalExpenses;

  // Computed values
  const upcomingRecurrings = useMemo(() => {
    return recurrings
      .map(r => ({
        ...r,
        overdue: isBefore(parseISO(r.nextDue), new Date()) || isToday(parseISO(r.nextDue))
      }))
      .sort((a, b) => parseISO(a.nextDue).getTime() - parseISO(b.nextDue).getTime());
  }, [recurrings]);

  // Actions
  const addExpense = async () => {
    const desc = expenseForm.description.trim();
    const amt = parseFloat(expenseForm.amount);
    
    if (!desc || isNaN(amt)) return;
    
    let assigned = expenseForm.category;
    if (assigned === "Other") {
      assigned = autoCategorizePurchase(desc);
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('User not found');
      return;
    }

    const newExpense = {
      user_id: user.id,
      description: desc,
      amount: amt,
      category: assigned,
      date: format(new Date(), "yyyy-MM-dd"),
      split_with: expenseForm.splitWith,
      split_amount: expenseForm.splitWith ? amt / 2 : undefined,
      created_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('expenses')
      .insert(newExpense);

    if (error) {
      toast.error('Error adding expense');
      return;
    }

    await refreshData();
    
    // Update budget goals
    if (budgetGoals.length > 0) {
      const updatedGoals = budgetGoals.map(g => 
        g.category === assigned
          ? { ...g, current_amount: g.currentAmount + amt }
          : g
      );

      const { error: goalsError } = await supabase
        .from('budget_goals')
        .upsert(updatedGoals.map(g => ({
          ...g,
          user_id: user.id
        })));

      if (goalsError) {
        toast.error('Error updating budget goals');
      }
    }
    
    toast.success('Expense added successfully!');
    setExpenseForm({ description: "", amount: "", category: "Other", splitWith: undefined, splitAmount: undefined });
  };

  const deleteExpense = async (id: number) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting expense');
      return;
    }

    await refreshData();
    toast.success('Expense deleted successfully!');
  };

  const addRecurring = async () => {
    const { description, amount, frequency, nextDue, category, notes, variableAmount, reminderDays } = recForm;
    const desc = description.trim();
    const amt = parseFloat(amount);
    
    if (!desc || isNaN(amt) || !nextDue) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('User not found');
      return;
    }
    
    const { error } = await supabase
      .from('recurring_payments')
      .insert({
        user_id: user.id,
        description: desc,
        amount: amt,
        frequency,
        next_due: nextDue,
        category,
        notes,
        variable_amount: variableAmount,
        reminder_days: reminderDays
      });

    if (error) {
      toast.error('Error adding recurring payment');
      return;
    }

    await refreshData();
    toast.success('Recurring payment added successfully!');
    setRecForm({ 
      description: "", 
      amount: "", 
      frequency: "monthly", 
      nextDue: "",
      category: "Bills",
      notes: "",
      variableAmount: false,
      reminderDays: 7
    });
  };

  const markRecurringPaid = async (id: number) => {
    const recurring = recurrings.find(r => r.id === id);
    if (!recurring) {
      toast.error('Recurring payment not found');
      return;
    }

    const parsedNextDue = parseISO(recurring.nextDue);
    if (!isValid(parsedNextDue)) {
      toast.error('Invalid date for recurring payment');
      return;
    }

    let nextDate;
    if (recurring.frequency === 'weekly') {
      nextDate = add(parsedNextDue, { weeks: 1 });
    } else if (recurring.frequency === 'monthly') {
      nextDate = add(parsedNextDue, { months: 1 });
    } else {
      nextDate = add(parsedNextDue, { years: 1 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('User not found');
      return;
    }

    // Add as expense
    const { error: expenseError } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        description: recurring.description,
        amount: recurring.amount,
        category: recurring.category || 'Bills',
        date: format(new Date(), "yyyy-MM-dd"),
        created_at: new Date().toISOString()
      });

    if (expenseError) {
      toast.error('Error adding expense');
      return;
    }

    // Update recurring payment
    const { error: recurringError } = await supabase
      .from('recurring_payments')
      .update({
        next_due: format(nextDate, "yyyy-MM-dd")
      })
      .eq('id', id);

    if (recurringError) {
      toast.error('Error updating recurring payment');
      return;
    }

    await refreshData();
    toast.success('Payment marked as paid!');
  };

  const deleteRecurring = async (id: number) => {
    const { error } = await supabase
      .from('recurring_payments')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting recurring payment');
      return;
    }

    await refreshData();
    toast.success('Recurring payment deleted successfully!');
  };

  const addTodo = async () => {
    const text = todoInput.trim();
    if (!text) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('User not found');
      return;
    }
    
    const { error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        text,
        done: false,
        due: todoDue || null
      });

    if (error) {
      toast.error('Error adding todo');
      return;
    }

    await refreshData();
    toast.success('Todo added successfully!');
    setTodoInput("");
    setTodoDue("");
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) {
      toast.error('Todo not found');
      return;
    }

    const { error } = await supabase
      .from('todos')
      .update({ done: !todo.done })
      .eq('id', id);

    if (error) {
      toast.error('Error updating todo');
      return;
    }

    await refreshData();
    if (!todo.done) {
      toast.success('Task completed! 🎉');
    }
  };

  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting todo');
      return;
    }

    await refreshData();
    toast.success('Todo deleted successfully!');
  };

  const moveTodo = (idx: number, direction: number) => {
    const arr = [...todos];
    const [item] = arr.splice(idx, 1);
    arr.splice(idx + direction, 0, item);
    setTodos(arr);
  };

  const addCustomCategory = () => {
    const name = categoryForm.trim();
    if (!name) {
      toast.error('Please enter a category name');
      return;
    }
    
    if (customCategories.includes(name)) {
      toast.error('Category already exists!');
      return;
    }
    
    setCustomCategories([...customCategories, name]);
    toast.success('Category added successfully!');
    setCategoryForm("");
  };

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('User not found');
      return;
    }

    const { error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: user.id,
        ...goal
      });

    if (error) {
      toast.error('Error adding savings goal');
      return;
    }

    await refreshData();
    toast.success('Savings goal added successfully!');
  };

  const updateSavingsGoal = async (id: number, amount: number) => {
    const { error } = await supabase
      .from('savings_goals')
      .update({ current_amount: amount })
      .eq('id', id);

    if (error) {
      toast.error('Error updating savings goal');
      return;
    }

    await refreshData();
    const goal = savingsGoals.find(g => g.id === id);
    if (goal && amount >= goal.targetAmount) {
      toast.success('Goal achieved! 🎉');
    }
  };

  const deleteSavingsGoal = async (id: number) => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting savings goal');
      return;
    }

    await refreshData();
    toast.success('Savings goal deleted successfully!');
  };

  const addBudgetGoal = async (goal: Omit<BudgetGoal, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('User not found');
      return;
    }

    const { error } = await supabase
      .from('budget_goals')
      .insert({
        user_id: user.id,
        ...goal
      });

    if (error) {
      toast.error('Error adding budget goal');
      return;
    }

    await refreshData();
    toast.success('Budget goal added successfully!');
  };

  const deleteBudgetGoal = async (id: number) => {
    const { error } = await supabase
      .from('budget_goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting budget goal');
      return;
    }

    await refreshData();
    toast.success('Budget goal deleted successfully!');
  };

  const clearFilters = () => {
    setFilter({
      category: "All",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });
    toast.success('Filters cleared!');
  };

  return {
    // Data
    expenses,
    budgets,
    recurrings,
    todos,
    customCategories,
    savingsGoals,
    budgetGoals,
    theme,
    // Forms
    expenseForm,
    recForm,
    budgetForm,
    todoInput,
    todoDue,
    categoryForm,
    filter,
    // Computed values
    totalExpenses,
    totalIncome,
    netIncome,
    upcomingRecurrings,
    // Setters
    setExpenses,
    setBudgets,
    setRecurrings,
    setTodos,
    setCustomCategories,
    setExpenseForm,
    setRecForm,
    setBudgetForm,
    setTodoInput,
    setTodoDue,
    setCategoryForm,
    setFilter,
    setTheme,
    // Actions
    addExpense,
    deleteExpense,
    addRecurring,
    markRecurringPaid,
    deleteRecurring,
    updateBudgetTotal: () => {}, // Removed as it's handled by Supabase
    addTodo,
    toggleTodo,
    deleteTodo,
    moveTodo,
    addCustomCategory,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addBudgetGoal,
    deleteBudgetGoal,
    clearFilters
  };
};