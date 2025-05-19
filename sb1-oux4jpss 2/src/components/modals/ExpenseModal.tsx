import React, { useEffect } from 'react';
import { X, Users, Wand2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { autoCategorizePurchase } from '../../lib/categories';
import toast from 'react-hot-toast';

interface ExpenseFormData {
  description: string;
  amount: string;
  category: string;
  splitWith?: string;
  splitAmount?: string;
}

interface ExpenseModalProps {
  show: boolean;
  onClose: () => void;
  expenseForm: ExpenseFormData;
  setExpenseForm: React.Dispatch<React.SetStateAction<ExpenseFormData>>;
  addExpense: () => void;
  allCategories: string[];
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  show,
  onClose,
  expenseForm,
  setExpenseForm,
  addExpense,
  allCategories
}) => {
  const currentUser = localStorage.getItem('user');
  const otherUser = currentUser === 'Ray' ? 'Amber' : 'Ray';

  const handleAutoCategorizeBtnClick = () => {
    const description = expenseForm.description.trim();
    if (!description) {
      toast.error('Please enter a description first');
      return;
    }

    const suggestedCategory = autoCategorizePurchase(description);
    setExpenseForm(prev => ({ ...prev, category: suggestedCategory }));
    toast.success(`Category set to: ${suggestedCategory}`);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">Add Expense</h4>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X />
            </Button>
          </div>
          
          <Input 
            placeholder="Description" 
            value={expenseForm.description} 
            onChange={e => setExpenseForm(prev => ({ 
              ...prev, 
              description: e.target.value
            }))} 
          />
          
          <Input 
            type="number" 
            placeholder="Amount (£)" 
            min="0" 
            step="0.01" 
            value={expenseForm.amount} 
            onChange={e => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))} 
          />
          
          <div className="flex gap-2">
            <Select 
              value={expenseForm.category} 
              onValueChange={v => setExpenseForm(prev => ({ ...prev, category: v }))}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="secondary"
              size="icon"
              onClick={handleAutoCategorizeBtnClick}
              title="Auto-categorize"
              className="shrink-0"
            >
              <Wand2 size={16} />
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Users size={16} className="text-gray-500" />
            <span className="text-sm font-medium">Split with {otherUser}?</span>
            <Select
              value={expenseForm.splitWith || 'no'}
              onValueChange={v => {
                if (v === 'no') {
                  setExpenseForm(prev => ({
                    ...prev,
                    splitWith: undefined,
                    splitAmount: undefined
                  }));
                } else {
                  const amount = expenseForm.amount ? Number(expenseForm.amount) / 2 : 0;
                  setExpenseForm(prev => ({
                    ...prev,
                    splitWith: otherUser,
                    splitAmount: amount.toString()
                  }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes (50/50)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="w-full" onClick={addExpense}>
            Add Expense
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};