import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths, isBefore, isToday } from 'date-fns';
import { 
  CalendarDays, ChevronLeft, ChevronRight, Clock, Target, PiggyBank, 
  AlertCircle, DollarSign, Plus, Check, StickyNote, Calendar 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { CardShell } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useBudgetData } from '../hooks/useBudgetData';
import { ExpenseModal } from '../components/modals/ExpenseModal';
import { RecurringModal } from '../components/modals/RecurringModal';
import { predefinedCategories } from '../lib/categories';

interface IncomeEvent {
  date: string;
  amount: number;
  source: string;
  type: 'ray' | 'amber' | 'other';
}

interface DayBalance {
  date: string;
  income: number;
  expenses: number;
  balance: number;
  hasEvents: boolean;
}

interface DayNote {
  id: number;
  date: string;
  text: string;
}

export const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const [dayNotes, setDayNotes] = useState<DayNote[]>(() => {
    const stored = localStorage.getItem('calendarNotes');
    return stored ? JSON.parse(stored) : [];
  });
  const [newNote, setNewNote] = useState('');
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);

  const {
    expenses,
    recurrings,
    budgetGoals,
    savingsGoals,
    budgets,
    expenseForm,
    recForm,
    setExpenseForm,
    setRecForm,
    addExpense,
    markRecurringPaid,
    addRecurring
  } = useBudgetData();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get income events
  const incomeEvents = useMemo(() => {
    const events: IncomeEvent[] = [];
    const incomeData = localStorage.getItem('income');
    
    if (incomeData) {
      const { ray, amber, rayPayDate, amberPayDate, otherSources } = JSON.parse(incomeData);
      
      if (ray && rayPayDate) {
        events.push({
          date: rayPayDate,
          amount: ray,
          source: "Ray's Income",
          type: 'ray'
        });
      }
      
      if (amber && amberPayDate) {
        events.push({
          date: amberPayDate,
          amount: amber,
          source: "Amber's Income",
          type: 'amber'
        });
      }
      
      otherSources.forEach((source: { id: number; source: string; amount: number; payDate?: string }) => {
        if (source.payDate) {
          events.push({
            date: source.payDate,
            amount: source.amount,
            source: source.source,
            type: 'other'
          });
        }
      });
    }
    
    return events;
  }, []);

  // Calculate daily expenses
  const dailyExpenses = useMemo(() => {
    const expenseMap = new Map();
    expenses.forEach(expense => {
      const date = expense.date;
      const current = expenseMap.get(date) || 0;
      expenseMap.set(date, current + expense.amount);
    });
    return expenseMap;
  }, [expenses]);

  // Get all events for the month
  const events = useMemo(() => {
    const allEvents = [];

    // Add recurring payments
    recurrings.forEach(rec => {
      const dueDate = parseISO(rec.nextDue);
      if (dueDate >= monthStart && dueDate <= monthEnd) {
        allEvents.push({
          date: rec.nextDue,
          type: 'recurring',
          title: rec.description,
          amount: rec.amount,
          id: rec.id
        });
      }
    });

    // Add budget goals
    budgetGoals.forEach(goal => {
      const deadline = parseISO(goal.deadline);
      if (deadline >= monthStart && deadline <= monthEnd) {
        allEvents.push({
          date: goal.deadline,
          type: 'budget',
          title: goal.name,
          target: goal.targetAmount,
          current: goal.currentAmount,
        });
      }
    });

    // Add savings goals
    savingsGoals.forEach(goal => {
      const deadline = parseISO(goal.deadline);
      if (deadline >= monthStart && deadline <= monthEnd) {
        allEvents.push({
          date: goal.deadline,
          type: 'savings',
          title: goal.name,
          target: goal.targetAmount,
          current: goal.currentAmount,
        });
      }
    });

    return allEvents;
  }, [recurrings, budgetGoals, savingsGoals, monthStart, monthEnd]);

  // Calculate daily balances
  const dailyBalances = useMemo(() => {
    const balances: DayBalance[] = [];
    let runningBalance = 0;

    daysInMonth.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Get day's income events
      const dayIncome = incomeEvents
        .filter(e => isSameDay(parseISO(e.date), day))
        .reduce((sum, e) => sum + e.amount, 0);

      // Get day's recurring payments
      const dayRecurrings = recurrings
        .filter(r => isSameDay(parseISO(r.nextDue), day))
        .reduce((sum, r) => sum + r.amount, 0);

      // Get day's expenses
      const dayExpenses = dailyExpenses.get(dateStr) || 0;

      // Check if day has any events
      const hasEvents = dayIncome > 0 || dayRecurrings > 0 || dayExpenses > 0;

      runningBalance += dayIncome - dayRecurrings - dayExpenses;

      balances.push({
        date: dateStr,
        income: dayIncome,
        expenses: dayExpenses + dayRecurrings,
        balance: runningBalance,
        hasEvents
      });
    });

    return balances;
  }, [daysInMonth, incomeEvents, recurrings, dailyExpenses]);

  // Handle note operations
  const addNote = (date: string) => {
    if (!newNote.trim()) return;
    
    const note: DayNote = {
      id: Date.now(),
      date,
      text: newNote.trim()
    };
    
    const updatedNotes = [...dayNotes, note];
    setDayNotes(updatedNotes);
    localStorage.setItem('calendarNotes', JSON.stringify(updatedNotes));
    setNewNote('');
  };

  const deleteNote = (id: number) => {
    const updatedNotes = dayNotes.filter(note => note.id !== id);
    setDayNotes(updatedNotes);
    localStorage.setItem('calendarNotes', JSON.stringify(updatedNotes));
  };

  const handleAddClick = (date: string, isRecurring = false) => {
    if (isRecurring) {
      setRecForm(prev => ({
        ...prev,
        nextDue: date
      }));
      setShowRecurringModal(true);
    } else {
      setExpenseForm(prev => ({
        ...prev,
        date
      }));
      setShowExpenseModal(true);
    }
  };

  const handleAddExpense = () => {
    addExpense();
    setShowExpenseModal(false);
  };

  const handleAddRecurring = () => {
    addRecurring();
    setShowRecurringModal(false);
  };

  const getDayContent = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayExpenses = dailyExpenses.get(dateStr) || 0;
    const dayEvents = events.filter(event => isSameDay(parseISO(event.date), day));
    const dayIncomeEvents = incomeEvents.filter(event => isSameDay(parseISO(event.date), day));
    const dayRecurrings = recurrings.filter(r => isSameDay(parseISO(r.nextDue), day));
    const dayBalance = dailyBalances.find(b => b.date === dateStr);
    const dayNotesList = dayNotes.filter(note => note.date === dateStr);

    // Calculate expense indicator color based on daily budget
    const dailyBudget = (budgets[0]?.total || 0) / daysInMonth.length;
    let expenseColor = 'bg-green-500';
    if (dayExpenses > dailyBudget * 1.5) expenseColor = 'bg-red-500';
    else if (dayExpenses > dailyBudget) expenseColor = 'bg-yellow-500';

    const isSelected = selectedDate === dateStr;

    return (
      <div 
        className={`
          min-h-[120px] p-2 relative group cursor-pointer
          ${isSelected ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}
          ${isToday(day) ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''}
        `}
        onClick={() => setSelectedDate(dateStr)}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`
            text-sm font-medium
            ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : ''}
            ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : ''}
          `}>
            {format(day, 'd')}
          </span>
          {dayExpenses > 0 && (
            <span className={`w-2 h-2 rounded-full ${expenseColor}`} />
          )}
        </div>
        
        {/* Income Events */}
        {dayIncomeEvents.map((event, idx) => (
          <div 
            key={`income-${idx}`}
            className="text-xs mb-1 truncate group relative"
            title={`${event.source}: £${event.amount.toLocaleString()}`}
          >
            <div className={`
              flex items-center gap-1
              ${event.type === 'ray' ? 'text-indigo-600' : 
                event.type === 'amber' ? 'text-pink-600' : 
                'text-green-600'}
            `}>
              <DollarSign size={10} />
              <span>£{event.amount.toLocaleString()}</span>
            </div>
          </div>
        ))}

        {/* Recurring Payments */}
        {dayRecurrings.map((recurring, idx) => (
          <div 
            key={`recurring-${idx}`}
            className="text-xs mb-1 truncate group relative"
          >
            <div className="flex items-center gap-1 text-red-600">
              <Clock size={10} />
              <span>-£{recurring.amount.toLocaleString()}</span>
            </div>
            <div className="
              absolute left-0 top-full hidden group-hover:block z-10
              bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 min-w-[200px]
            ">
              <p className="font-medium">{recurring.description}</p>
              <p className="text-red-500">-£{recurring.amount.toLocaleString()}</p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    markRecurringPaid(recurring.id);
                  }}
                >
                  <Check size={12} className="mr-1" /> Mark Paid
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Other Events */}
        {dayEvents.map((event, idx) => (
          <div 
            key={`event-${idx}`}
            className="text-xs mb-1 truncate group relative"
          >
            <div className={`
              flex items-center gap-1
              ${event.type === 'budget' ? 'text-purple-600' :
                event.type === 'savings' ? 'text-green-600' :
                'text-blue-600'}
            `}>
              {event.type === 'budget' && <Target size={10} />}
              {event.type === 'savings' && <PiggyBank size={10} />}
              <span>{event.title}</span>
            </div>
          </div>
        ))}

        {/* Notes */}
        {dayNotesList.length > 0 && (
          <div className="absolute bottom-1 right-1">
            <StickyNote size={12} className="text-amber-500" />
          </div>
        )}
        
        {/* Balance */}
        {dayBalance?.hasEvents && (
          <div className={`
            text-xs mt-1 font-medium
            ${dayBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'}
          `}>
            £{dayBalance.balance.toLocaleString()}
          </div>
        )}

        {/* Quick Actions Tooltip */}
        <div className="
          absolute top-0 right-0 mt-2 mr-2
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          flex gap-1
        ">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              handleAddClick(dateStr, false);
            }}
          >
            <Plus size={12} />
          </Button>
        </div>
      </div>
    );
  };

  // Render agenda view
  const renderAgenda = () => {
    const upcomingEvents = [...events, ...incomeEvents.map(e => ({
      date: e.date,
      type: 'income',
      title: e.source,
      amount: e.amount
    }))].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    return (
      <div className="space-y-4">
        {upcomingEvents.map((event, idx) => (
          <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-500">
                  {format(parseISO(event.date), 'MMMM d, yyyy')}
                </p>
              </div>
              <div className={`
                font-medium
                ${event.type === 'income' ? 'text-green-600' : 
                  event.type === 'recurring' ? 'text-red-600' : 
                  'text-gray-600'}
              `}>
                {event.type === 'income' ? '+' : '-'}£{event.amount?.toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays size={24} /> Financial Calendar
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setViewMode(mode => mode === 'month' ? 'agenda' : 'month')}
          >
            <Calendar size={16} className="mr-2" />
            {viewMode === 'month' ? 'Agenda View' : 'Month View'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowMiniCalendar(!showMiniCalendar)}
          >
            <Calendar size={16} className="mr-2" />
            Jump to Date
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <CardShell>
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
            >
              <ChevronLeft size={20} />
            </Button>
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button
              variant="ghost"
              onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
            >
              <ChevronRight size={20} />
            </Button>
          </div>

          {viewMode === 'month' ? (
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {/* Weekday headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div 
                  key={day} 
                  className="bg-gray-100 dark:bg-gray-800 p-2 text-center font-medium"
                >
                  {day}
                </div>
              ))}
              
              {/* Calendar grid */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-start-${i}`} className="bg-white dark:bg-gray-800" />
              ))}
              
              {daysInMonth.map(day => (
                <div 
                  key={day.toISOString()} 
                  className="bg-white dark:bg-gray-800 border-t dark:border-gray-700"
                >
                  {getDayContent(day)}
                </div>
              ))}
              
              {Array.from({ 
                length: 6 - monthEnd.getDay() 
              }).map((_, i) => (
                <div key={`empty-end-${i}`} className="bg-white dark:bg-gray-800" />
              ))}
            </div>
          ) : (
            renderAgenda()
          )}
        </CardShell>

        {/* Selected Day Details */}
        {selectedDate && (
          <CardShell>
            <h3 className="text-lg font-semibold mb-4">
              {format(parseISO(selectedDate), 'MMMM d, yyyy')}
            </h3>
            
            <div className="space-y-4">
              {/* Day's Events */}
              <div>
                <h4 className="font-medium mb-2">Events</h4>
                <div className="space-y-2">
                  {events
                    .filter(event => event.date === selectedDate)
                    .map((event, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500">
                          {event.type === 'recurring' && `Due: £${event.amount}`}
                          {event.type === 'budget' && 
                            `Target: £${event.target} (Current: £${event.current})`}
                          {event.type === 'savings' && 
                            `Goal: £${event.target} (Saved: £${event.current})`}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="flex-1"
                  />
                  <Button onClick={() => addNote(selectedDate)}>Add</Button>
                </div>
                <div className="space-y-2">
                  {dayNotes
                    .filter(note => note.date === selectedDate)
                    .map(note => (
                      <div key={note.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
                        <p>{note.text}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          className="text-red-500"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardShell>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardShell>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-blue-500" size={18} />
              <h3 className="font-medium">Recurring Payments</h3>
            </div>
            <p className="text-sm text-gray-500">
              {recurrings.length} upcoming payments this month
            </p>
          </CardShell>

          <CardShell>
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-purple-500" size={18} />
              <h3 className="font-medium">Budget Goals</h3>
            </div>
            <p className="text-sm text-gray-500">
              {budgetGoals.length} active budget goals
            </p>
          </CardShell>

          <CardShell>
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="text-green-500" size={18} />
              <h3 className="font-medium">Savings Goals</h3>
            </div>
            <p className="text-sm text-gray-500">
              {savingsGoals.length} savings targets
            </p>
          </CardShell>

          <CardShell>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-red-500" size={18} />
              <h3 className="font-medium">High Spend Days</h3>
            </div>
            <p className="text-sm text-gray-500">
              {Array.from(dailyExpenses.values()).filter(
                amount => amount > (budgets[0]?.total || 0) / daysInMonth.length
              ).length} days over budget
            </p>
          </CardShell>
        </div>
      </div>

      <Button
        size="icon"
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-14 w-14 shadow-xl"
        onClick={() => handleAddClick(selectedDate || format(new Date(), 'yyyy-MM-dd'), false)}
      >
        <Plus size={24} />
      </Button>

      <ExpenseModal
        show={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        addExpense={handleAddExpense}
        allCategories={predefinedCategories}
      />

      <RecurringModal
        show={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
        recForm={recForm}
        setRecForm={setRecForm}
        addRecurring={handleAddRecurring}
      />
    </div>
  );
};