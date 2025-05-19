import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { CardShell } from '../ui/Card';
import { Expense } from '../../types';

interface ExpenseAnalyticsProps {
  expenses: Expense[];
}

export const ExpenseAnalytics: React.FC<ExpenseAnalyticsProps> = ({ expenses }) => {
  const monthlyData = React.useMemo(() => {
    const now = new Date();
    const interval = {
      start: startOfMonth(now),
      end: endOfMonth(now),
    };

    const days = eachDayOfInterval(interval);
    const dailyExpenses = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const total = expenses
        .filter(e => e.date === dayStr)
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        date: dayStr,
        amount: total,
      };
    });

    return dailyExpenses;
  }, [expenses]);

  const monthlyTotal = monthlyData.reduce((sum, day) => sum + day.amount, 0);
  const dailyAverage = monthlyTotal / monthlyData.length;

  return (
    <CardShell>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp size={18} /> Monthly Expense Trend
      </h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Monthly Total: <span className="font-medium">£{monthlyTotal.toLocaleString()}</span>
        </p>
        <p className="text-sm text-gray-600">
          Daily Average: <span className="font-medium">£{dailyAverage.toFixed(2)}</span>
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={str => format(parseISO(str), 'd')}
              interval={2}
            />
            <YAxis />
            <Tooltip
              labelFormatter={label => format(parseISO(label), 'MMM d, yyyy')}
              formatter={(value: number) => [`£${value.toFixed(2)}`, 'Amount']}
            />
            <Bar dataKey="amount" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardShell>
  );
};