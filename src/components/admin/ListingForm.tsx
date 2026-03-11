'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Listing, CONDITIONS, Brand, Category, Color, SizeGuide } from '@/types';
import ImageUploader, { PendingImage, UnifiedImage } from './ImageUploader';
import RichTextEditor from './RichTextEditor';

interface Props {
  listing?: Listing;
  brands: Brand[];
  categories: Category[];
  colors: Color[];
  sizeGuides: SizeGuide[];
  sizes: string[];
}

export default function ListingForm({ listing, brands, categories, colors, sizeGuides, sizes }: Props) {
  const router = useRouter();
  const isEditing = !!listing;

  const [title, setTitle] = useState(listing?.title ?? '');
  const [brand, setBrand] = useState(listing?.brand ?? '');
  const [category, setCategory] = useState(listing?.category ?? '');
  const [color, setColor] = useState(listing?.color ?? '');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(listing?.size ?? []);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [price, setPrice] = useState(listing?.price?.toString() ?? '');
  const [currency, setCurrency] = useState(listing?.currency ?? 'RSD');
  const [condition, setCondition] = useState(listing?.condition ?? '');
  const [description, setDescription] = useState(listing?.description ?? '');
  const [sizeGuideId, setSizeGuideId] = useState(listing?.size_guide_id ?? '');

  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [orderedItems, setOrderedItems] = useState<UnifiedImage[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const existingImages = listing?.listing_images ?? [];
  const activeExistingCount = existingImages.filter((img) => !deletedImageIds.includes(img.id)).length;
  const totalImages = activeExistingCount + pendingImages.length;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (totalImages === 0) {
      setError('Dodajte najmanje jednu sliku.');
      return;
    }

    if (selectedSizes.length === 0) {
      setError('Odaberite ili unesite bar jednu veličinu.');
      return;
    }

    if (!brand) {
      setError('Odaberite marku.');
      return;
    }

    setLoading(true);

    try {
      // 1. Determine final ordered list (use orderedItems if user reordered, else default order)
      const finalOrder: UnifiedImage[] =
        orderedItems.length > 0
          ? orderedItems
          : [
              ...existingImages
                .filter((img) => !deletedImageIds.includes(img.id))
                .sort((a, b) => a.display_order - b.display_order)
                .map((d): UnifiedImage => ({ kind: 'existing', data: d })),
              ...pendingImages.map((d): UnifiedImage => ({ kind: 'pending', data: d })),
            ];

      // 2. Upload pending images in their ordered position
      // Collect pending items in the order they appear in finalOrder
      const orderedPending = finalOrder
        .filter((item): item is { kind: 'pending'; data: PendingImage } => item.kind === 'pending');

      let newImagePaths: string[] = [];
      if (orderedPending.length > 0) {
        const formData = new FormData();
        orderedPending.forEach((item) => formData.append('files', item.data.file));

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          throw new Error(data.error ?? 'Greška pri uploadu slika.');
        }

        const uploadData = await uploadRes.json();
        newImagePaths = uploadData.paths; // same length & order as orderedPending
      }

      // 3. Build display_order assignments
      // For each item in finalOrder assign display_order = its index
      const existing_image_orders: { id: string; display_order: number }[] = [];
      const new_image_orders: number[] = [];
      finalOrder.forEach((item, idx) => {
        if (item.kind === 'existing') {
          existing_image_orders.push({ id: item.data.id, display_order: idx });
        } else {
          new_image_orders.push(idx);
        }
      });

      // 4. Create or update listing
      const payload = {
        title: title.trim(),
        brand,
        category: category || null,
        color: color || null,
        size: selectedSizes,
        price: parseFloat(price),
        currency,
        condition,
        description: description.trim() || null,
        size_guide_id: sizeGuideId || null,
        image_paths: newImagePaths,
        new_image_orders,
        ...(isEditing && {
          deleted_image_ids: deletedImageIds,
          existing_image_orders,
        }),
      };

      const res = await fetch(
        isEditing ? `/api/listings/${listing.id}` : '/api/listings',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Greška pri čuvanju oglasa.');
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Neočekivana greška.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Naziv oglasa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          placeholder="npr. Nike Air Max 90 bele"
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
      </div>

      {/* Brand */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Marka <span className="text-red-500">*</span>
          </label>
          <a
            href="/admin/settings"
            target="_blank"
            className="text-xs text-rose-500 hover:text-rose-700"
          >
            + Dodaj marku
          </a>
        </div>
        {brands.length === 0 ? (
          <div className="px-3.5 py-2.5 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
            Nema marki. <a href="/admin/settings" target="_blank" className="text-rose-500 hover:underline">Dodaj marke ovde</a>.
          </div>
        ) : (
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
          >
            <option value="">Odaberi marku</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Category */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Kategorija
          </label>
          <a
            href="/admin/settings"
            target="_blank"
            className="text-xs text-rose-500 hover:text-rose-700"
          >
            + Dodaj kategoriju
          </a>
        </div>
        {categories.length === 0 ? (
          <div className="px-3.5 py-2.5 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
            Nema kategorija. <a href="/admin/settings" target="_blank" className="text-rose-500 hover:underline">Dodaj kategorije ovde</a>.
          </div>
        ) : (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
          >
            <option value="">Bez kategorije</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Color */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-gray-700">
            Boja
          </label>
          <a
            href="/admin/settings"
            target="_blank"
            className="text-xs text-rose-500 hover:text-rose-700"
          >
            + Dodaj boju
          </a>
        </div>
        {colors.length === 0 ? (
          <div className="px-3.5 py-2.5 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400">
            Nema boja. <a href="/admin/settings" target="_blank" className="text-rose-500 hover:underline">Dodaj boje ovde</a>.
          </div>
        ) : (
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
          >
            <option value="">Bez boje</option>
            {colors.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Veličina <span className="text-red-500">*</span>
          {selectedSizes.length > 0 && (
            <span className="ml-2 font-normal text-gray-400 text-xs">
              {selectedSizes.length} odabrano
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() =>
                setSelectedSizes((prev) =>
                  prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s]
                )
              }
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedSizes.includes(s)
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {/* Custom size input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customSizeInput}
            onChange={(e) => setCustomSizeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const val = customSizeInput.trim();
                if (val && !selectedSizes.includes(val)) {
                  setSelectedSizes((prev) => [...prev, val]);
                }
                setCustomSizeInput('');
              }
            }}
            placeholder="Dodaj veličinu ručno (npr. 38, S/M) pa pritisni Enter"
            className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => {
              const val = customSizeInput.trim();
              if (val && !selectedSizes.includes(val)) {
                setSelectedSizes((prev) => [...prev, val]);
              }
              setCustomSizeInput('');
            }}
            className="px-3 py-2.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors whitespace-nowrap"
          >
            Dodaj
          </button>
        </div>
        {/* Show custom (non-preset) sizes as removable tags */}
        {selectedSizes.filter((s) => !sizes.includes(s)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSizes.filter((s) => !sizes.includes(s)).map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-rose-500 text-white border border-rose-500"
              >
                {s}
                <button
                  type="button"
                  onClick={() => setSelectedSizes((prev) => prev.filter((v) => v !== s))}
                  className="hover:text-rose-200 transition-colors text-xs ml-0.5"
                  aria-label={`Ukloni ${s}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Cena <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min={0}
            step={0.01}
            placeholder="0"
            className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-24 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
          >
            <option value="RSD">RSD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Stanje <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCondition(c)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                condition === c
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {!condition && (
          <p className="text-xs text-gray-400 mt-1.5">Odaberi stanje artikla</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Opis
        </label>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          maxChars={2000}
        />
      </div>

      {/* Size guide */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Vodič za veličine
        </label>
        <select
          value={sizeGuideId}
          onChange={(e) => setSizeGuideId(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white"
        >
          <option value="">— Bez vodiča —</option>
          {sizeGuides.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        {sizeGuides.length === 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Nema kreiranih vodiča. Dodaj ih u{' '}
            <a href="/admin/settings" className="text-rose-500 hover:underline">Podešavanjima</a>.
          </p>
        )}
      </div>

      {/* Images */}
      <ImageUploader
        existingImages={existingImages}
        pendingImages={pendingImages}
        deletedIds={deletedImageIds}
        onNewImages={setPendingImages}
        onDeleteExisting={(id) => setDeletedImageIds((prev) => [...prev, id])}
        onReorder={setOrderedItems}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/dashboard')}
          className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Otkaži
        </button>
        <button
          type="submit"
          disabled={loading || !condition || totalImages === 0 || selectedSizes.length === 0}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {isEditing ? 'Čuvanje...' : 'Objavljivanje...'}
            </>
          ) : isEditing ? (
            'Sačuvaj izmene'
          ) : (
            'Objavi oglas'
          )}
        </button>
      </div>
    </form>
  );
}
