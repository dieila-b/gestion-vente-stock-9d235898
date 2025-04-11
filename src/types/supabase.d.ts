
export type Database = {
  public: {
    Tables: {
      cash_register_transactions: {
        Row: { id: string; cash_register_id: string; type: string; amount: number; description: string; created_at: string; }
        Insert: { id?: string; cash_register_id?: string; type: string; amount?: number; description?: string; created_at?: string; }
        Update: { id?: string; cash_register_id?: string; type?: string; amount?: number; description?: string; created_at?: string; }
        Relationships: []
      }
      cash_registers: {
        Row: { id: string; name: string; initial_amount: number; current_amount: number; opened_at: string; closed_at: string | null; created_at: string; updated_at: string; status: string; }
        Insert: { id?: string; name: string; initial_amount?: number; current_amount?: number; opened_at?: string; closed_at?: string | null; created_at?: string; updated_at?: string; status?: string; }
        Update: { id?: string; name?: string; initial_amount?: number; current_amount?: number; opened_at?: string; closed_at?: string | null; created_at?: string; updated_at?: string; status?: string; }
        Relationships: []
      }
      catalog: {
        Row: { id: string; name: string; description: string | null; reference: string | null; category: string | null; price: number; purchase_price: number | null; stock: number | null; image_url: string | null; created_at: string; updated_at: string; unit_id?: string; }
        Insert: { id?: string; name: string; description?: string | null; reference?: string | null; category?: string | null; price?: number; purchase_price?: number | null; stock?: number | null; image_url?: string | null; created_at?: string; updated_at?: string; unit_id?: string; }
        Update: { id?: string; name?: string; description?: string | null; reference?: string | null; category?: string | null; price?: number; purchase_price?: number | null; stock?: number | null; image_url?: string | null; created_at?: string; updated_at?: string; unit_id?: string; }
        Relationships: []
      }
      clients: {
        Row: { id: string; contact_name: string | null; email: string | null; phone: string | null; address: string | null; city: string | null; state: string | null; postal_code: string | null; country: string | null; company_name: string | null; notes: string | null; client_code: string | null; client_type: string | null; created_at: string; updated_at: string; status: string; whatsapp: string | null; mobile_1: string | null; mobile_2: string | null; credit_limit: number | null; rc_number: string | null; cc_number: string | null; tax_number: string | null; balance: number | null; payment_terms: string | null; }
        Insert: { id?: string; contact_name?: string | null; email?: string | null; phone?: string | null; address?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null; company_name?: string | null; notes?: string | null; client_code?: string | null; client_type?: string | null; created_at?: string; updated_at?: string; status: string; whatsapp?: string | null; mobile_1?: string | null; mobile_2?: string | null; credit_limit?: number | null; rc_number?: string | null; cc_number?: string | null; tax_number?: string | null; balance?: number | null; payment_terms?: string | null; }
        Update: { id?: string; contact_name?: string | null; email?: string | null; phone?: string | null; address?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null; company_name?: string | null; notes?: string | null; client_code?: string | null; client_type?: string | null; created_at?: string; updated_at?: string; status?: string; whatsapp?: string | null; mobile_1?: string | null; mobile_2?: string | null; credit_limit?: number | null; rc_number?: string | null; cc_number?: string | null; tax_number?: string | null; balance?: number | null; payment_terms?: string | null; }
        Relationships: []
      }
      customer_returns: {
        Row: { id: string; return_number: string | null; client_id: string | null; invoice_id: string | null; return_date: string | null; total_amount: number | null; status: string | null; reason: string | null; notes: string | null; created_at: string; updated_at: string; }
        Insert: { id?: string; return_number?: string | null; client_id?: string | null; invoice_id?: string | null; return_date?: string | null; total_amount?: number | null; status?: string | null; reason?: string | null; notes?: string | null; created_at?: string; updated_at?: string; }
        Update: { id?: string; return_number?: string | null; client_id?: string | null; invoice_id?: string | null; return_date?: string | null; total_amount?: number | null; status?: string | null; reason?: string | null; notes?: string | null; created_at?: string; updated_at?: string; }
        Relationships: []
      }
      customer_return_items: {
        Row: { id: string; return_id: string | null; product_id: string | null; quantity: number | null; created_at: string; }
        Insert: { id?: string; return_id?: string | null; product_id?: string | null; quantity?: number | null; created_at?: string; }
        Update: { id?: string; return_id?: string | null; product_id?: string | null; quantity?: number | null; created_at?: string; }
        Relationships: []
      }
      expense_categories: {
        Row: { id: string; name: string; type: string | null; created_at: string; }
        Insert: { id?: string; name: string; type?: string | null; created_at?: string; }
        Update: { id?: string; name?: string; type?: string | null; created_at?: string; }
        Relationships: []
      }
      income_entries: {
        Row: { id: string; amount: number | null; description: string | null; category_id: string | null; created_at: string; date: string; }
        Insert: { id?: string; amount?: number | null; description?: string | null; category_id?: string | null; created_at?: string; date: string; }
        Update: { id?: string; amount?: number | null; description?: string | null; category_id?: string | null; created_at?: string; date?: string; }
        Relationships: []
      }
      outcome_entries: {
        Row: { id: string; amount: number | null; description: string | null; expense_category_id: string | null; created_at: string; date: string; payment_method: string; receipt_number: string; status: string; }
        Insert: { id?: string; amount?: number | null; description?: string | null; expense_category_id?: string | null; created_at?: string; date: string; payment_method: string; receipt_number: string; status: string; }
        Update: { id?: string; amount?: number | null; description?: string | null; expense_category_id?: string | null; created_at?: string; date?: string; payment_method?: string; receipt_number?: string; status?: string; }
        Relationships: []
      }
      internal_users: {
        Row: { id: string; email: string; first_name: string | null; last_name: string | null; phone: string | null; address: string | null; role: string | null; photo_url: string | null; is_active: boolean | null; created_at: string; updated_at: string; }
        Insert: { id: string; email: string; first_name?: string | null; last_name?: string | null; phone?: string | null; address?: string | null; role?: string | null; photo_url?: string | null; is_active?: boolean | null; created_at?: string; updated_at?: string; }
        Update: { id?: string; email?: string; first_name?: string | null; last_name?: string | null; phone?: string | null; address?: string | null; role?: string | null; photo_url?: string | null; is_active?: boolean | null; created_at?: string; updated_at?: string; }
        Relationships: []
      }
      orders: {
        Row: { id: string; client_id: string | null; total: number | null; discount: number | null; final_total: number | null; comment: string | null; status: string | null; delivery_status: string | null; payment_status: string | null; paid_amount: number | null; remaining_amount: number | null; created_at: string; updated_at: string; }
        Insert: { id?: string; client_id?: string | null; total?: number | null; discount?: number | null; final_total?: number | null; comment?: string | null; status?: string | null; delivery_status?: string | null; payment_status?: string | null; paid_amount?: number | null; remaining_amount?: number | null; created_at?: string; updated_at?: string; }
        Update: { id?: string; client_id?: string | null; total?: number | null; discount?: number | null; final_total?: number | null; comment?: string | null; status?: string | null; delivery_status?: string | null; payment_status?: string | null; paid_amount?: number | null; remaining_amount?: number | null; created_at?: string; updated_at?: string; }
        Relationships: []
      }
      order_items: {
        Row: { id: string; order_id: string | null; product_id: string | null; quantity: number | null; price: number | null; total: number | null; discount: number | null; delivered_quantity: number | null; created_at: string; }
        Insert: { id?: string; order_id?: string | null; product_id?: string | null; quantity?: number | null; price?: number | null; total?: number | null; discount?: number | null; delivered_quantity?: number | null; created_at?: string; }
        Update: { id?: string; order_id?: string | null; product_id?: string | null; quantity?: number | null; price?: number | null; total?: number | null; discount?: number | null; delivered_quantity?: number | null; created_at?: string; }
        Relationships: []
      }
      order_payments: {
        Row: { id: string; order_id: string | null; amount: number | null; payment_method: string | null; notes: string | null; created_at: string; }
        Insert: { id?: string; order_id?: string | null; amount?: number | null; payment_method?: string | null; notes?: string | null; created_at?: string; }
        Update: { id?: string; order_id?: string | null; amount?: number | null; payment_method?: string | null; notes?: string | null; created_at?: string; }
        Relationships: []
      }
      payments: {
        Row: { id: string; client_id: string | null; amount: number | null; payment_method: string | null; notes: string | null; created_at: string; }
        Insert: { id?: string; client_id?: string | null; amount?: number | null; payment_method?: string | null; notes?: string | null; created_at?: string; }
        Update: { id?: string; client_id?: string | null; amount?: number | null; payment_method?: string | null; notes?: string | null; created_at?: string; }
        Relationships: []
      }
      pos_locations: {
        Row: { id: string; name: string; location: string | null; surface: number | null; capacity: number | null; occupied: number | null; manager: string | null; status: string | null; address: string | null; is_active: boolean | null; created_at: string; updated_at: string; phone: string | null; email: string | null; }
        Insert: { id?: string; name: string; location?: string | null; surface?: number | null; capacity?: number | null; occupied?: number | null; manager?: string | null; status?: string | null; address?: string | null; is_active?: boolean | null; created_at?: string; updated_at?: string; phone?: string | null; email?: string | null; }
        Update: { id?: string; name?: string; location?: string | null; surface?: number | null; capacity?: number | null; occupied?: number | null; manager?: string | null; status?: string | null; address?: string | null; is_active?: boolean | null; created_at?: string; updated_at?: string; phone?: string | null; email?: string | null; }
        Relationships: []
      }
      preorders: {
        Row: { id: string; client_id: string | null; total_amount: number | null; paid_amount: number | null; remaining_amount: number | null; status: string | null; notes: string | null; created_at: string; updated_at: string; }
        Insert: { id?: string; client_id?: string | null; total_amount?: number | null; paid_amount?: number | null; remaining_amount?: number | null; status?: string | null; notes?: string | null; created_at?: string; updated_at?: string; }
        Update: { id?: string; client_id?: string | null; total_amount?: number | null; paid_amount?: number | null; remaining_amount?: number | null; status?: string | null; notes?: string | null; created_at?: string; updated_at?: string; }
        Relationships: []
      }
      preorder_items: {
        Row: { id: string; preorder_id: string | null; product_id: string | null; quantity: number | null; unit_price: number | null; total_price: number | null; discount: number | null; status: string | null; created_at: string; }
        Insert: { id?: string; preorder_id?: string | null; product_id?: string | null; quantity?: number | null; unit_price?: number | null; total_price?: number | null; discount?: number | null; status?: string | null; created_at?: string; }
        Update: { id?: string; preorder_id?: string | null; product_id?: string | null; quantity?: number | null; unit_price?: number | null; total_price?: number | null; discount?: number | null; status?: string | null; created_at?: string; }
        Relationships: []
      }
      product_units: {
        Row: { id: string; name: string; abbreviation: string; created_at: string; symbol: string; description: string | null; }
        Insert: { id?: string; name: string; abbreviation: string; created_at?: string; symbol: string; description?: string | null; }
        Update: { id?: string; name?: string; abbreviation?: string; created_at?: string; symbol?: string; description?: string | null; }
        Relationships: []
      }
      purchase_orders: {
        Row: { id: string; supplier_id: string; order_number: string | null; expected_delivery_date: string | null; warehouse_id: string | null; notes: string | null; status: string | null; total_amount: number | null; payment_status: string | null; paid_amount: number | null; created_at: string; updated_at: string; tax_rate: number | null; subtotal: number | null; tax_amount: number | null; total_ttc: number | null; shipping_cost: number | null; discount: number | null; transit_cost: number | null; logistics_cost: number | null; deleted: boolean | null; }
        Insert: { id?: string; supplier_id: string; order_number?: string | null; expected_delivery_date?: string | null; warehouse_id?: string | null; notes?: string | null; status?: string | null; total_amount?: number | null; payment_status?: string | null; paid_amount?: number | null; created_at?: string; updated_at?: string; tax_rate?: number | null; subtotal?: number | null; tax_amount?: number | null; total_ttc?: number | null; shipping_cost?: number | null; discount?: number | null; transit_cost?: number | null; logistics_cost?: number | null; deleted?: boolean | null; }
        Update: { id?: string; supplier_id?: string; order_number?: string | null; expected_delivery_date?: string | null; warehouse_id?: string | null; notes?: string | null; status?: string | null; total_amount?: number | null; payment_status?: string | null; paid_amount?: number | null; created_at?: string; updated_at?: string; tax_rate?: number | null; subtotal?: number | null; tax_amount?: number | null; total_ttc?: number | null; shipping_cost?: number | null; discount?: number | null; transit_cost?: number | null; logistics_cost?: number | null; deleted?: boolean | null; }
        Relationships: []
      }
      purchase_order_items: {
        Row: { id: string; purchase_order_id: string | null; product_id: string | null; quantity: number | null; unit_price: number | null; total_price: number | null; selling_price: number | null; created_at: string; }
        Insert: { id?: string; purchase_order_id?: string | null; product_id?: string | null; quantity?: number | null; unit_price?: number | null; total_price?: number | null; selling_price?: number | null; created_at?: string; }
        Update: { id?: string; purchase_order_id?: string | null; product_id?: string | null; quantity?: number | null; unit_price?: number | null; total_price?: number | null; selling_price?: number | null; created_at?: string; }
        Relationships: []
      }
      stock_transfers: {
        Row: { id: string; from_warehouse_id: string | null; to_warehouse_id: string | null; product_id: string | null; quantity: number; created_at: string; source_warehouse_id: string | null; destination_warehouse_id: string | null; source_pos_id: string | null; destination_pos_id: string | null; transfer_type: string | null; notes: string | null; status: string | null; transfer_date: string | null; }
        Insert: { id?: string; from_warehouse_id?: string | null; to_warehouse_id?: string | null; product_id?: string | null; quantity: number; created_at?: string; source_warehouse_id?: string | null; destination_warehouse_id?: string | null; source_pos_id?: string | null; destination_pos_id?: string | null; transfer_type?: string | null; notes?: string | null; status?: string | null; transfer_date?: string | null; }
        Update: { id?: string; from_warehouse_id?: string | null; to_warehouse_id?: string | null; product_id?: string | null; quantity?: number; created_at?: string; source_warehouse_id?: string | null; destination_warehouse_id?: string | null; source_pos_id?: string | null; destination_pos_id?: string | null; transfer_type?: string | null; notes?: string | null; status?: string | null; transfer_date?: string | null; }
        Relationships: []
      }
      warehouse_stock: {
        Row: { id: string; warehouse_id: string | null; product_id: string | null; quantity: number | null; unit_price: number | null; total_value: number | null; created_at: string; updated_at: string; pos_location_id: string | null; }
        Insert: { id?: string; warehouse_id?: string | null; product_id?: string | null; quantity?: number | null; unit_price?: number | null; total_value?: number | null; created_at?: string; updated_at?: string; pos_location_id?: string | null; }
        Update: { id?: string; warehouse_id?: string | null; product_id?: string | null; quantity?: number | null; unit_price?: number | null; total_value?: number | null; created_at?: string; updated_at?: string; pos_location_id?: string | null; }
        Relationships: []
      }
      warehouse_stock_movements: {
        Row: { id: string; product_id: string | null; warehouse_id: string | null; quantity: number; type: string; created_at: string; }
        Insert: { id?: string; product_id?: string | null; warehouse_id?: string | null; quantity: number; type: string; created_at?: string; }
        Update: { id?: string; product_id?: string | null; warehouse_id?: string | null; quantity?: number; type?: string; created_at?: string; }
        Relationships: []
      }
      warehouses: {
        Row: { id: string; name: string; location: string | null; surface: number | null; capacity: number | null; occupied: number | null; manager: string | null; status: string | null; address: string | null; is_active: boolean | null; created_at: string; updated_at: string; }
        Insert: { id?: string; name: string; location?: string | null; surface?: number | null; capacity?: number | null; occupied?: number | null; manager?: string | null; status?: string | null; address?: string | null; is_active?: boolean | null; created_at?: string; updated_at?: string; }
        Update: { id?: string; name?: string; location?: string | null; surface?: number | null; capacity?: number | null; occupied?: number | null; manager?: string | null; status?: string | null; address?: string | null; is_active?: boolean | null; created_at?: string; updated_at?: string; }
        Relationships: []
      }
      geographic_zones: {
        Row: { id: string; name: string; type: string; description: string | null; parent_id: string | null; created_at: string; }
        Insert: { id?: string; name: string; type: string; description?: string | null; parent_id?: string | null; created_at?: string; }
        Update: { id?: string; name?: string; type?: string; description?: string | null; parent_id?: string | null; created_at?: string; }
        Relationships: []
      }
      supplier_returns: {
        Row: { id: string; supplier_id: string; purchase_order_id: string | null; return_date: string; status: string | null; notes: string | null; total_amount: number | null; created_at: string; updated_at: string; return_number: string | null; }
        Insert: { id?: string; supplier_id: string; purchase_order_id?: string | null; return_date: string; status?: string | null; notes?: string | null; total_amount?: number | null; created_at?: string; updated_at?: string; return_number?: string | null; }
        Update: { id?: string; supplier_id?: string; purchase_order_id?: string | null; return_date?: string; status?: string | null; notes?: string | null; total_amount?: number | null; created_at?: string; updated_at?: string; return_number?: string | null; }
        Relationships: []
      }
      supplier_return_items: {
        Row: { id: string; return_id: string; product_id: string; quantity: number; reason: string | null; created_at: string; }
        Insert: { id?: string; return_id: string; product_id: string; quantity: number; reason?: string | null; created_at?: string; }
        Update: { id?: string; return_id?: string; product_id?: string; quantity?: number; reason?: string | null; created_at?: string; }
        Relationships: []
      }
      delivery_notes: {
        Row: { id: string; delivery_number: string; purchase_order_id: string | null; supplier_id: string | null; delivery_date: string | null; status: string | null; notes: string | null; created_at: string; updated_at: string; deleted: boolean; }
        Insert: { id?: string; delivery_number: string; purchase_order_id?: string | null; supplier_id?: string | null; delivery_date?: string | null; status?: string | null; notes?: string | null; created_at?: string; updated_at?: string; deleted?: boolean; }
        Update: { id?: string; delivery_number?: string; purchase_order_id?: string | null; supplier_id?: string | null; delivery_date?: string | null; status?: string | null; notes?: string | null; created_at?: string; updated_at?: string; deleted?: boolean; }
        Relationships: []
      }
      delivery_note_items: {
        Row: { id: string; delivery_note_id: string; product_id: string; expected_quantity: number; received_quantity: number | null; unit_price: number; status: string | null; created_at: string; quantity_received: number | null; }
        Insert: { id?: string; delivery_note_id: string; product_id: string; expected_quantity: number; received_quantity?: number | null; unit_price: number; status?: string | null; created_at?: string; quantity_received?: number | null; }
        Update: { id?: string; delivery_note_id?: string; product_id?: string; expected_quantity?: number; received_quantity?: number | null; unit_price?: number; status?: string | null; created_at?: string; quantity_received?: number | null; }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
