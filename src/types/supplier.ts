
export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  contact_person?: string;
  created_at?: string;
  updated_at?: string;
  // Additional properties used in the components
  contact?: string;
  status?: string;
  website?: string;
  country?: string;
  city?: string;
  postal_box?: string;
  landline?: string;
  verified?: boolean;
  rating?: number;
  performance_score?: number;
  quality_score?: number;
  delivery_score?: number;
  products_count?: number;
  orders_count?: number;
  pending_orders?: number;
  total_revenue?: number;
}
