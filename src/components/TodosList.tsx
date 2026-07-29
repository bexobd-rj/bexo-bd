import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export function TodosList() {
  const [todos, setTodos] = useState<any[]>([]);

  useEffect(() => {
    async function getTodos() {
      const { data: todos } = await supabase.from('todos').select();

      if (todos) {
        setTodos(todos);
      }
    }

    getTodos();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Supabase Todos</h3>
      {todos.length === 0 ? (
        <p className="text-slate-500">No todos found or loading...</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <span className="font-medium text-slate-700">{todo.name || todo.title || JSON.stringify(todo)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
