'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

interface Props {
  brands: string[];
  categories: string[];
  colors: string[];
  sizes: string[];
  maxListingPrice: number;
}

export default function FilterBar({ brands, categories, colors, sizes, maxListingPrice }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const getParam = (key: string) => searchParams.get(key) ?? '';
  const getParamArray = (key: string): string[] => {
    const val = searchParams.get(key);
    return val ? val.split(',').filter(Boolean) : [];
  };

  const selectedBrands = getParamArray('brand');
  const selectedSizes = getParamArray('size');
  const selectedCategories = getParamArray('category');
  const selectedColors = getParamArray('color');
  const minPrice = parseInt(getParam('minPrice') || '0');
  const maxPrice = parseInt(getParam('maxPrice') || String(maxListingPrice));

  const activeFilterCount =
    selectedBrands.length +
    selectedSizes.length +
    selectedCategories.length +
    selectedColors.length +
    (getParam('minPrice') ? 1 : 0) +
    (getParam('maxPrice') ? 1 : 0);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const toggleMultiselect = (key: string, current: string[], value: string) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateParams({ [key]: next.length ? next.join(',') : null });
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Marka</h3>
          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => toggleMultiselect('brand', selectedBrands, brand)}
                className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selectedBrands.includes(brand)
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 active:bg-gray-50'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Veličina</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleMultiselect('size', selectedSizes, size)}
              className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'bg-white border-gray-200 text-gray-600 active:bg-gray-50'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Kategorija</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleMultiselect('category', selectedCategories, cat)}
                className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selectedCategories.includes(cat)
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 active:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Boja</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((col) => (
              <button
                key={col}
                onClick={() => toggleMultiselect('color', selectedColors, col)}
                className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selectedColors.includes(col)
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-white border-gray-200 text-gray-600 active:bg-gray-50'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Cena: {minPrice.toLocaleString('sr-RS')} – {maxPrice.toLocaleString('sr-RS')} RSD
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Od</span>
              <span>{minPrice.toLocaleString('sr-RS')} RSD</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxListingPrice}
              step={100}
              value={minPrice}
              onChange={(e) => updateParams({ minPrice: e.target.value === '0' ? null : e.target.value })}
              className="w-full accent-rose-500 h-1.5"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Do</span>
              <span>{maxPrice.toLocaleString('sr-RS')} RSD</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxListingPrice}
              step={100}
              value={maxPrice}
              onChange={(e) =>
                updateParams({
                  maxPrice: e.target.value === String(maxListingPrice) ? null : e.target.value,
                })
              }
              className="w-full accent-rose-500 h-1.5"
            />
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={() => { clearAll(); setDrawerOpen(false); }}
          className="w-full text-sm text-rose-500 font-medium py-3 border border-rose-200 rounded-xl hover:bg-rose-50 active:bg-rose-100 transition-colors"
        >
          Obriši sve filtere ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── MOBILE: Fixed bottom bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 bg-white/95 backdrop-blur border-t border-gray-100">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-3.5 text-sm font-semibold active:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filteri
          {activeFilterCount > 0 && (
            <span className="bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ── MOBILE: Bottom sheet drawer ── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <h2 className="font-semibold text-gray-900 text-base">Filteri</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full"
                aria-label="Zatvori"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 py-5">
              {filterContent}
            </div>

            {/* Apply button */}
            <div className="px-5 pb-6 pt-3 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full bg-rose-500 text-white rounded-xl py-3.5 text-sm font-semibold active:bg-rose-600 transition-colors"
              >
                {activeFilterCount > 0
                  ? `Prikaži rezultate (${activeFilterCount} filtera)`
                  : 'Prikaži sve oglase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP: Sidebar (unchanged) ── */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-4 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Filteri</h2>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-rose-500 hover:text-rose-700"
              >
                Obriši sve
              </button>
            )}
          </div>
          {filterContent}
        </div>
      </aside>
    </>
  );
}
