import React, { useState, useMemo } from 'react';
import { Clock, TrendingUp, Zap, BarChart2, Plus, Tags, AlertCircle, Trash2 } from 'lucide-react';
import { format, parseISO, addMonths, isBefore, isValid } from 'date-fns';
import { Button } from '../components/ui/Button';
import { CardShell } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { useBudgetData } from '../hooks/useBudgetData';
import { RecurringPayment } from '../types';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Bills',
  'Subscriptions',
  'Rent',
  'Insurance',
  'Utilities',
  'Other'
];

const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue'
} as const;

const formatDate = (dateString: string) => {
  const parsedDate = parseISO(dateString);
  return isValid(parsedDate) ? format(parsedDate, 'MMM d, yyyy') : 'Invalid Date';
};

export const RecurringPage = () => {
  const { 
    recurrings, 
    expenses, 
    recForm, 
    setRecForm, 
    addRecurring, 
    markRecurringPaid,
    deleteRecurring 
  } = useBudgetData();
  const [showAddForm, setShowAddForm] = useState(false);

  // Analytics
  const recurringAnalytics = useMemo(() => {
    const today = new Date();
    const sixMonthsAgo = addMonths(today, -6);
    
    // Monthly totals
    const monthlyTotals = new Map<string, number>();
    recurrings.forEach(rec => {
      const parsedDate = parseISO(rec.nextDue);
      if (isValid(parsedDate)) {
        const month = format(parsedDate, 'MMM yyyy');
        monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + rec.amount);
      }
    });

    // Category breakdown
    const categoryTotals = new Map<string, number>();
    recurrings.forEach(rec => {
      const cat = rec.category || 'Other';
      categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + rec.amount);
    });

    // Detect potential recurring from expenses
    const potentialRecurrings = expenses
      .filter(e => {
        const similar = expenses.filter(e2 => 
          e2.description.toLowerCase() === e.description.toLowerCase() &&
          e2.amount === e.amount
        );
        return similar.length >= 2;
      })
      .reduce((acc, curr) => {
        const key = `${curr.description}-${curr.amount}`;
        if (!acc.has(key)) {
          acc.set(key, {
            description: curr.description,
            amount: curr.amount,
            count: 1
          });
        }
        return acc;
      }, new Map());

    return {
      monthlyTotals: Array.from(monthlyTotals.entries()),
      categoryTotals: Array.from(categoryTotals.entries()),
      potentialRecurrings: Array.from(potentialRecurrings.values())
    };
  }, [recurrings, expenses]);

  const getPaymentStatus = (payment: RecurringPayment) => {
    const dueDate = parseISO(payment.nextDue);
    if (!isValid(dueDate)) return PAYMENT_STATUS.PENDING;
    
    const today = new Date();
    if (isBefore(dueDate, today)) {
      return PAYMENT_STATUS.OVERDUE;
    }
    return PAYMENT_STATUS.PENDING;
  };

  const handleAddRecurring = () => {
    if (!recForm.description || !recForm.amount || !recForm.nextDue) {
      toast.error('Please fill in all required fields');
      return;
    }

    addRecurring();
    setShowAddForm(false);
    setRecForm({
      description: '',
      amount: '',
      category: 'Bills',
      frequency: 'monthly',
      nextDue: '',
      variableAmount: false,
      notes: '',
      reminderDays: 7
    });
  };

  const handleDeleteRecurring = (id: number) => {
    if (window.confirm('Are you sure you want to delete this recurring payment?')) {
      deleteRecurring(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock size={24} /> Recurring Payments
        </h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} className="mr-2" /> Add Recurring
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Add Form */}
        {showAddForm && (
          <CardShell>
            <h2 className="text-lg font-semibold mb-4">New Recurring Payment</h2>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Description"
                  value={recForm.description}
                  onChange={e => setRecForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={recForm.amount}
                  onChange={e => setRecForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <Select
                  value={recForm.category}
                  onValueChange={v => setRecForm(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={recForm.frequency}
                  onValueChange={v => setRecForm(prev => ({ 
                    ...prev, 
                    frequency: v as 'weekly' | 'monthly' | 'yearly'
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  value={recForm.nextDue}
                  onChange={e => setRecForm(prev => ({ ...prev, nextDue: e.target.value }))}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="variableAmount"
                    checked={recForm.variableAmount}
                    onChange={e => setRecForm(prev => ({ 
                      ...prev, 
                      variableAmount: e.target.checked 
                    }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="variableAmount" className="text-sm">
                    Variable amount
                  </label>
                </div>

                <Select
                  value={recForm.reminderDays?.toString()}
                  onValueChange={v => setRecForm(prev => ({ ...prev, reminderDays: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Reminder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days before</SelectItem>
                    <SelectItem value="7">1 week before</SelectItem>
                    <SelectItem value="14">2 weeks before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Notes (optional)"
                value={recForm.notes}
                onChange={e => setRecForm(prev => ({ ...prev, notes: e.target.value }))}
              />

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRecurring}>
                  Add Payment
                </Button>
              </div>
            </div>
          </CardShell>
        )}

        {/* Analytics Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardShell>
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="text-indigo-500" size={20} />
              <h3 className="font-medium">Monthly Average</h3>
            </div>
            <p className="text-2xl font-bold">
              £{(recurringAnalytics.monthlyTotals.reduce((sum, [_, amount]) => sum + amount, 0) / 
                Math.max(recurringAnalytics.monthlyTotals.length, 1)).toFixed(2)}
            </p>
          </CardShell>

          <CardShell>
            <div className="flex items-center gap-2 mb-2">
              <Tags className="text-green-500" size={20} />
              <h3 className="font-medium">Top Category</h3>
            </div>
            <p className="text-2xl font-bold">
              {recurringAnalytics.categoryTotals.sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </p>
          </CardShell>

          <CardShell>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-red-500" size={20} />
              <h3 className="font-medium">Overdue</h3>
            </div>
            <p className="text-2xl font-bold">
              {recurrings.filter(r => getPaymentStatus(r) === PAYMENT_STATUS.OVERDUE).length}
            </p>
          </CardShell>

          <CardShell>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-amber-500" size={20} />
              <h3 className="font-medium">Auto-detected</h3>
            </div>
            <p className="text-2xl font-bold">
              {recurringAnalytics.potentialRecurrings.length}
            </p>
          </CardShell>
        </div>

        {/* Recurring Payments List */}
        <CardShell>
          <div className="space-y-4">
            {recurrings.map(payment => {
              const status = getPaymentStatus(payment);
              return (
                <div 
                  key={payment.id}
                  className={`
                    p-4 rounded-lg
                    ${status === PAYMENT_STATUS.OVERDUE 
                      ? 'bg-red-50 dark:bg-red-500/10' 
                      : 'bg-gray-50 dark:bg-gray-800/50'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{payment.description}</h4>
                      <p className="text-sm text-gray-500">
                        {payment.category} • {payment.frequency} • 
                        Due {formatDate(payment.nextDue)}
                      </p>
                      {payment.notes && (
                        <p className="text-sm text-gray-500 mt-1">{payment.notes}</p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-medium">£{payment.amount.toLocaleString()}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markRecurringPaid(payment.id)}
                          className={status === PAYMENT_STATUS.OVERDUE ? 'text-red-600' : ''}
                        >
                          Mark as Paid
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecurring(payment.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {recurrings.length === 0 && (
              <div className="text-center py-8">
                <Clock size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No recurring payments yet.</p>
              </div>
            )}
          </div>
        </CardShell>

        {/* Auto-detected Recurring */}
        {recurringAnalytics.potentialRecurrings.length > 0 && (
          <CardShell>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap size={18} /> Suggested Recurring Payments
            </h2>
            <div className="space-y-2">
              {recurringAnalytics.potentialRecurrings.map((payment, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                  <div>
                    <p className="font-medium">{payment.description}</p>
                    <p className="text-sm text-gray-500">
                      Found {payment.count} similar transactions
                    </p>
                  </div>
                  <Button variant="secondary" size="sm">
                    Add as Recurring
                  </Button>
                </div>
              ))}
            </div>
          </CardShell>
        )}

        {/* Spending Trends */}
        <CardShell>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Monthly Trends
          </h2>
          <div className="h-[200px]">
            {/* Add a chart here to show monthly spending trends */}
          </div>
        </CardShell>
      </div>
    </div>
  );
};