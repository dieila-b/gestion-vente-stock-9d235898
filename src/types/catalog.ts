
export interface ProductUnit {
  id: string;
  name: string;
  symbol: string;
  description: string;
  created_at?: string;
}

export interface NewProductUnit {
  name: string;
  symbol: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  reference?: string;
  category?: string;
  price: number;
  purchase_price?: number;
  stock?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
}

export interface CatalogState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  categories: Category[];
  isFormVisible: boolean;
}
