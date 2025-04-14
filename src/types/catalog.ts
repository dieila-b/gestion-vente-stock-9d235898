
export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  purchase_price: number;
  category: string;
  stock: number;
  reference: string;
  created_at: string;
  unit_id?: string;
  image_url?: string;
}

export interface ProductUnit {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface NewProductUnit {
  name: string;
  symbol: string;
  description?: string;
}
