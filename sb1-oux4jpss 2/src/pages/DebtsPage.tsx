import React, { useState, useMemo } from 'react';
import { 
  CreditCard, Plus, Trash2, Bell, Calendar, Search, ArrowUpDown,
  Check, X, Edit2, AlertCircle, ChevronDown, ChevronUp, Filter,
  Wallet, DollarSign
} from 'lucide-react';
import { format, parseISO, differenceInDays, isThisMonth, isThisWeek } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CardShell } from '../components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { useDebts } from '../hooks/useDebts';
import toast from 'react-hot-toast';

type SortField = 'amount' | 'dueDate' | 'description';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'all' | 'pending' | 'paid';
type DateFilter = 'all' | 'week' | 'month';
type TabType = 'shared' | 'personal';

interface DebtFormData {
  description: string;
  amount: string;
  dueDate: string;
  isRecurring: boolean;
  frequency: 'weekly' | 'monthly';
  paymentAmount?: string;
}

export const DebtsPage = () => {
  const {
    shared: sharedDebts,
    personal: personalDebts,
    addDebt,
    addPersonalDebt,
    addPayment,
    deleteDebt,
    updatePersonalDebtPayment
  } = useDebts();

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('shared');
  const [showForm, setShowForm] = useState(false);
  const [editingDebtId, setEditingDebtId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Form State
  const [debtForm, setDebtForm] = useState<DebtFormData>({
    description: '',
    amount: '',
    dueDate: '',
    isRecurring: false,
    frequency: 'monthly',
    paymentAmount: ''
  });

  const currentUser = localStorage.getItem('user');

  // Filter and sort debts
  const filteredDebts = useMemo(() => {
    const debts = activeTab === 'shared' ? sharedDebts : personalDebts;
    
    return debts
      .filter(debt => {
        // Search filter
        const matchesSearch = debt.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === 'all'
          ? true
          : statusFilter === 'paid'
          ? debt.remainingAmount === 0
          : debt.remainingAmount > 0;

        // Date filter
        const dueDate = parseISO(debt.date);
        const matchesDate = dateFilter === 'all'
          ? true
          : dateFilter === 'week'
          ? isThisWeek(dueDate)
          : isThisMonth(dueDate);

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        if (sortField === 'amount') {
          return sortDirection === 'asc'
            ? a.totalAmount - b.totalAmount
            : b.totalAmount - a.totalAmount;
        }
        if (sortField === 'dueDate') {
          return sortDirection === 'asc'
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return sortDirection === 'asc'
          ? a.description.localeCompare(b.description)
          : b.description.localeCompare(a.description);
      });
  }, [sharedDebts, personalDebts, activeTab, searchTerm, statusFilter, dateFilter, sortField, sortDirection]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const shared = {
      total: sharedDebts.reduce((sum, d) => sum + d.totalAmount, 0),
      paid: sharedDebts.reduce((sum, d) => sum + (d.totalAmount - d.remainingAmount), 0),
      count: sharedDebts.length
    };
    
    const personal = {
      total: personalDebts.reduce((sum, d) => sum + d.totalAmount, 0),
      paid: personalDebts.reduce((sum, d) => sum + (d.totalAmount - d.remainingAmount), 0),
      count: personalDebts.length,
      monthlyPayments: personalDebts.reduce((sum, d) => sum + (d as any).paymentAmount, 0)
    };

    return { shared, personal };
  }, [sharedDebts, personalDebts]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddDebt = () => {
    const amount = parseFloat(debtForm.amount);
    if (!debtForm.description || isNaN(amount) || !debtForm.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (activeTab === 'personal') {
      const paymentAmount = parseFloat(debtForm.paymentAmount || '0');
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        toast.error('Please enter a valid payment amount');
        return;
      }
      addPersonalDebt(debtForm.description, amount, paymentAmount);
    } else {
      addDebt(debtForm.description, amount, true);
    }

    setDebtForm({
      description: '',
      amount: '',
      dueDate: '',
      isRecurring: false,
      frequency: 'monthly',
      paymentAmount: ''
    });
    setShowForm(false);
  };

  const handleScheduleReminder = (debtId: number, days: number) => {
    // In a real app, this would integrate with a notification system
    toast.success(`Reminder scheduled for ${days} days before due date`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard size={24} /> Debts
      </h1>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <CardShell className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold">Shared Debts</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Outstanding</p>
              <p className="text-xl font-bold text-indigo-600">
                £{stats.shared.total.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid</p>
              <p className="text-xl font-bold text-green-600">
                £{stats.shared.paid.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold">{stats.shared.count}</p>
            </div>
          </div>
        </CardShell>

        {currentUser === 'Ray' && (
          <CardShell className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold">Personal Debts</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Outstanding</p>
                <p className="text-xl font-bold text-amber-600">
                  £{stats.personal.total.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid</p>
                <p className="text-xl font-bold text-green-600">
                  £{stats.personal.paid.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monthly</p>
                <p className="text-xl font-bold text-blue-600">
                  £{stats.personal.monthlyPayments.toLocaleString()}
                </p>
              </div>
            </div>
          </CardShell>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'shared' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('shared')}
          className="flex-1 sm:flex-none"
        >
          Shared Debts
        </Button>
        {currentUser === 'Ray' && (
          <Button
            variant={activeTab === 'personal' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('personal')}
            className="flex-1 sm:flex-none"
          >
            Personal Debts
          </Button>
        )}
      </div>

      {/* Add Debt Form */}
      <CardShell className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Add New {activeTab === 'personal' ? 'Personal' : 'Shared'} Debt
          </h2>
          <Button
            variant="ghost"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            {showForm ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showForm ? 'Hide Form' : 'Show Form'}
          </Button>
        </div>

        {showForm && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                placeholder="Description"
                value={debtForm.description}
                onChange={e => setDebtForm(prev => ({ ...prev, description: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Total Amount"
                value={debtForm.amount}
                onChange={e => setDebtForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                type="date"
                value={debtForm.dueDate}
                onChange={e => setDebtForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
              {activeTab === 'personal' ? (
                <Input
                  type="number"
                  placeholder="Monthly Payment Amount"
                  value={debtForm.paymentAmount}
                  onChange={e => setDebtForm(prev => ({ ...prev, paymentAmount: e.target.value }))}
                />
              ) : (
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={debtForm.isRecurring}
                      onChange={e => setDebtForm(prev => ({ 
                        ...prev, 
                        isRecurring: e.target.checked 
                      }))}
                      className="rounded border-gray-300"
                    />
                    <span>Recurring?</span>
                  </label>
                  {debtForm.isRecurring && (
                    <Select
                      value={debtForm.frequency}
                      onValueChange={v => setDebtForm(prev => ({ 
                        ...prev, 
                        frequency: v as 'weekly' | 'monthly' 
                      }))}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDebt}>
                Add {activeTab === 'personal' ? 'Personal' : 'Shared'} Debt
              </Button>
            </div>
          </div>
        )}
      </CardShell>

      {/* Filters */}
      <CardShell className="mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search debts..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={v => setDateFilter(v as DateFilter)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardShell>

      {/* Debts Table/List */}
      <CardShell>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-left">
                  <button
                    className="flex items-center gap-1 hover:text-indigo-600"
                    onClick={() => handleSort('description')}
                  >
                    Description
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="py-3 px-4 text-left">
                  <button
                    className="flex items-center gap-1 hover:text-indigo-600"
                    onClick={() => handleSort('amount')}
                  >
                    Amount
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                {activeTab === 'personal' && (
                  <th className="py-3 px-4 text-left">Payment</th>
                )}
                <th className="py-3 px-4 text-left">
                  <button
                    className="flex items-center gap-1 hover:text-indigo-600"
                    onClick={() => handleSort('dueDate')}
                  >
                    Due Date
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredDebts.map(debt => {
                const isPaid = debt.remainingAmount === 0;
                const dueDate = parseISO(debt.date);
                const daysUntilDue = differenceInDays(dueDate, new Date());
                const progress = Math.max(0, Math.min(100, (daysUntilDue / 30) * 100));
                const isPersonalDebt = 'paymentAmount' in debt;

                return (
                  <tr 
                    key={debt.id}
                    className={`
                      hover:bg-gray-50 dark:hover:bg-gray-800/50
                      ${isPaid ? 'text-gray-500' : ''}
                    `}
                  >
                    <td className="py-3 px-4">
                      {editingDebtId === debt.id ? (
                        <Input
                          value={debt.description}
                          onChange={() => {}} // TODO: Implement inline editing
                          className="w-full"
                        />
                      ) : (
                        <div>
                          <p>{debt.description}</p>
                          {!isPaid && (
                            <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  progress > 66
                                    ? 'bg-green-500'
                                    : progress > 33
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        £{debt.totalAmount.toLocaleString()}
                      </div>
                      {!isPaid && (
                        <div className="text-sm text-gray-500">
                          Remaining: £{debt.remainingAmount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    {isPersonalDebt && (
                      <td className="py-3 px-4">
                        {editingDebtId === debt.id ? (
                          <Input
                            type="number"
                            value={debt.paymentAmount}
                            onChange={(e) => updatePersonalDebtPayment(debt.id, parseFloat(e.target.value))}
                            className="w-32"
                          />
                        ) : (
                          <div className="font-medium">
                            £{debt.paymentAmount.toLocaleString()}
                            <span className="text-sm text-gray-500">/month</span>
                          </div>
                        )}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <div>{format(dueDate, 'MMM d, yyyy')}</div>
                      {!isPaid && daysUntilDue > 0 && (
                        <div className="text-sm text-gray-500">
                          {daysUntilDue} days left
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${isPaid
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                        }
                      `}>
                        {isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        {!isPaid && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addPayment(debt.id, isPersonalDebt)}
                              title="Mark as paid"
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleScheduleReminder(debt.id, 7)}
                              title="Set reminder"
                            >
                              <Bell size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingDebtId(debt.id)}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDebt(debt.id, isPersonalDebt)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredDebts.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No debts found.</p>
            </div>
          )}
        </div>
      </CardShell>
    </div>
  );
};