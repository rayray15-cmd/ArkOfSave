import React from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { CardShell } from '../ui/Card';
import { BudgetGoal } from '../../types';

interface BudgetGoalsProps {
  goals: BudgetGoal[];
  categories: string[];
  addGoal: (goal: Omit<BudgetGoal, 'id'>) => void;
  deleteGoal: (id: number) => void;
}

export const BudgetGoals: React.FC<BudgetGoalsProps> = ({
  goals,
  categories,
  addGoal,
  deleteGoal,
}) => {
  const [newGoal, setNewGoal] = React.useState({
    name: '',
    targetAmount: '',
    category: '',
    deadline: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.category || !newGoal.deadline) return;

    addGoal({
      name: newGoal.name,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: 0,
      category: newGoal.category,
      deadline: newGoal.deadline,
    });

    setNewGoal({ name: '', targetAmount: '', category: '', deadline: '' });
  };

  return (
    <CardShell>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Target size={18} /> Budget Goals
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Goal name"
          value={newGoal.name}
          onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
          className="flex-1"
        />
        <Input
          type="number"
          placeholder="Target amount"
          value={newGoal.targetAmount}
          onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
          className="w-32"
        />
        <Select
          value={newGoal.category}
          onValueChange={v => setNewGoal({ ...newGoal, category: v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={newGoal.deadline}
          onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
          className="w-40"
        />
        <Button type="submit" variant="secondary">
          <Plus size={16} />
        </Button>
      </form>

      <div className="space-y-4">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{goal.name}</h4>
                  <p className="text-sm text-gray-500">
                    {goal.category} • Due {format(parseISO(goal.deadline), 'MMM d, yyyy')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteGoal(goal.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm tabular-nums whitespace-nowrap">
                  £{goal.currentAmount.toLocaleString()} / £{goal.targetAmount.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
        {!goals.length && (
          <p className="text-sm text-gray-500 text-center py-4">No budget goals yet.</p>
        )}
      </div>
    </CardShell>
  );
};