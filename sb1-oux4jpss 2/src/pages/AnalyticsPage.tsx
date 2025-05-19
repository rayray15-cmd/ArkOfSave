import React, { useState, useMemo, useCallback } from 'react';
import { 
  PieChartIcon, TrendingUp, ArrowUpDown, DollarSign, 
  Wallet, Calendar, Tag, Download, Settings, ChevronDown,
  AlertCircle, Filter, RefreshCw, FileDown
} from 'lucide-react';
import { format, parseISO, isSameMonth, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';
import { CardShell } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { useBudgetData } from '../hooks/useBudgetData';
import { getCategoryColors } from '../lib/colors';
import toast from 'react-hot-toast';

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label, prefix = '£' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {prefix}{entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsPage = () => {
  const { expenses, customCategories } = useBudgetData();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ current: 0, target: 0 });

  // Calculate date range
  const dateRangeFilter = useMemo(() => {
    let end = new Date();
    let start;
    
    switch (dateRange) {
      case '7d':
        start = subMonths(end, 0.25);
        break;
      case '30d':
        start = subMonths(end, 1);
        break;
      case '90d':
        start = subMonths(end, 3);
        break;
      case 'custom':
        start = customStartDate ? parseISO(customStartDate) : subMonths(end, 1);
        end = customEndDate ? parseISO(customEndDate) : end;
        break;
      default:
        start = subMonths(end, 1);
    }
    
    return { start, end };
  }, [dateRange, customStartDate, customEndDate]);

  // Filter expenses by date range and selected category
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = parseISO(expense.date);
      const inDateRange = expenseDate >= dateRangeFilter.start && expenseDate <= dateRangeFilter.end;
      const matchesCategory = !selectedCategory || expense.category === selectedCategory;
      return inDateRange && matchesCategory;
    });
  }, [expenses, dateRangeFilter, selectedCategory]);

  // Calculate statistics with previous period comparison
  const stats = useMemo(() => {
    const currentTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const daysInRange = Math.ceil((dateRangeFilter.end.getTime() - dateRangeFilter.start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate previous period
    const previousStart = subMonths(dateRangeFilter.start, 1);
    const previousEnd = subMonths(dateRangeFilter.end, 1);
    const previousExpenses = expenses.filter(e => {
      const date = parseISO(e.date);
      return date >= previousStart && date <= previousEnd;
    });
    const previousTotal = previousExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Calculate daily average
    const dailyAvg = currentTotal / daysInRange;
    const previousDailyAvg = previousTotal / daysInRange;
    
    // Calculate percent changes
    const totalChange = ((currentTotal - previousTotal) / previousTotal) * 100;
    const avgChange = ((dailyAvg - previousDailyAvg) / previousDailyAvg) * 100;
    
    return {
      total: currentTotal,
      previousTotal,
      totalChange,
      dailyAvg,
      previousDailyAvg,
      avgChange,
      daysInRange
    };
  }, [filteredExpenses, dateRangeFilter, expenses]);

  // Category breakdown with sparklines
  const categoryData = useMemo(() => {
    const byCat: Record<string, { 
      total: number; 
      count: number;
      history: { date: string; amount: number }[];
    }> = {};
    
    let grandTotal = 0;

    // Initialize categories
    expenses.forEach(e => {
      if (!byCat[e.category]) {
        byCat[e.category] = { total: 0, count: 0, history: [] };
      }
    });

    // Process expenses
    filteredExpenses.forEach(e => {
      byCat[e.category].total += e.amount;
      byCat[e.category].count += 1;
      byCat[e.category].history.push({
        date: e.date,
        amount: e.amount
      });
      grandTotal += e.amount;
    });

    return Object.entries(byCat)
      .map(([name, data]) => ({
        name,
        ...data,
        percentage: (data.total / grandTotal) * 100,
        avgPerTransaction: data.total / data.count
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses, expenses]);

  // Daily spending data
  const dailySpendingData = useMemo(() => {
    const days = eachDayOfInterval({
      start: startOfMonth(dateRangeFilter.start),
      end: endOfMonth(dateRangeFilter.end)
    });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayExpenses = filteredExpenses.filter(e => e.date === dayStr);
      return {
        date: format(day, 'MMM dd'),
        amount: dayExpenses.reduce((sum, e) => sum + e.amount, 0),
        count: dayExpenses.length
      };
    });
  }, [filteredExpenses, dateRangeFilter]);

  // Category colors
  const CATEGORY_COLORS = getCategoryColors(customCategories.length);

  // Handle category click in charts
  const handleCategoryClick = useCallback((data: any) => {
    if (data && data.name) {
      setSelectedCategory(prev => prev === data.name ? null : data.name);
      // Animate stats
      setAnimatedStats({
        current: 0,
        target: data.value
      });
    }
  }, []);

  // Toggle category expansion
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Export data
  const handleExport = (type: 'csv' | 'pdf') => {
    // Implementation would go here
    toast.success(`Exporting as ${type.toUpperCase()}...`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PieChartIcon size={24} /> Analytics
        </h1>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="w-40"
              />
              <span>to</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="w-40"
              />
            </div>
          )}
          
          <Button variant="ghost" onClick={() => setShowCustomizeModal(true)}>
            <Settings size={16} className="mr-2" /> Customize
          </Button>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" onClick={() => handleExport('csv')}>
              <FileDown size={16} className="mr-2" /> CSV
            </Button>
            <Button variant="ghost" onClick={() => handleExport('pdf')}>
              <FileDown size={16} className="mr-2" /> PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardShell className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-lg">
                <DollarSign size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Spend</p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  £{stats.total.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <span className={stats.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {stats.totalChange >= 0 ? '↑' : '↓'} {Math.abs(stats.totalChange).toFixed(1)}%
                  </span>
                  <span className="text-gray-500">vs previous</span>
                </div>
              </div>
            </div>
            <div className="mt-4 h-[30px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySpendingData.slice(-7)}>
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.1} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardShell>

          <CardShell className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Tag size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Daily Average</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  £{stats.dailyAvg.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  <span className={stats.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {stats.avgChange >= 0 ? '↑' : '↓'} {Math.abs(stats.avgChange).toFixed(1)}%
                  </span>
                  <span className="text-gray-500">vs previous</span>
                </div>
              </div>
            </div>
            <div className="mt-4 h-[30px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySpendingData.slice(-7)}>
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#059669" 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardShell>

          <CardShell className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Calendar size={24} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {filteredExpenses.length}
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {(filteredExpenses.length / stats.daysInRange).toFixed(1)} per day
                </p>
              </div>
            </div>
            <div className="mt-4 h-[30px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySpendingData.slice(-7)}>
                  <Bar dataKey="count" fill="#d97706" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardShell>

          <CardShell className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Wallet size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Top Category</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {categoryData[0]?.name || 'N/A'}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  £{categoryData[0]?.total.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <div className="mt-4 h-[30px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={categoryData[0]?.history.slice(-7) || []}>
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardShell>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <CardShell>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp size={18} /> Spending Trend
              </h3>
              {selectedCategory && (
                <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
                  <Filter size={16} className="mr-2" /> Clear Filter
                </Button>
              )}
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySpendingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    interval={Math.floor(dailySpendingData.length / 10)}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="amount" 
                    fill="#6366f1" 
                    radius={[4, 4, 0, 0]}
                    onClick={handleCategoryClick}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardShell>

          {/* Category Distribution */}
          <CardShell>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon size={18} /> Category Distribution
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    onClick={handleCategoryClick}
                  >
                    {categoryData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        className="transition-all duration-200 hover:opacity-80"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardShell>
        </div>

        {/* Category Breakdown */}
        <CardShell>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ArrowUpDown size={18} /> Category Breakdown
          </h3>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={category.name}>
                <div 
                  className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-3 rounded-lg transition-colors cursor-pointer"
                  onClick={() => toggleCategoryExpansion(category.name)}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-32 font-medium truncate" title={category.name}>
                      {category.name}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-32 text-right tabular-nums font-medium">
                      £{category.total.toLocaleString()}
                    </div>
                    <div className="w-20 text-right text-gray-500 tabular-nums">
                      {category.percentage.toFixed(1)}%
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`
                        transition-transform duration-200
                        ${expandedCategories.has(category.name) ? 'rotate-180' : ''}
                      `}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      Transactions: <span className="font-medium">{category.count}</span>
                    </div>
                    <div className="text-right">
                      Avg per transaction: <span className="font-medium">£{category.avgPerTransaction.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Expanded View */}
                {expandedCategories.has(category.name) && (
                  <div className="mt-2 pl-4 space-y-2 animate-in slide-in-from-top-2">
                    <div className="h-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={category.history}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={str => format(parseISO(str), 'MMM d')}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={label => format(parseISO(label), 'MMM d, yyyy')}
                            formatter={(value: number) => [`£${value.toFixed(2)}`, 'Amount']}
                          />
                          <Area
                            type="monotone"
                            dataKey="amount"
                            stroke={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            fillOpacity={0.1}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Transaction List */}
                    <div className="mt-4 space-y-2">
                      {filteredExpenses
                        .filter(e => e.category === category.name)
                        .slice(0, 5)
                        .map(expense => (
                          <div 
                            key={expense.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{expense.description}</p>
                              <p className="text-sm text-gray-500">
                                {format(parseISO(expense.date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <p className="font-medium tabular-nums">
                              £{expense.amount.toLocaleString()}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardShell>
      </div>
    </div>
  );
};