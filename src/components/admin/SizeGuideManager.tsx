'use client';

import { useState } from 'react';
import { SizeGuide } from '@/types';
import RichTextEditor from './RichTextEditor';

interface Props {
  initialGuides: SizeGuide[];
  onUpdate: () => void;
}

export default function SizeGuideManager({ initialGuides, onUpdate }: Props) {
  const [guides, setGuides] = useState<SizeGuide[]>(initialGuides);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Per-guide edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  async function refreshGuides() {
    const res = await fetch('/api/size-guides');
    if (res.ok) {
      const data = await res.json();
      setGuides(data);
    }
    onUpdate();
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/size-guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), content: '' }),
      });
      if (!res.ok) {
        const data = await res.json();
        setCreateError(data.error ?? 'Greška.');
      } else {
        setNewName('');
        await refreshGuides();
      }
    } finally {
      setCreating(false);
    }
  }

  function startEdit(guide: SizeGuide) {
    setEditingId(guide.id);
    setEditName(guide.name);
    setEditContent(guide.content);
    setSaveError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setSaveError('');
  }

  async function handleSave(id: string) {
    setSavingId(id);
    setSaveError('');
    try {
      const res = await fetch(`/api/size-guides/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, content: editContent }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error ?? 'Greška pri čuvanju.');
      } else {
        setEditingId(null);
        await refreshGuides();
      }
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteError('');
    try {
      const res = await fetch(`/api/size-guides/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error ?? 'Greška pri brisanju.');
      } else {
        await refreshGuides();
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Create new guide */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Naziv novog vodiča (npr. Majice, Pantalone…)"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 rounded-lg transition-colors"
        >
          {creating ? '...' : 'Dodaj'}
        </button>
      </div>
      {createError && <p className="text-xs text-red-500">{createError}</p>}

      {/* Guide list */}
      {guides.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">Nema sačuvanih vodiča.</p>
      ) : (
        <div className="space-y-3">
          {guides.map((guide) => (
            <div key={guide.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <span className="text-sm font-medium text-gray-800">{guide.name}</span>
                <div className="flex items-center gap-2">
                  {editingId !== guide.id && (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(guide)}
                        className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        Uredi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(guide.id)}
                        disabled={deletingId === guide.id}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === guide.id ? '...' : 'Obriši'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Edit form */}
              {editingId === guide.id && (
                <div className="p-4 space-y-3 bg-white border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Naziv</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Sadržaj vodiča</label>
                    <RichTextEditor
                      value={editContent}
                      onChange={setEditContent}
                      maxChars={5000}
                    />
                  </div>
                  {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                  {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSave(guide.id)}
                      disabled={savingId === guide.id || !editName.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 rounded-lg transition-colors"
                    >
                      {savingId === guide.id ? 'Čuvanje...' : 'Sačuvaj'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Otkaži
                    </button>
                  </div>
                </div>
              )}

              {/* Preview (collapsed) */}
              {editingId !== guide.id && guide.content && (
                <div className="px-4 py-3 border-t border-gray-100 bg-white">
                  <div
                    className="prose text-gray-500 text-xs leading-relaxed line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: guide.content }}
                  />
                </div>
              )}
              {editingId !== guide.id && !guide.content && (
                <div className="px-4 py-3 border-t border-gray-100 bg-white">
                  <p className="text-xs text-gray-400 italic">Nema sadržaja. Klikni &quot;Uredi&quot; da dodaš.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {deleteError && !deletingId && (
        <p className="text-xs text-red-500">{deleteError}</p>
      )}
    </div>
  );
}
