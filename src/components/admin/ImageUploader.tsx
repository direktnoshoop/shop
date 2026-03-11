'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getPublicImageUrl } from '@/lib/supabase';
import { ListingImage } from '@/types';

export interface PendingImage {
  id: string;
  file: File;
  preview: string;
}

export type UnifiedImage =
  | { kind: 'existing'; data: ListingImage }
  | { kind: 'pending'; data: PendingImage };

interface Props {
  existingImages?: ListingImage[];
  onNewImages: (images: PendingImage[]) => void;
  onDeleteExisting: (id: string) => void;
  onReorder: (items: UnifiedImage[]) => void;
  pendingImages: PendingImage[];
  deletedIds: string[];
  maxImages?: number;
}

// --- Sortable item ---
interface SortableItemProps {
  item: UnifiedImage;
  index: number;
  onRemove: () => void;
}

function SortableItem({ item, index, onRemove }: SortableItemProps) {
  const id = item.kind === 'existing' ? item.data.id : item.data.id;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const src =
    item.kind === 'existing'
      ? getPublicImageUrl(item.data.storage_path)
      : item.data.preview;

  const isNew = item.kind === 'pending';
  const isCover = index === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group w-24 h-24 rounded-xl overflow-hidden border-2 transition-colors ${
        isNew ? 'border-rose-300' : 'border-gray-200'
      } ${isDragging ? 'shadow-xl' : ''}`}
    >
      {/* Drag handle — whole card is draggable */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
        aria-label="Prevuci za premeštanje"
      />

      <Image
        src={src}
        alt={`Slika ${index + 1}`}
        fill
        sizes="96px"
        className="object-cover"
        draggable={false}
      />

      {/* Cover badge */}
      {isCover && (
        <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-black/60 text-white py-0.5 z-20 pointer-events-none">
          Naslovna
        </span>
      )}

      {/* New badge */}
      {isNew && !isCover && (
        <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-rose-500/80 text-white py-0.5 z-20 pointer-events-none">
          Nova
        </span>
      )}

      {isNew && isCover && (
        <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-rose-500/80 text-white py-0.5 z-20 pointer-events-none">
          Naslovna · Nova
        </span>
      )}

      {/* Delete button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow z-30"
        aria-label="Ukloni sliku"
      >
        ×
      </button>
    </div>
  );
}

// --- Main component ---
export default function ImageUploader({
  existingImages = [],
  onNewImages,
  onDeleteExisting,
  onReorder,
  pendingImages,
  deletedIds,
  maxImages = 8,
}: Props) {
  const activeExisting = existingImages
    .filter((img) => !deletedIds.includes(img.id))
    .sort((a, b) => a.display_order - b.display_order);

  // Build initial unified list: existing first, then pending
  const buildUnified = useCallback(
    (existing: ListingImage[], pending: PendingImage[]): UnifiedImage[] => [
      ...existing.map((d): UnifiedImage => ({ kind: 'existing', data: d })),
      ...pending.map((d): UnifiedImage => ({ kind: 'pending', data: d })),
    ],
    []
  );

  const [items, setItems] = useState<UnifiedImage[]>(() =>
    buildUnified(activeExisting, pendingImages)
  );

  // Sync items when external changes arrive (new drop, external delete)
  useEffect(() => {
    setItems((prev) => {
      // Keep the current order of items that are still alive; append new ones at the end
      const prevIds = new Set(prev.map((i) => (i.kind === 'existing' ? i.data.id : i.data.id)));
      const nextExisting = activeExisting.filter((e) => !deletedIds.includes(e.id));
      const allIds = new Set([
        ...nextExisting.map((e) => e.id),
        ...pendingImages.map((p) => p.id),
      ]);

      // Remove deleted items, preserve order of surviving items
      const surviving = prev.filter((item) => {
        const id = item.kind === 'existing' ? item.data.id : item.data.id;
        return allIds.has(id);
      });

      // Add newly arrived items (not in prev) at the end
      const newExisting = nextExisting
        .filter((e) => !prevIds.has(e.id))
        .map((d): UnifiedImage => ({ kind: 'existing', data: d }));
      const newPending = pendingImages
        .filter((p) => !prevIds.has(p.id))
        .map((d): UnifiedImage => ({ kind: 'pending', data: d }));

      return [...surviving, ...newExisting, ...newPending];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingImages, pendingImages, deletedIds]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => (i.kind === 'existing' ? i.data.id : i.data.id) === active.id);
      const newIndex = prev.findIndex((i) => (i.kind === 'existing' ? i.data.id : i.data.id) === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      onReorder(next);
      return next;
    });
  };

  const handleRemove = (item: UnifiedImage) => {
    if (item.kind === 'existing') {
      onDeleteExisting(item.data.id);
    } else {
      URL.revokeObjectURL(item.data.preview);
      const next = pendingImages.filter((p) => p.id !== item.data.id);
      onNewImages(next);
    }
  };

  const totalCount = items.length;
  const remainingSlots = maxImages - totalCount;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const available = maxImages - totalCount;
      const toAdd = acceptedFiles.slice(0, available);
      const newPending: PendingImage[] = toAdd.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      onNewImages([...pendingImages, ...newPending]);
    },
    [maxImages, totalCount, pendingImages, onNewImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    disabled: remainingSlots <= 0,
    maxFiles: remainingSlots,
  });

  const ids = items.map((i) => (i.kind === 'existing' ? i.data.id : i.data.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Slike <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-gray-400">{totalCount} / {maxImages}</span>
      </div>

      {items.length > 0 && (
        <>
          <p className="text-xs text-gray-400">Prevuci slike da promeniš redosled. Prva slika je naslovna.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-3">
                {items.map((item, idx) => (
                  <SortableItem
                    key={item.kind === 'existing' ? item.data.id : item.data.id}
                    item={item}
                    index={idx}
                    onRemove={() => handleRemove(item)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}

      {remainingSlots > 0 && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-rose-400 bg-rose-50'
              : 'border-gray-200 hover:border-gray-400 bg-white'
          }`}
        >
          <input {...getInputProps()} />
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {isDragActive ? (
            <p className="text-sm text-rose-500 font-medium">Otpusti slike ovde</p>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">Klikni za upload</span> ili prevuci slike
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WEBP · max 5MB · još {remainingSlots} slika
              </p>
            </>
          )}
        </div>
      )}

      {totalCount === 0 && (
        <p className="text-xs text-red-500">Potrebna je najmanje 1 slika.</p>
      )}
    </div>
  );
}
