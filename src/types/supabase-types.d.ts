
import { SelectQueryError } from './supabase-extensions';
import { PostgrestQueryBuilder } from '@supabase/supabase-js';

/**
 * This file defines common types for Supabase table relationships
 */

export interface SafeRelation<T> {
  data: T | SelectQueryError | null;
  error: boolean;
}

export type ArrayOrError<T> = T[] | SelectQueryError;

// Add type definitions for commonly used join relationships
export interface WarehouseStockWithRelations {
  id: string;
  product_id: string;
  warehouse_id: string;
  pos_location_id: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  created_at: string;
  updated_at: string;
  product: any;
  warehouse: any;
  pos_location: any;
}

// Define safe types that handle SelectQueryError
export type SafeWarehouseStock = {
  id: string;
  product_id: string;
  warehouse_id: string;
  pos_location_id: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  created_at: string;
  updated_at: string;
  product: {
    id?: string;
    name?: string;
    reference?: string;
    category?: string;
    price?: number;
  } | null;
  warehouse: {
    id?: string;
    name?: string;
  } | null;
  pos_location: {
    id?: string;
    name?: string;
  } | null;
};

export interface DatabaseTables {
  pos_locations: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    location?: string;
    surface?: number;
    capacity?: number;
    occupied?: number;
    manager?: string;
    status?: string;
    address?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  geographic_zones: {
    id: string;
    name: string;
    type: string;
    parent_id?: string;
    description?: string;
  }
  
  // Add more tables as needed
}

// Export the PostgrestQueryBuilder type for use elsewhere
export type SafePostgrestQueryBuilder<T> = PostgrestQueryBuilder<any, any, T>;
