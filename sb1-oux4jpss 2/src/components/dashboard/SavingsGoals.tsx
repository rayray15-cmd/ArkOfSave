import React from 'react';
import { format, parseISO } from 'date-fns';
import { PiggyBank as Piggy, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CardShell } from '../ui/Card';
import { SavingsGoal } from '../../types';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateGoal: (id: number, amount: number) => void;
  deleteGoal: (id: number) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  goals,
  addGoal,
  updateGoal,
  deleteGoal,
}) => {
  const [newGoal, setNewGoal] = React.useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) return;

    addGoal({
      name: newGoal.name,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: Number(newGoal.currentAmount) || 0,
      deadline: newGoal.deadline,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    });

    setNewGoal({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
  };

  return (
    <CardShell>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Piggy size={18} /> Savings Goals
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
                    Due {format(parseISO(goal.deadline), 'MMM d, yyyy')}
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
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm tabular-nums whitespace-nowrap">
                  £{goal.currentAmount.toLocaleString()} / £{goal.targetAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2">
                {[10, 50, 100].map(amount => (
                  <Button
                    key={amount}
                    variant="ghost"
                    size="sm"
                    onClick={() => updateGoal(goal.id, goal.currentAmount + amount)}
                    className="text-sm"
                  >
                    +£{amount}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
        {!goals.length && (
          <p className="text-sm text-gray-500 text-center py-4">No savings goals yet.</p>
        )}
      </div>
    </CardShell>
  );
};