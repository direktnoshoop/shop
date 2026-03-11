'use client';

import { useState, useTransition } from 'react';
import { Brand, Category, Color, SizeGuide, Size } from '@/types';
import TagManager from './TagManager';
import RichTextEditor from './RichTextEditor';
import SizeGuideManager from './SizeGuideManager';

type Tab = 'katalog' | 'vodici' | 'poruka';

interface Props {
  initialBrands: Brand[];
  initialCategories: Category[];
  initialColors: Color[];
  initialSizes: Size[];
  initialSizeGuides: SizeGuide[];
  initialListingMessage: string;
}

export default function SettingsClient({
  initialBrands,
  initialCategories,
  initialColors,
  initialSizes,
  initialSizeGuides,
  initialListingMessage,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('katalog');

  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [colors, setColors] = useState<Color[]>(initialColors);
  const [sizes, setSizes] = useState<Size[]>(initialSizes);
  const [listingMessage, setListingMessage] = useState(initialListingMessage);
  const [messageSaved, setMessageSaved] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function refreshBrands() {
    const res = await fetch('/api/brands');
    if (res.ok) setBrands(await res.json());
  }

  async function refreshCategories() {
    const res = await fetch('/api/categories');
    if (res.ok) setCategories(await res.json());
  }

  async function refreshColors() {
    const res = await fetch('/api/colors');
    if (res.ok) setColors(await res.json());
  }

  async function refreshSizes() {
    const res = await fetch('/api/sizes');
    if (res.ok) setSizes(await res.json());
  }

  async function saveListingMessage() {
    setMessageSaved(false);
    setMessageError('');
    startTransition(async () => {
      try {
        const res = await fetch('/api/site-settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'listing_message', value: listingMessage }),
        });
        if (!res.ok) {
          const data = await res.json();
          setMessageError(data.error ?? 'Greška pri čuvanju.');
        } else {
          setMessageSaved(true);
          setTimeout(() => setMessageSaved(false), 3000);
        }
      } catch {
        setMessageError('Neočekivana greška.');
      }
    });
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'katalog', label: 'Katalog' },
    { id: 'vodici', label: 'Vodiči za veličine' },
    { id: 'poruka', label: 'Poruka na oglasima' },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1 — Katalog */}
      {activeTab === 'katalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TagManager
            title="Marke"
            items={brands}
            apiPath="/api/brands"
            singularLabel="marku"
            onUpdate={refreshBrands}
          />
          <TagManager
            title="Kategorije"
            items={categories}
            apiPath="/api/categories"
            singularLabel="kategoriju"
            onUpdate={refreshCategories}
          />
          <TagManager
            title="Boje"
            items={colors}
            apiPath="/api/colors"
            singularLabel="boju"
            onUpdate={refreshColors}
          />
          <TagManager
            title="Veličine"
            items={sizes}
            apiPath="/api/sizes"
            singularLabel="veličinu"
            onUpdate={refreshSizes}
          />
        </div>
      )}

      {/* Tab 2 — Vodiči za veličine */}
      {activeTab === 'vodici' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Vodiči za veličine</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Kreiraj vodiče koje možeš dodeliti pojedinim oglasima. Kupci ih vide kao popup na stranici oglasa.
            </p>
          </div>
          <div className="p-5">
            <SizeGuideManager
              initialGuides={initialSizeGuides}
              onUpdate={() => {}}
            />
          </div>
        </div>
      )}

      {/* Tab 3 — Poruka na oglasima */}
      {activeTab === 'poruka' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">Poruka na oglasima</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Prikazuje se ispod dugmadi za kontakt na svakom oglasu. Ostavi prazno da ne prikazuješ ništa.
            </p>
          </div>
          <div className="p-5 space-y-4">
            <RichTextEditor
              value={listingMessage}
              onChange={setListingMessage}
              maxChars={1000}
            />
            {messageError && (
              <p className="text-sm text-red-500">{messageError}</p>
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={saveListingMessage}
                disabled={isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 rounded-lg transition-colors"
              >
                {isPending ? 'Čuvanje...' : 'Sačuvaj poruku'}
              </button>
              {messageSaved && (
                <span className="text-sm text-green-600 font-medium">Sačuvano ✓</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
