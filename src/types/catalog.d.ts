
export interface CatalogProduct {
  id: string;
  name: string;
  description?: string;
  category?: string;
  reference?: string;
  price: number;
  purchase_price?: number;
  stock?: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductUnit {
  id: string;
  name: string;
  abbreviation: string;
  symbol?: string;
  description?: string;
  created_at?: string;
}

export interface NewProductUnit {
  name: string;
  abbreviation?: string;
  symbol?: string;
  description?: string;
}
