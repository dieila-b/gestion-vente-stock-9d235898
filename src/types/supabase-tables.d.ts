
/**
 * Type definitions for Supabase tables that are not included in the auto-generated Database type
 * 
 * This is used for extending the database schema without modifying the generated types
 */

export interface SupabaseTables {
  pos_locations: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    location?: string | null;
    surface?: number | null;
    capacity?: number | null;
    occupied?: number | null;
    manager?: string | null;
    status?: string | null;
    address?: string | null;
    is_active?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  
  geographic_zones: {
    id: string;
    name: string;
    type: string;
    parent_id?: string | null;
    description?: string | null;
    created_at?: string | null;
  };
  
  price_requests: {
    id: string;
    supplier_id: string;
    product_id: string;
    quantity: number;
    unit_price?: number | null;
    status?: string | null;
    priceRequested?: boolean | null;
    notes?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  };
  
  delivery_note_items: {
    id: string;
    delivery_note_id: string;
    product_id: string;
    expected_quantity: number;
    received_quantity?: number | null;
    unit_price: number;
    status?: string | null;
    created_at?: string | null;
    quantity_received?: number | null;
  };
  
  supplier_return_items: {
    id?: string;
    return_id: string;
    product_id: string;
    quantity: number;
    reason?: string | null;
    created_at?: string | null;
  };
  
  // Add more tables as needed
}

export interface SupabaseDatabase {
  Tables: SupabaseTables;
}
