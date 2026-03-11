'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Brand, Category } from '@/types';

type Item = Brand | Category;

interface Props {
  title: string;
  items: Item[];
  apiPath: string; // e.g. '/api/brands' or '/api/categories'
  singularLabel: string; // e.g. 'marku' or 'kategoriju'
  onUpdate: () => void;
}

export default function TagManager({ title, items, apiPath, singularLabel, onUpdate }: Props) {
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError('');
    if (!newName.trim()) return;

    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setAddError(data.error ?? 'Greška pri dodavanju.');
      return;
    }

    setNewName('');
    startTransition(() => onUpdate());
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setEditName(item.name);
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setError('');
  }

  async function handleSaveEdit(id: string) {
    setError('');
    if (!editName.trim()) return;

    const res = await fetch(`${apiPath}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Greška pri izmeni.');
      return;
    }

    setEditingId(null);
    startTransition(() => onUpdate());
  }

  async function handleDelete(id: string) {
    setError('');
    const res = await fetch(`${apiPath}/${id}`, { method: 'DELETE' });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Greška pri brisanju.');
      return;
    }

    startTransition(() => onUpdate());
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {/* Add new */}
      <form onSubmit={handleAdd} className="px-5 py-4 border-b border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setAddError(''); }}
            placeholder={`Dodaj ${singularLabel}...`}
            maxLength={100}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newName.trim() || isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 rounded-lg transition-colors"
          >
            Dodaj
          </button>
        </div>
        {addError && (
          <p className="text-xs text-red-600 mt-1.5">{addError}</p>
        )}
      </form>

      {/* Error from edit/delete */}
      {error && (
        <div className="mx-5 mt-3 px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
          <button onClick={() => setError('')} className="ml-2 text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* List */}
      <ul className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
        {items.length === 0 && (
          <li className="px-5 py-8 text-sm text-center text-gray-400">
            Nema stavki. Dodaj prvu gore.
          </li>
        )}
        {items.map((item) => (
          <li key={item.id} className="px-5 py-3 flex items-center gap-2">
            {editingId === item.id ? (
              <>
                <input
                  ref={editInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(item.id);
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  maxLength={100}
                  className="flex-1 px-2.5 py-1.5 text-sm border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  onClick={() => handleSaveEdit(item.id)}
                  disabled={!editName.trim()}
                  className="text-xs font-medium text-green-600 hover:text-green-800 disabled:opacity-40"
                >
                  Sačuvaj
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Otkaži
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-gray-800">{item.name}</span>
                <button
                  onClick={() => startEdit(item)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                  title="Preimenuj"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-red-300 hover:text-red-600 rounded transition-colors"
                  title="Obriši"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
