'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

export interface LocalTodo {
  id: string;
  text: string;
  is_done: boolean;
  created_at: string;
}

const STORAGE_KEY = 'dashboard_todos';

function load_todos(): LocalTodo[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save_todos(todos: LocalTodo[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/**
 * Hook for managing a local-storage-persisted todo list.
 * @returns todos list and CRUD operations
 */
export function useDashboardTodos() {
  const { user } = useAuth();
  const [todos, set_todos_state] = useState<LocalTodo[]>(() => load_todos());

  const set_todos = (updated: LocalTodo[]) => {
    set_todos_state(updated);
    save_todos(updated);
  };

  const add_todo = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const new_todo: LocalTodo = {
      id: crypto.randomUUID(),
      text: trimmed,
      is_done: false,
      created_at: new Date().toISOString(),
    };
    set_todos([...todos, new_todo]);
  };

  const toggle_todo = (id: string) => {
    set_todos(todos.map(t => t.id === id ? { ...t, is_done: !t.is_done } : t));
  };

  const delete_todo = (id: string) => {
    set_todos(todos.filter(t => t.id !== id));
  };

  const clear_done = () => {
    set_todos(todos.filter(t => !t.is_done));
  };

  return {
    todos,
    add_todo,
    toggle_todo,
    delete_todo,
    clear_done,
    is_enabled: !!user,
  };
}
