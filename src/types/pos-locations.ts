
/**
 * Define types for POS Locations
 */

export interface POSLocation {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: string;
  manager?: string;
  is_active?: boolean;
  capacity?: number;
  occupied?: number;
  surface?: number;
  created_at?: string;
  updated_at?: string;
}

export interface POSLocationStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
}
