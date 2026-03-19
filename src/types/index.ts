export interface ListingImage {
  id: string;
  listing_id: string;
  storage_path: string;
  display_order: number;
  created_at: string;
}

export type Promotion = "novo" | "poslednja_velicina" | "akcija";

export const PROMOTIONS: {
  value: Promotion;
  label: string;
  ribbonLabel: string;
  color: string;
}[] = [
  {
    value: "novo",
    label: "Novo",
    ribbonLabel: "Novo",
    color: "bg-emerald-500",
  },
  {
    value: "poslednja_velicina",
    label: "Poslednja veličina",
    ribbonLabel: "Poslednja veličina",
    color: "bg-rose-500",
  },
  {
    value: "akcija",
    label: "Akcija",
    ribbonLabel: "Akcija",
    color: "bg-amber-400",
  },
];

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
  promotion: Promotion | null;
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

export type Condition = "Novo sa etiketom" | "Kao novo" | "Dobro" | "Korišćeno";

export const CONDITIONS: Condition[] = [
  "Novo sa etiketom",
  "Kao novo",
  "Dobro",
  "Korišćeno",
];
