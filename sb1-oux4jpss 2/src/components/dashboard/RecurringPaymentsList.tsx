import React from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { CardShell } from '../ui/Card';
import { RecurringPayment } from '../../types';

interface RecurringPaymentsListProps {
  upcomingRecurrings: Array<RecurringPayment & { overdue: boolean }>;
  markRecurringPaid: (id: number) => void;
  deleteRecurring: (id: number) => void;
}

export const RecurringPaymentsList: React.FC<RecurringPaymentsListProps> = ({ 
  upcomingRecurrings, 
  markRecurringPaid,
  deleteRecurring
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, "MMM d") : 'Invalid date';
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <CardShell>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock size={18} /> Upcoming Recurring
      </h3>
      <div className="space-y-2 overflow-y-auto max-h-64">
        {upcomingRecurrings.map(r => (
          <div key={r.id} className="grid grid-cols-[1fr_auto_auto] gap-4 text-sm items-center">
            <div className="flex flex-col">
              <span className="truncate font-medium" title={r.description}>{r.description}</span>
              <span className="text-xs text-gray-500">£{r.amount.toLocaleString()}</span>
            </div>
            <span className={r.overdue ? "text-red-600 tabular-nums" : "text-gray-800 tabular-nums"}>
              {formatDate(r.nextDue)}
            </span>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => markRecurringPaid(r.id)} 
                className="text-green-600 hover:text-green-800"
              >
                <Plus size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteRecurring(r.id)} 
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        {!upcomingRecurrings.length && (
          <p className="text-sm text-gray-500 text-center py-4">
            No recurring payments yet.
          </p>
        )}
      </div>
    </CardShell>
  );
};