
/**
 * Define types for tables that are not yet in the Database type
 * This helps with type checking when using createTableQuery
 */

export interface SupabaseTables {
  pos_locations: {
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
  };
  
  geographic_zones: {
    id: string;
    name: string;
    type: string;
    description?: string;
    parent_id?: string;
    created_at?: string;
  };
  
  price_requests: {
    id: string;
    client_id: string;
    product_id: string;
    requested_price: number;
    status: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
  };
  
  delivery_note_items: {
    id: string;
    delivery_note_id: string;
    product_id: string;
    expected_quantity: number;
    received_quantity?: number;
    unit_price: number;
    status?: string;
    created_at?: string;
    quantity_received?: number;
  };
  
  supplier_return_items: {
    id?: string;
    return_id: string;
    product_id: string;
    quantity: number;
    reason?: string;
    created_at?: string;
  };
}
