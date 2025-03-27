
export interface Supplier {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  products_count: number | null;
  orders_count: number | null;
  reliability: number | null;
  status: "Actif" | "En attente" | "Inactif";
  rating: number | null;
  last_delivery: string | null;
  product_categories: string[] | null;
  performance_score: number | null;
  quality_score: number | null;
  delivery_score: number | null;
  pending_orders: number | null;
  total_revenue: number | null;
  verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}
