import React, { useState } from 'react';
import { 
  Plus, 
  BarChart2, 
  Settings, 
  Clock, 
  AlertCircle,
  Receipt,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { KPICard } from '../components/dashboard/KPICard';
import { TodoList } from '../components/dashboard/TodoList';
import { RecurringPaymentsList } from '../components/dashboard/RecurringPaymentsList';
import { ExpenseList } from '../components/dashboard/ExpenseList';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { ExpenseModal } from '../components/modals/ExpenseModal';
import { RecurringModal } from '../components/modals/RecurringModal';
import { CategoryModal } from '../components/modals/CategoryModal';
import { useBudgetData } from '../hooks/useBudgetData';
import { predefinedCategories } from '../lib/categories';

export const DashboardPage = () => {
  const {
    expenses,
    recurrings,
    todos,
    customCategories,
    theme,
    expenseForm,
    recForm,
    todoInput,
    todoDue,
    categoryForm,
    totalExpenses,
    totalIncome,
    netIncome,
    upcomingRecurrings,
    setExpenseForm,
    setRecForm,
    setTodoInput,
    setTodoDue,
    setCategoryForm,
    setTheme,
    addExpense,
    deleteExpense,
    addRecurring,
    markRecurringPaid,
    deleteRecurring,
    addTodo,
    toggleTodo,
    deleteTodo,
    moveTodo,
    addCustomCategory,
  } = useBudgetData();

  // UI state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRecModal, setShowRecModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Combined categories
  const allCategories = [...predefinedCategories, ...customCategories];

  // Get recent expenses
  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome back! Here's your financial overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle 
              isDark={theme.isDarkMode} 
              onToggle={() => setTheme({ ...theme, isDarkMode: !theme.isDarkMode })} 
            />
            <Button 
              onClick={() => setShowRecModal(true)} 
              className="hidden md:flex items-center gap-2"
              variant="secondary"
            >
              <Clock size={18} /> Add Recurring
            </Button>
            <Button 
              onClick={() => setShowCategoryModal(true)} 
              variant="secondary"
            >
              <Settings size={18} className="mr-2" /> Categories
            </Button>
          </div>
        </div>

        <div className="grid gap-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <KPICard 
              icon={Wallet} 
              label="Total Expenses" 
              value={`£${totalExpenses.toLocaleString()}`} 
              variant={totalExpenses > totalIncome ? "danger" : "default"}
              className="transform hover:scale-[1.03] hover:shadow-lg transition-all duration-200"
            />
            <KPICard 
              icon={TrendingUp} 
              label="Net Income" 
              value={`£${netIncome.toLocaleString()}`}
              variant={netIncome >= 0 ? "success" : "danger"}
              className="transform hover:scale-[1.03] hover:shadow-lg transition-all duration-200"
            />
            <KPICard 
              icon={AlertCircle} 
              label="Upcoming Payments" 
              value={`£${upcomingRecurrings.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}`}
              description={`${upcomingRecurrings.length} payment${upcomingRecurrings.length !== 1 ? 's' : ''} due`}
              variant={upcomingRecurrings.length > 0 ? "warning" : "success"}
              className="transform hover:scale-[1.03] hover:shadow-lg transition-all duration-200"
            />
          </div>

          <hr className="border-t border-gray-200 dark:border-gray-700" />

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <ExpenseList
                expenses={recentExpenses}
                filteredExpenses={recentExpenses}
                deleteExpense={deleteExpense}
                onAddClick={() => setShowExpenseModal(true)}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <RecurringPaymentsList
                upcomingRecurrings={upcomingRecurrings}
                markRecurringPaid={markRecurringPaid}
                deleteRecurring={deleteRecurring}
              />
              
              <TodoList
                todos={todos}
                todoInput={todoInput}
                setTodoInput={setTodoInput}
                todoDue={todoDue}
                setTodoDue={setTodoDue}
                addTodo={addTodo}
                toggleTodo={toggleTodo}
                deleteTodo={deleteTodo}
                moveTodo={moveTodo}
              />
            </div>
          </div>
        </div>
      </div>
      
      <ExpenseModal
        show={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        addExpense={() => {
          addExpense();
          setShowExpenseModal(false);
        }}
        allCategories={allCategories}
      />
      
      <RecurringModal
        show={showRecModal}
        onClose={() => setShowRecModal(false)}
        recForm={recForm}
        setRecForm={setRecForm}
        addRecurring={() => {
          addRecurring();
          setShowRecModal(false);
        }}
      />
      
      <CategoryModal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categoryForm={categoryForm}
        setCategoryForm={setCategoryForm}
        addCustomCategory={() => {
          addCustomCategory();
          setShowCategoryModal(false);
        }}
        customCategories={customCategories}
      />
    </div>
  );
};