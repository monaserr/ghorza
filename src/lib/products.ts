// Shared product type that mirrors the public.products row shape from Supabase.
export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  images: string[];
  category: string;
  sizes: string[];
  colors: ProductColor[];
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
};

export type CollectionRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};
