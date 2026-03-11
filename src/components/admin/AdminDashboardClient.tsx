'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Listing } from '@/types';
import { getPublicImageUrl } from '@/lib/supabase';
import DeleteDialog from './DeleteDialog';
import { CURRENCY } from '@/lib/config';

interface Props {
  listings: Listing[];
}

export default function AdminDashboardClient({ listings }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockValues, setStockValues] = useState<Record<string, string>>(
    () => Object.fromEntries(listings.map((l) => [l.id, l.stock != null ? String(l.stock) : '']))
  );
  const [savingStockId, setSavingStockId] = useState<string | null>(null);
  const [savedStockId, setSavedStockId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  async function handleDuplicate(id: string) {
    setDuplicatingId(id);
    try {
      await fetch(`/api/listings/${id}/duplicate`, { method: 'POST' });
      startTransition(() => router.refresh());
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handleSaveStock(id: string) {
    setSavingStockId(id);
    const raw = stockValues[id];
    const value = raw === '' ? null : parseInt(raw, 10);
    const payload: Record<string, unknown> = { stock: value };
    if (value !== null) {
      payload.is_sold = value === 0;
    }
    try {
      await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSavedStockId(id);
      setTimeout(() => setSavedStockId(null), 2000);
      startTransition(() => router.refresh());
    } finally {
      setSavingStockId(null);
    }
  }

  const filtered = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleToggleSold(listing: Listing) {
    setTogglingId(listing.id);
    try {
      await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_sold: !listing.is_sold }),
      });
      startTransition(() => router.refresh());
    } finally {
      setTogglingId(null);
    }
  }

  async function handleToggleHidden(listing: Listing) {
    setTogglingId(listing.id);
    try {
      await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_hidden: !listing.is_hidden }),
      });
      startTransition(() => router.refresh());
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      startTransition(() => router.refresh());
    } finally {
      setDeletingId(null);
    }
  }

  const currency = CURRENCY;

  return (
    <>
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Pretraži po nazivu ili marki..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide w-16" />
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Oglas</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Cena</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Veličina</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Lager</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  Nema oglasa
                </td>
              </tr>
            )}
            {filtered.map((listing) => {
              const firstImage = listing.listing_images
                ?.sort((a, b) => a.display_order - b.display_order)[0];
              const imageUrl = firstImage ? getPublicImageUrl(firstImage.storage_path) : null;
              const isToggling = togglingId === listing.id;

              return (
                <tr key={listing.id} className={`hover:bg-gray-50/50 transition-colors ${listing.is_hidden ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={listing.title} fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{listing.title}</p>
                    <p className="text-xs text-gray-400">{listing.brand} · {listing.condition}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {listing.price.toLocaleString('sr-RS')} {listing.currency || currency}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{Array.isArray(listing.size) ? listing.size.join(', ') : listing.size}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {listing.is_sold && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Prodato
                        </span>
                      )}
                      {listing.is_hidden && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Skriveno
                        </span>
                      )}
                      {!listing.is_sold && !listing.is_hidden && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Aktivno
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Lager */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setStockValues((prev) => ({
                            ...prev,
                            [listing.id]: String(Math.max(0, parseInt(prev[listing.id] || '0', 10) - 1)),
                          }))
                        }
                        className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors text-sm font-medium shrink-0"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={stockValues[listing.id] ?? ''}
                        onChange={(e) =>
                          setStockValues((prev) => ({ ...prev, [listing.id]: e.target.value }))
                        }
                        placeholder="—"
                        className="w-14 px-2 py-1 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-transparent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setStockValues((prev) => ({
                            ...prev,
                            [listing.id]: String(parseInt(prev[listing.id] || '0', 10) + 1),
                          }))
                        }
                        className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors text-sm font-medium shrink-0"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveStock(listing.id)}
                        disabled={savingStockId === listing.id}
                        className="px-2 py-1 text-xs font-medium rounded border transition-colors shrink-0 disabled:opacity-50 border-rose-200 text-rose-600 hover:bg-rose-50"
                      >
                        {savingStockId === listing.id ? '...' : savedStockId === listing.id ? '✓' : 'Sačuvaj'}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* View */}
                      <Link
                        href={`/listing/${listing.id}`}
                        target="_blank"
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                        title="Pogledaj oglas"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      {/* Edit */}
                      <Link
                        href={`/admin/listings/${listing.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                        title="Uredi oglas"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      {/* Duplicate */}
                      <button
                        onClick={() => handleDuplicate(listing.id)}
                        disabled={duplicatingId === listing.id}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                        title="Dupliraj oglas"
                      >
                        {duplicatingId === listing.id ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      {/* Toggle sold */}
                      <button
                        onClick={() => handleToggleSold(listing)}
                        disabled={isToggling}
                        className={`p-1.5 rounded-md transition-colors ${listing.is_sold ? 'text-green-500 hover:bg-green-50' : 'text-orange-400 hover:bg-orange-50'} disabled:opacity-50`}
                        title={listing.is_sold ? 'Označi kao dostupno' : 'Označi kao prodato'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {listing.is_sold ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                      </button>
                      {/* Toggle visibility */}
                      <button
                        onClick={() => handleToggleHidden(listing)}
                        disabled={isToggling}
                        className={`p-1.5 rounded-md transition-colors ${listing.is_hidden ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'} disabled:opacity-50`}
                        title={listing.is_hidden ? 'Prikaži oglas' : 'Sakrij oglas'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {listing.is_hidden ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          )}
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeletingId(listing.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                        title="Obriši oglas"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <p className="text-center py-12 text-gray-400">Nema oglasa</p>
        )}
        {filtered.map((listing) => {
          const firstImage = listing.listing_images
            ?.sort((a, b) => a.display_order - b.display_order)[0];
          const imageUrl = firstImage ? getPublicImageUrl(firstImage.storage_path) : null;
          const isToggling = togglingId === listing.id;

          return (
            <div key={listing.id} className={`bg-white rounded-xl border border-gray-200 p-4 ${listing.is_hidden ? 'opacity-50' : ''}`}>
              <div className="flex gap-3">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {imageUrl && <Image src={imageUrl} alt={listing.title} fill sizes="56px" className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{listing.title}</p>
                  <p className="text-xs text-gray-400">{listing.brand} · {Array.isArray(listing.size) ? listing.size.join(', ') : listing.size}</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {listing.price.toLocaleString('sr-RS')} {listing.currency || currency}
                  </p>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                  {listing.is_sold && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Prodato</span>}
                  {listing.is_hidden && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Skriveno</span>}
                  {!listing.is_sold && !listing.is_hidden && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Aktivno</span>}
                </div>
              </div>
              {/* Mobile lager */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400 font-medium">Lager:</span>
                <button
                  type="button"
                  onClick={() =>
                    setStockValues((prev) => ({
                      ...prev,
                      [listing.id]: String(Math.max(0, parseInt(prev[listing.id] || '0', 10) - 1)),
                    }))
                  }
                  className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 text-sm font-medium"
                >−</button>
                <input
                  type="number"
                  min={0}
                  value={stockValues[listing.id] ?? ''}
                  onChange={(e) =>
                    setStockValues((prev) => ({ ...prev, [listing.id]: e.target.value }))
                  }
                  placeholder="—"
                  className="w-14 px-2 py-1 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-rose-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setStockValues((prev) => ({
                      ...prev,
                      [listing.id]: String(parseInt(prev[listing.id] || '0', 10) + 1),
                    }))
                  }
                  className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 text-sm font-medium"
                >+</button>
                <button
                  type="button"
                  onClick={() => handleSaveStock(listing.id)}
                  disabled={savingStockId === listing.id}
                  className="px-2 py-1 text-xs font-medium rounded border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                >
                  {savingStockId === listing.id ? '...' : savedStockId === listing.id ? '✓' : 'Sačuvaj'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <Link href={`/listing/${listing.id}`} target="_blank" className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                  Pregledaj
                </Link>
                <Link href={`/admin/listings/${listing.id}/edit`} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                  Uredi
                </Link>
                <button
                  onClick={() => handleDuplicate(listing.id)}
                  disabled={duplicatingId === listing.id}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50"
                >
                  {duplicatingId === listing.id ? '...' : 'Dupliraj'}
                </button>
                <button
                  onClick={() => handleToggleSold(listing)}
                  disabled={isToggling}
                  className="text-xs text-orange-500 hover:text-orange-700 font-medium disabled:opacity-50"
                >
                  {listing.is_sold ? 'Dostupno' : 'Prodato'}
                </button>
                <button
                  onClick={() => handleToggleHidden(listing)}
                  disabled={isToggling}
                  className="text-xs text-blue-500 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  {listing.is_hidden ? 'Prikaži' : 'Sakrij'}
                </button>
                <button
                  onClick={() => setDeletingId(listing.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Obriši
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {deletingId && (
        <DeleteDialog
          listingTitle={filtered.find((l) => l.id === deletingId)?.title ?? ''}
          onConfirm={() => handleDelete(deletingId)}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </>
  );
}
