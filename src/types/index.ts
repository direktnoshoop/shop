export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export interface Listing {
  id: string;
  title: string;
  brand: string;
  size: string[];
  price: number;
  currency: string;
  condition: string;
  description: string | null;
  category: string | null;
  color: string | null;
  is_sold: boolean;
  is_hidden: boolean;
  stock: number | null;
  size_guide_id: string | null;
  created_at: string;
  updated_at: string;
  listing_images?: ListingImage[];
}

export interface Brand {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface Color {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface Size {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface SizeGuide {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

export type Condition =
  | 'Novo sa etiketom'
  | 'Kao novo'
  | 'Dobro'
  | 'Korišćeno';

export const CONDITIONS: Condition[] = [
  'Novo sa etiketom',
  'Kao novo',
  'Dobro',
  'Korišćeno',
];

