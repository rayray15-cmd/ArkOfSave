import React, { useState } from 'react';
import { format } from 'date-fns';
import { CreditCard, Plus, Trash2, Receipt } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CardShell } from '../ui/Card';
import { Debt } from '../../types';

interface DebtListProps {
  debts: Debt[];
  onAddDebt: (description: string, amount: number) => void;
  onAddPayment: (debtId: number, amount: number) => void;
  onDeleteDebt: (id: number) => void;
}

export const DebtList: React.FC<DebtListProps> = ({
  debts,
  onAddDebt,
  onAddPayment,
  onDeleteDebt
}) => {
  const [newDebt, setNewDebt] = useState({ description: '', amount: '' });
  const [paymentAmounts, setPaymentAmounts] = useState<Record<number, string>>({});

  const handleAddDebt = () => {
    const amount = parseFloat(newDebt.amount);
    if (!newDebt.description || isNaN(amount)) return;

    onAddDebt(newDebt.description, amount);
    setNewDebt({ description: '', amount: '' });
  };

  const handleAddPayment = (debtId: number) => {
    const amount = parseFloat(paymentAmounts[debtId] || '0');
    if (isNaN(amount) || amount <= 0) return;

    onAddPayment(debtId, amount);
    setPaymentAmounts(prev => ({ ...prev, [debtId]: '' }));
  };

  return (
    <CardShell>
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Description"
          value={newDebt.description}
          onChange={e => setNewDebt(prev => ({ ...prev, description: e.target.value }))}
          className="flex-1"
        />
        <Input
          type="number"
          placeholder="Amount"
          value={newDebt.amount}
          onChange={e => setNewDebt(prev => ({ ...prev, amount: e.target.value }))}
          className="w-32"
        />
        <Button onClick={handleAddDebt}>
          <Plus size={16} className="mr-2" /> Add Debt
        </Button>
      </div>

      <div className="space-y-4">
        {debts.map(debt => (
          <div 
            key={debt.id} 
            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium">{debt.description}</h4>
                <p className="text-sm text-gray-500">
                  Added by {debt.addedBy} • {format(new Date(debt.date), 'MMM d, yyyy')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteDebt(debt.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-medium">£{debt.totalAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remaining</p>
                <p className="font-medium text-amber-600">
                  £{debt.remainingAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {debt.payments.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-2">Payment History</p>
                <div className="space-y-1">
                  {debt.payments.map(payment => (
                    <div key={payment.id} className="text-sm flex justify-between">
                      <span className="text-gray-500">
                        {format(new Date(payment.date), 'MMM d')} by {payment.addedBy}
                      </span>
                      <span>£{payment.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {debt.remainingAmount > 0 && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Payment amount"
                  value={paymentAmounts[debt.id] || ''}
                  onChange={e => setPaymentAmounts(prev => ({ 
                    ...prev, 
                    [debt.id]: e.target.value 
                  }))}
                  className="w-40"
                />
                <Button 
                  variant="secondary"
                  onClick={() => handleAddPayment(debt.id)}
                >
                  Add Payment
                </Button>
              </div>
            )}
          </div>
        ))}
        {!debts.length && (
          <div className="text-center py-8">
            <Receipt size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No debts recorded yet.</p>
          </div>
        )}
      </div>
    </CardShell>
  );
};