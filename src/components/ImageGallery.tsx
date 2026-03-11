'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ListingImage } from '@/types';
import { getPublicImageUrl } from '@/lib/supabase';

interface Props {
  images: ListingImage[];
  title: string;
}

interface LightboxProps {
  images: ListingImage[];
  title: string;
  startIndex: number;
  onClose: () => void;
}

function Lightbox({ images, title, startIndex, onClose }: LightboxProps) {
  const [activeIdx, setActiveIdx] = useState(startIndex);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(() => setActiveIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActiveIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta < 0) next();
    else prev();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onClick={onClose}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/70 text-sm">
          {activeIdx + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Zatvori"
          className="text-white/80 hover:text-white transition-colors p-1"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main image area */}
      <div
        className="flex-1 relative select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={getPublicImageUrl(images[activeIdx].storage_path)}
          alt={`${title} - slika ${activeIdx + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
          priority
          draggable={false}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Prethodna slika"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full p-3 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Sledeća slika"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full p-3 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`rounded-full transition-all ${
                    idx === activeIdx ? 'bg-white w-5 h-1.5' : 'bg-white/40 w-1.5 h-1.5'
                  }`}
                  aria-label={`Slika ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="shrink-0 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={`relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                idx === activeIdx ? 'border-white' : 'border-white/20 hover:border-white/50'
              }`}
            >
              <Image
                src={getPublicImageUrl(img.storage_path)}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ImageGallery({ images, title }: Props) {
  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  if (sorted.length === 0) {
    return (
      <div className="aspect-[4/5] md:aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const prev = () => setActiveIdx((i) => (i - 1 + sorted.length) % sorted.length);
  const next = () => setActiveIdx((i) => (i + 1) % sorted.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta < 0) next();
    else prev();
  };

  return (
    <>
      {lightboxOpen && (
        <Lightbox
          images={sorted}
          title={title}
          startIndex={activeIdx}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="space-y-3">
        {/* Main image */}
        <div
          className="relative aspect-[4/5] md:aspect-square bg-gray-100 rounded-2xl overflow-hidden select-none cursor-zoom-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={getPublicImageUrl(sorted[activeIdx].storage_path)}
            alt={`${title} - slika ${activeIdx + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={activeIdx === 0}
            draggable={false}
          />

          {/* Expand icon hint */}
          <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm rounded-full p-1.5 pointer-events-none">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </div>

          {sorted.length > 1 && (
            <>
              {/* Prev/Next arrows — hidden on mobile, visible on tablet+ */}
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Prethodna slika"
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2.5 shadow-sm transition-colors items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Sledeća slika"
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2.5 shadow-sm transition-colors items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dot indicators — mobile only */}
              <div
                className="sm:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {sorted.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    className={`rounded-full transition-all ${
                      idx === activeIdx ? 'bg-white w-4 h-1.5' : 'bg-white/50 w-1.5 h-1.5'
                    }`}
                    aria-label={`Slika ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Counter — tablet+ */}
              <div className="hidden sm:block absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {activeIdx + 1} / {sorted.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails — hidden on mobile, visible on sm+ */}
        {sorted.length > 1 && (
          <div className="hidden sm:flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sorted.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setActiveIdx(idx)}
                className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  idx === activeIdx ? 'border-rose-500' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image
                  src={getPublicImageUrl(img.storage_path)}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
