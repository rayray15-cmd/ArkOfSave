import { format, parseISO } from 'date-fns';
import { Expense, RecurringPayment, Todo } from '../types';

interface CalendarEvent {
  id: number;
  summary: string;
  start: string;
  rrule?: string;
}

// Export expenses to CSV
export function exportExpensesToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Description', 'Category', 'Amount'];
  const rows = expenses.map(e => [
    format(parseISO(e.date), 'yyyy-MM-dd'),
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.amount.toFixed(2),
  ]);
  
  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'buxfer_expenses.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Export calendar events to iCal format
export function exportCalendar(recurrings: RecurringPayment[], todos: Todo[]): void {
  const events: CalendarEvent[] = [];
  
  // Add recurring payments as events
  recurrings.forEach(r => {
    events.push({
      id: r.id,
      summary: `Recurring: ${r.description}`,
      start: r.nextDue,
      rrule: `FREQ=${r.frequency.toUpperCase()}`
    });
  });
  
  // Add todos with due dates as events
  todos.forEach(t => {
    if (t.due) {
      events.push({
        id: t.id,
        summary: `Task: ${t.text}`,
        start: t.due
      });
    }
  });
  
  // Generate iCal content
  let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Buxfer//EN\n";
  
  events.forEach(evt => {
    ics += `BEGIN:VEVENT\nUID:${evt.id}\nDTSTAMP:${format(new Date(), 'yyyyMMdd')}T000000Z\nSUMMARY:${evt.summary}\nDTSTART:${format(parseISO(evt.start), 'yyyyMMdd')}\n`;
    if (evt.rrule) ics += `RRULE:${evt.rrule}\n`;
    ics += "END:VEVENT\n";
  });
  
  ics += "END:VCALENDAR";
  
  // Download file
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'buxfer_schedule.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}