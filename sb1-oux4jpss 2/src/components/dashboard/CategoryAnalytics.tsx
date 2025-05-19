import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChartIcon } from 'lucide-react';
import { CardShell } from '../ui/Card';
import { Expense } from '../../types';
import { getCategoryColors } from '../../lib/colors';

interface CategoryAnalyticsProps {
  expenses: Expense[];
  customCategoriesCount: number;
}

export const CategoryAnalytics: React.FC<CategoryAnalyticsProps> = ({ expenses, customCategoriesCount }) => {
  const data = useMemo(() => {
    const byCat: Record<string, number> = {};
    expenses.forEach(e => { 
      byCat[e.category] = (byCat[e.category] || 0) + e.amount; 
    });
    return Object.entries(byCat).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const CATEGORY_COLORS = getCategoryColors(customCategoriesCount);

  return (
    <CardShell>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <PieChartIcon size={18} /> Spending by Category
      </h3>
      {data.length ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
              {data.map((_, idx) => (
                <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => `£${v.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-500 text-center py-12">No expense data yet.</p>
      )}
    </CardShell>
  );
};