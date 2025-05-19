import React, { useState, useEffect, useRef, useMemo } from 'react';
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { Trash2, Receipt, Calendar, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { CardShell } from '../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Expense } from '../../types';

interface ExpenseListProps {
  expenses: Expense[];
  filteredExpenses: Expense[];
  deleteExpense: (id: number) => void;
  onAddClick?: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  filteredExpenses,
  deleteExpense,
  onAddClick
}) => {
  const [visibleExpenses, setVisibleExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(1);
  const [timeFrame, setTimeFrame] = useState<'day' | 'week' | 'month' | 'all'>('all');
  const loaderRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;

  // Filter expenses by time frame
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

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleExpenses.length < timeFilteredExpenses.length) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [visibleExpenses.length, timeFilteredExpenses.length]);

  // Update visible expenses when page changes or time frame changes
  useEffect(() => {
    setPage(1);
    setVisibleExpenses(timeFilteredExpenses.slice(0, ITEMS_PER_PAGE));
  }, [timeFilteredExpenses]);

  useEffect(() => {
    setVisibleExpenses(timeFilteredExpenses.slice(0, page * ITEMS_PER_PAGE));
  }, [page, timeFilteredExpenses]);

  // Calculate total for current time frame
  const timeFrameTotal = timeFilteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Animation classes for list items
  const itemClasses = `
    flex items-start justify-between p-3
    border-t border-gray-700/50
    hover:bg-gray-100 dark:hover:bg-gray-700/50
    transition-all duration-200
    animate-in fade-in slide-in-from-top-2
    group
  `;

  return (
    <CardShell>
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Receipt size={18} /> Recent Expenses
          </h3>
          <div className="flex items-center gap-3">
            <Select value={timeFrame} onValueChange={(v) => setTimeFrame(v as typeof timeFrame)}>
              <SelectTrigger className="w-[140px]">
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
            <Button
              onClick={onAddClick}
              size="icon"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-10 h-10 shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 hover:scale-105"
            >
              <Plus size={20} />
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {timeFrame !== 'all' && (
            <span>
              Total for {timeFrame}: <span className="font-medium text-indigo-600 dark:text-indigo-400">£{timeFrameTotal.toLocaleString()}</span>
            </span>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-700/50 overflow-y-auto max-h-[600px] pr-2">
        {visibleExpenses.map((e, index) => (
          <div 
            key={e.id}
            className={itemClasses}
          >
            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-medium truncate pr-4" title={e.description}>
                  {e.description}
                </h4>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium tabular-nums whitespace-nowrap">
                  £{e.amount.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span>{e.category}</span>
                <span className="mx-2">•</span>
                <span>{format(parseISO(e.date), 'MMM d, yyyy')}</span>
                {e.addedBy && e.timestamp && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Added by {e.addedBy} at {format(new Date(e.timestamp), 'h:mm a')}</span>
                  </>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                const element = document.getElementById(`expense-${e.id}`);
                if (element) {
                  element.classList.add('animate-out', 'fade-out', 'slide-out-to-right');
                  setTimeout(() => deleteExpense(e.id), 300);
                } else {
                  deleteExpense(e.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all duration-200"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        
        {!timeFilteredExpenses.length && (
          <div className="text-center py-8">
            <Receipt size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {timeFrame === 'all' 
                ? 'No expenses recorded yet.'
                : `No expenses recorded for this ${timeFrame}.`}
            </p>
          </div>
        )}
        
        {/* Infinite scroll loader */}
        {visibleExpenses.length < timeFilteredExpenses.length && (
          <div ref={loaderRef} className="py-4 text-center">
            <div className="animate-pulse text-gray-400">Loading more...</div>
          </div>
        )}
      </div>
    </CardShell>
  );
};