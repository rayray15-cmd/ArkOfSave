import React, { useState, useMemo } from 'react';
import { Receipt, Download, Search, SlidersHorizontal, PiggyBank, TrendingUp, Plus, Trash2, Calendar, Check, X, Wand2 } from 'lucide-react';
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { CardShell } from '../components/ui/Card';
import { ExpenseModal } from '../components/modals/ExpenseModal';
import { useBudgetData } from '../hooks/useBudgetData';
import { exportExpensesToCSV } from '../lib/export';
import { predefinedCategories } from '../lib/categories';
import { autoCategorizePurchase } from '../lib/categories';
import toast from 'react-hot-toast';
import { Expense } from '../types';

export const ExpensesPage = () => {
  const { 
    expenses, 
    deleteExpense, 
    customCategories,
    expenseForm,
    setExpenseForm,
    addExpense,
    setExpenses
  } = useBudgetData();
  
  const allCategories = ['All', ...predefinedCategories, ...customCategories];
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<{
    id: number;
    field: 'description' | 'amount' | 'category';
    value: string;
  } | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month' | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Quick date filters
  const setQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateRange({
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    });
  };

  // Filter expenses by time frame first
  const timeFilteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      switch (timeFrame) {
        case 'day':
          return isToday(expenseDate);
        case 'week':
          return isThisWeek(expenseDate, { weekStartsOn: 1 });
        case 'month':
          return isThisMonth(expenseDate);
        default:
          return true;
      }
    });
  }, [expenses, timeFrame]);

  // Then apply other filters
  const filteredExpenses = useMemo(() => {
    return timeFilteredExpenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
      const matchesDateRange = (!dateRange.start || expense.date >= dateRange.start) &&
                             (!dateRange.end || expense.date <= dateRange.end);
      const matchesAmountRange = (!amountRange.min || expense.amount >= Number(amountRange.min)) &&
                               (!amountRange.max || expense.amount <= Number(amountRange.max));
      
      return matchesSearch && matchesCategory && matchesDateRange && matchesAmountRange;
    });
  }, [timeFilteredExpenses, searchTerm, selectedCategory, dateRange, amountRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const highest = filteredExpenses.reduce((max, e) => Math.max(max, e.amount), 0);
    const lowest = filteredExpenses.reduce((min, e) => Math.min(min, e.amount), Infinity);
    
    return { total, highest, lowest: lowest === Infinity ? 0 : lowest };
  }, [filteredExpenses]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setDateRange({ start: '', end: '' });
    setAmountRange({ min: '', max: '' });
    setTimeFrame('all');
    toast.success('Filters cleared!');
  };

  const handleAddExpense = () => {
    addExpense();
    setShowExpenseModal(false);
  };

  const startEditing = (expense: Expense, field: 'description' | 'amount' | 'category') => {
    setEditingExpense({
      id: expense.id,
      field,
      value: field === 'amount' ? expense.amount.toString() : expense[field]
    });
  };

  const handleSaveEdit = () => {
    if (!editingExpense) return;

    const { id, field, value } = editingExpense;
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    let updatedValue: string | number = value;
    
    // Validate the edit
    if (field === 'description') {
      if (!value.trim()) {
        toast.error('Description cannot be empty');
        return;
      }
    } else if (field === 'amount') {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      updatedValue = numValue;
    }

    // Update the expense
    const updatedExpenses = expenses.map(e => {
      if (e.id === id) {
        return {
          ...e,
          [field]: updatedValue
        };
      }
      return e;
    });

    setExpenses(updatedExpenses);
    setEditingExpense(null);
    toast.success('Expense updated successfully');
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleAutoCategorizeBtnClick = (expense: Expense) => {
    const suggestedCategory = autoCategorizePurchase(expense.description);
    
    const updatedExpenses = expenses.map(e => {
      if (e.id === expense.id) {
        return {
          ...e,
          category: suggestedCategory
        };
      }
      return e;
    });

    setExpenses(updatedExpenses);
    toast.success(`Category set to: ${suggestedCategory}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt size={24} /> Expenses
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="ghost" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal size={16} />
            Filters
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => exportExpensesToCSV(filteredExpenses)} 
            className="flex items-center gap-2 ml-auto sm:ml-0"
          >
            <Download size={16} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <CardShell>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                <PiggyBank size={20} />
                <h3 className="font-medium">Total Expenses</h3>
              </div>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                £{stats.total.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                <TrendingUp size={20} />
                <h3 className="font-medium">Highest</h3>
              </div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                £{stats.highest.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <TrendingUp size={20} />
                <h3 className="font-medium">Lowest</h3>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                £{stats.lowest.toLocaleString()}
              </p>
            </div>
          </div>
        </CardShell>

        <CardShell>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeFrame} onValueChange={(v) => setTimeFrame(v as typeof timeFrame)}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="ghost" onClick={() => setQuickDateRange(7)}>7d</Button>
                    <Button size="sm" variant="ghost" onClick={() => setQuickDateRange(30)}>30d</Button>
                    <Button size="sm" variant="ghost" onClick={() => setQuickDateRange(90)}>90d</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={amountRange.min}
                      onChange={e => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={amountRange.max}
                      onChange={e => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>
                <Button variant="ghost" onClick={clearFilters} className="text-red-500">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardShell>

        <CardShell>
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 pb-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {filteredExpenses.length} expenses
                {timeFrame !== 'all' && (
                  <span className="ml-2">
                    for this {timeFrame}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-700/50">
            {filteredExpenses.map(expense => (
              <div 
                key={expense.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      {editingExpense?.id === expense.id && editingExpense.field === 'description' ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingExpense.value}
                            onChange={e => setEditingExpense({ ...editingExpense, value: e.target.value })}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="flex-1"
                          />
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleSaveEdit}
                              className="text-green-500 hover:text-green-700"
                            >
                              <Check size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelEdit}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <h4 
                          className="font-medium truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                          onClick={() => startEditing(expense, 'description')}
                        >
                          {expense.description}
                        </h4>
                      )}

                      {editingExpense?.id === expense.id && editingExpense.field === 'amount' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editingExpense.value}
                            onChange={e => setEditingExpense({ ...editingExpense, value: e.target.value })}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-32"
                          />
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleSaveEdit}
                              className="text-green-500 hover:text-green-700"
                            >
                              <Check size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCancelEdit}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <span 
                          className="text-indigo-600 dark:text-indigo-400 font-medium tabular-nums cursor-pointer hover:text-indigo-800 dark:hover:text-indigo-300"
                          onClick={() => startEditing(expense, 'amount')}
                        >
                          £{expense.amount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      {editingExpense?.id === expense.id && editingExpense.field === 'category' ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={editingExpense.value}
                            onValueChange={v => {
                              setEditingExpense({ ...editingExpense, value: v });
                              setTimeout(handleSaveEdit, 0);
                            }}
                          >
                            <SelectTrigger className="h-7 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {predefinedCategories.concat(customCategories).map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAutoCategorizeBtnClick(expense)}
                            className="h-7 w-7"
                            title="Auto-categorize"
                          >
                            <Wand2 size={14} />
                          </Button>
                        </div>
                      ) : (
                        <span 
                          className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                          onClick={() => startEditing(expense, 'category')}
                        >
                          {expense.category}
                        </span>
                      )}
                      <span className="mx-2">•</span>
                      <span className="tabular-nums whitespace-nowrap">
                        {format(parseISO(expense.date), 'MMM d, yyyy')}
                      </span>
                      {expense.addedBy && expense.timestamp && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Added by {expense.addedBy} at {format(new Date(expense.timestamp), 'h:mm a')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => deleteExpense(expense.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8">
                <Receipt size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">
                  {expenses.length === 0 
                    ? 'No expenses recorded yet.' 
                    : timeFrame === 'all'
                    ? 'No expenses match your filters.'
                    : `No expenses found for this ${timeFrame}.`}
                </p>
              </div>
            )}
          </div>
        </CardShell>
      </div>

      <Button
        size="icon"
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-14 w-14 shadow-xl"
        onClick={() => setShowExpenseModal(true)}
      >
        <Plus size={24} />
      </Button>

      <ExpenseModal
        show={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        addExpense={handleAddExpense}
        allCategories={predefinedCategories.concat(customCategories)}
      />
    </div>
  );
};