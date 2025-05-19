import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Trash2, Calendar, PiggyBank, Wallet, BarChart2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CardShell } from '../components/ui/Card';
import { KPICard } from '../components/dashboard/KPICard';
import { useBudgetData } from '../hooks/useBudgetData';
import toast from 'react-hot-toast';

interface OtherIncome {
  id: number;
  source: string;
  amount: number;
  payDate?: string;
}

interface IncomeState {
  ray: number;
  amber: number;
  rayPayDate: string;
  amberPayDate: string;
  otherSources: OtherIncome[];
}

export const IncomePage = () => {
  const { updateBudgetTotal, totalExpenses } = useBudgetData();
  const [incomeState, setIncomeState] = useState<IncomeState>(() => {
    const stored = localStorage.getItem('income');
    return stored ? JSON.parse(stored) : {
      ray: 0,
      amber: 0,
      rayPayDate: '',
      amberPayDate: '',
      otherSources: []
    };
  });

  const [newSource, setNewSource] = useState({ name: '', amount: '' });
  const [editingPayDate, setEditingPayDate] = useState<'ray' | 'amber' | null>(null);

  // Calculate total income
  const totalIncome = incomeState.ray + incomeState.amber + 
    incomeState.otherSources.reduce((sum, src) => sum + src.amount, 0);
  
  const projectedSavings = totalIncome - totalExpenses;

  // Calculate expense ratio
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const expenseRatioDisplay = totalIncome > 0 ? `${expenseRatio.toFixed(1)}%` : 'N/A';

  // Persist income state changes
  useEffect(() => {
    localStorage.setItem('income', JSON.stringify(incomeState));
    updateBudgetTotal();
  }, [incomeState, updateBudgetTotal]);

  const handlePrimaryIncomeUpdate = (user: 'ray' | 'amber', amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setIncomeState(prev => ({
      ...prev,
      [user]: numAmount
    }));
    toast.success(`${user === 'ray' ? 'Ray' : 'Amber'}'s income updated`);
  };

  const handlePayDateUpdate = (user: 'ray' | 'amber', date: string) => {
    setIncomeState(prev => ({
      ...prev,
      [`${user}PayDate`]: date
    }));
    setEditingPayDate(null);
    toast.success('Pay date updated');
  };

  const handleAddOtherIncome = () => {
    if (!newSource.name || !newSource.amount) {
      toast.error('Please fill in both name and amount');
      return;
    }
    
    const newItem: OtherIncome = {
      id: Date.now(),
      source: newSource.name,
      amount: parseFloat(newSource.amount)
    };
    
    setIncomeState(prev => ({
      ...prev,
      otherSources: [...prev.otherSources, newItem]
    }));
    
    setNewSource({ name: '', amount: '' });
    toast.success('Income source added');
  };

  const handleDeleteOtherIncome = (id: number) => {
    setIncomeState(prev => ({
      ...prev,
      otherSources: prev.otherSources.filter(i => i.id !== id)
    }));
    toast.success('Income source removed');
  };

  const renderPayDateSection = (user: 'ray' | 'amber') => {
    const payDate = incomeState[`${user}PayDate`];
    const isEditing = editingPayDate === user;

    if (!payDate || isEditing) {
      return (
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400">Pay Date</label>
          <Input
            type="date"
            value={payDate}
            onChange={e => handlePayDateUpdate(user, e.target.value)}
            className="mt-1"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-sm">
        <Calendar size={14} className="text-gray-400" />
        <span>Next payment: {format(new Date(payDate), 'MMMM d, yyyy')}</span>
        <button
          onClick={() => setEditingPayDate(user)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <Edit2 size={14} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign size={24} /> Income Management
        </h1>
      </div>

      <div className="grid gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard
            icon={DollarSign}
            label="Combined Income"
            value={`£${totalIncome.toLocaleString()}`}
            variant="default"
          />
          <KPICard
            icon={PiggyBank}
            label="Projected Savings"
            value={`£${projectedSavings.toLocaleString()}`}
            variant={projectedSavings >= 0 ? "success" : "danger"}
          />
          <KPICard
            icon={BarChart2}
            label="Income vs. Expense Ratio"
            value={expenseRatioDisplay}
            variant={expenseRatio <= 70 ? "success" : expenseRatio <= 90 ? "warning" : "danger"}
          />
        </div>

        {/* Primary Wages */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ray's Income Card */}
          <CardShell>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <Wallet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold">Ray's Income</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Monthly Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={incomeState.ray || ''}
                  onChange={e => handlePrimaryIncomeUpdate('ray', e.target.value)}
                  className="mt-1"
                />
              </div>
              {renderPayDateSection('ray')}
            </div>
          </CardShell>

          {/* Amber's Income Card */}
          <CardShell>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-pink-50 dark:bg-pink-500/10 rounded-lg">
                <Wallet className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold">Amber's Income</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Monthly Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={incomeState.amber || ''}
                  onChange={e => handlePrimaryIncomeUpdate('amber', e.target.value)}
                  className="mt-1"
                />
              </div>
              {renderPayDateSection('amber')}
            </div>
          </CardShell>
        </div>

        {/* Other Income */}
        <CardShell>
          <h2 className="text-lg font-semibold mb-4">Additional Income Sources</h2>
          
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Source name"
              value={newSource.name}
              onChange={e => setNewSource(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Amount"
              value={newSource.amount}
              onChange={e => setNewSource(prev => ({ ...prev, amount: e.target.value }))}
              className="w-32"
            />
            <Button onClick={handleAddOtherIncome}>
              <Plus size={16} className="mr-2" /> Add Source
            </Button>
          </div>

          <div className="space-y-2">
            {incomeState.otherSources.map(income => (
              <div
                key={income.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
              >
                <div>
                  <p className="font-medium">{income.source}</p>
                  <p className="text-sm text-gray-500">
                    {income.payDate && `Paid on ${format(new Date(income.payDate), 'MMM d, yyyy')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">£{income.amount.toLocaleString()}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteOtherIncome(income.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
            {incomeState.otherSources.length === 0 && (
              <div className="text-center py-8">
                <DollarSign size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">No additional income sources yet.</p>
              </div>
            )}
          </div>
        </CardShell>
      </div>
    </div>
  );
};