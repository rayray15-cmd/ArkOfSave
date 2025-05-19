import React from 'react';
import { X } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

interface RecurringFormData {
  description: string;
  amount: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDue: string;
}

interface RecurringModalProps {
  show: boolean;
  onClose: () => void;
  recForm: RecurringFormData;
  setRecForm: React.Dispatch<React.SetStateAction<RecurringFormData>>;
  addRecurring: () => void;
}

export const RecurringModal: React.FC<RecurringModalProps> = ({
  show,
  onClose,
  recForm,
  setRecForm,
  addRecurring
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xl font-semibold">Add Recurring Payment</h4>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X />
            </Button>
          </div>
          
          <Input 
            placeholder="Description" 
            value={recForm.description} 
            onChange={e => setRecForm({ ...recForm, description: e.target.value })} 
          />
          
          <Input 
            type="number" 
            placeholder="Amount (£)" 
            min="0" 
            step="0.01" 
            value={recForm.amount} 
            onChange={e => setRecForm({ ...recForm, amount: e.target.value })} 
          />
          
          <Select 
            value={recForm.frequency} 
            onValueChange={v => setRecForm({ 
              ...recForm, 
              frequency: v as 'weekly' | 'monthly' | 'yearly' 
            })}
          >
            <SelectTrigger><SelectValue placeholder="Frequency" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Input 
            type="date" 
            value={recForm.nextDue} 
            onChange={e => setRecForm({ ...recForm, nextDue: e.target.value })} 
          />
          
          <Button className="w-full" onClick={addRecurring}>
            Add Recurring
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};