import React from 'react';
import { format, parseISO } from 'date-fns';
import { Square, CheckSquare, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CardShell } from '../ui/Card';
import { Todo } from '../../types';

interface TodoListProps {
  todos: Todo[];
  todoInput: string;
  setTodoInput: React.Dispatch<React.SetStateAction<string>>;
  todoDue: string;
  setTodoDue: React.Dispatch<React.SetStateAction<string>>;
  addTodo: () => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  moveTodo: (idx: number, direction: number) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  todoInput,
  setTodoInput,
  todoDue,
  setTodoDue,
  addTodo,
  toggleTodo,
  deleteTodo,
  moveTodo
}) => {
  return (
    <CardShell>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Square size={18} /> Shared To-Do
      </h3>
      <div className="flex mb-4 gap-2">
        <Input 
          placeholder="Task description" 
          value={todoInput} 
          onChange={e => setTodoInput(e.target.value)} 
        />
        <Input 
          type="date" 
          value={todoDue} 
          onChange={e => setTodoDue(e.target.value)} 
          className="w-40" 
        />
        <Button variant="secondary" onClick={addTodo}>
          <Plus />
        </Button>
      </div>
      <div className="space-y-2 overflow-y-auto max-h-64">
        {todos.map((t, idx) => (
          <div key={t.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
            <button onClick={() => toggleTodo(t.id)} className="flex items-center gap-2 truncate">
              {t.done 
                ? <CheckSquare size={16} className="text-green-600" /> 
                : <Square size={16} className="text-gray-400" />
              }
              <div className="truncate">
                <span className={t.done ? "line-through text-gray-500" : ""}>
                  {t.text}
                </span>
                {t.due && (
                  <div className="text-xs text-gray-400">
                    Due {format(parseISO(t.due), "MMM d, yyyy")}
                  </div>
                )}
              </div>
            </button>
            <div className="flex items-center gap-1">
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => moveTodo(idx, -1)} 
                disabled={idx === 0}
              >
                <ArrowUp size={16} />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => moveTodo(idx, 1)} 
                disabled={idx === todos.length - 1}
              >
                <ArrowDown size={16} />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => deleteTodo(t.id)} 
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
        {!todos.length && (
          <p className="text-sm text-gray-500 text-center py-4">No tasks yet.</p>
        )}
      </div>
    </CardShell>
  );
};