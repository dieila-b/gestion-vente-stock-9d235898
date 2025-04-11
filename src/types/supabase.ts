export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cash_register_transactions: {
        Row: {
          id: string
          cash_register_id: string
          type: string
          amount: number
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          cash_register_id?: string
          type?: string
          amount?: number
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          cash_register_id?: string
          type?: string
          amount?: number
          description?: string
          created_at?: string
        }
        Relationships: []
      }
      cash_registers: {
        Row: {
          id: string
          name: string
          initial_amount: number
          current_amount: number
          status: string
          opened_at: string
          closed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string
          initial_amount?: number
          current_amount?: number
          status?: string
          opened_at?: string
          closed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          initial_amount?: number
          current_amount?: number
          status?: string
          opened_at?: string
          closed_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      catalog: {
        Row: {
          id: string
          name: string
          description: string
          reference: string
          category: string
          price: number
          purchase_price: number
          stock: number
          image_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          reference?: string
          category?: string
          price?: number
          purchase_price?: number
          stock?: number
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          reference?: string
          category?: string
          price?: number
          purchase_price?: number
          stock?: number
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          contact_name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          postal_code: string
          country: string
          company_name: string
          notes: string
          client_code: string
          client_type: string
          created_at: string
          updated_at: string
          status: string
        }
        Insert: {
          id?: string
          contact_name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          country?: string
          company_name?: string
          notes?: string
          client_code?: string
          client_type?: string
          created_at?: string
          updated_at?: string
          status?: string
        }
        Update: {
          id?: string
          contact_name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          country?: string
          company_name?: string
          notes?: string
          client_code?: string
          client_type?: string
          created_at?: string
          updated_at?: string
          status?: string
        }
        Relationships: []
      }
      customer_returns: {
        Row: {
          id: string
          return_number: string
          client_id: string
          invoice_id: string
          return_date: string
          total_amount: number
          status: string
          reason: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          return_number?: string
          client_id?: string
          invoice_id?: string
          return_date?: string
          total_amount?: number
          status?: string
          reason?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          return_number?: string
          client_id?: string
          invoice_id?: string
          return_date?: string
          total_amount?: number
          status?: string
          reason?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          id: string
          name: string
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          created_at?: string
        }
        Relationships: []
      }
      income_entries: {
        Row: {
          id: string
          amount: number
          description: string
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          amount: number
          description?: string
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          amount?: number
          description?: string
          category_id?: string
          created_at?: string
        }
        Relationships: []
      }
      internal_users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          address: string
          role: "admin" | "manager" | "employee"
          photo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          address: string
          role: "admin" | "manager" | "employee"
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
          address?: string
          role?: "admin" | "manager" | "employee"
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          client_id: string
          status: string
          total: number
          discount: number
          final_total: number
          comment: string
          created_at: string
          updated_at: string
          delivery_status: string
          payment_status: string
          paid_amount: number
          remaining_amount: number
        }
        Insert: {
          id?: string
          client_id?: string
          status?: string
          total?: number
          discount?: number
          final_total?: number
          comment?: string
          created_at?: string
          updated_at?: string
          delivery_status?: string
          payment_status?: string
          paid_amount?: number
          remaining_amount?: number
        }
        Update: {
          id?: string
          client_id?: string
          status?: string
          total?: number
          discount?: number
          final_total?: number
          comment?: string
          created_at?: string
          updated_at?: string
          delivery_status?: string
          payment_status?: string
          paid_amount?: number
          remaining_amount?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          discount: number
          total: number
          delivered_quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          discount?: number
          total?: number
          delivered_quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          discount?: number
          total?: number
          delivered_quantity?: number
          created_at?: string
        }
        Relationships: []
      }
      order_payments: {
        Row: {
          id: string
          order_id: string
          amount: number
          payment_method: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string
          amount?: number
          payment_method?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          amount?: number
          payment_method?: string
          notes?: string
          created_at?: string
        }
        Relationships: []
      }
      outcome_entries: {
        Row: {
          id: string
          amount: number
          description: string
          expense_category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          amount: number
          description?: string
          expense_category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          amount?: number
          description?: string
          expense_category_id?: string
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          client_id: string
          amount: number
          payment_method: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id?: string
          amount?: number
          payment_method?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          amount?: number
          payment_method?: string
          notes?: string
          created_at?: string
        }
        Relationships: []
      }
      pos_locations: {
        Row: {
          id: string
          name: string
          address: string
          manager: string
          email: string
          phone: string
          status: string
          capacity: number
          surface: number
          occupied: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string
          manager?: string
          email?: string
          phone?: string
          status?: string
          capacity?: number
          surface?: number
          occupied?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          manager?: string
          email?: string
          phone?: string
          status?: string
          capacity?: number
          surface?: number
          occupied?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      preorders: {
        Row: {
          id: string
          client_id: string
          status: string
          notes: string
          total_amount: number
          paid_amount: number
          remaining_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string
          status?: string
          notes?: string
          total_amount?: number
          paid_amount?: number
          remaining_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          status?: string
          notes?: string
          total_amount?: number
          paid_amount?: number
          remaining_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      preorder_items: {
        Row: {
          id: string
          preorder_id: string
          product_id: string
          quantity: number
          unit_price: number
          discount: number
          total_price: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          preorder_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          discount?: number
          total_price?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          preorder_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          discount?: number
          total_price?: number
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      product_units: {
        Row: {
          id: string
          name: string
          symbol: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          symbol: string
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          symbol?: string
          description?: string
          created_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact: string
          email: string
          phone: string
          address: string
          website: string
          status: string
          country: string
          city: string
          postal_box: string
          landline: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact: string
          email: string
          phone: string
          address: string
          website?: string
          status?: string
          country?: string
          city?: string
          postal_box?: string
          landline?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact?: string
          email?: string
          phone?: string
          address?: string
          website?: string
          status?: string
          country?: string
          city?: string
          postal_box?: string
          landline?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      warehouse_stock: {
        Row: {
          id: string
          product_id: string
          warehouse_id: string
          pos_location_id: string
          quantity: number
          unit_price: number
          total_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id?: string
          warehouse_id?: string
          pos_location_id?: string
          quantity?: number
          unit_price?: number
          total_value?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          warehouse_id?: string
          pos_location_id?: string
          quantity?: number
          unit_price?: number
          total_value?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          id: string
          name: string
          location: string
          address: string
          manager: string
          status: string
          capacity: number
          surface: number
          occupied: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string
          address?: string
          manager?: string
          status?: string
          capacity?: number
          surface?: number
          occupied?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          address?: string
          manager?: string
          status?: string
          capacity?: number
          surface?: number
          occupied?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          client_id: string
          issue_date: string
          due_date: string
          total_amount: number
          payment_status: 'paid' | 'partial' | 'pending'
          paid_amount: number
          remaining_amount: number
          status: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number?: string
          client_id: string
          issue_date: string
          due_date: string
          total_amount: number
          payment_status?: 'paid' | 'partial' | 'pending'
          paid_amount?: number
          remaining_amount?: number
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          client_id?: string
          issue_date?: string
          due_date?: string
          total_amount?: number
          payment_status?: 'paid' | 'partial' | 'pending'
          paid_amount?: number
          remaining_amount?: number
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      geographic_zones: {
        Row: {
          id: string
          name: string
          type: string
          description: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          description?: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          description?: string
          parent_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      stock_transfers: {
        Row: {
          id: string
          from_warehouse_id: string
          to_warehouse_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          from_warehouse_id?: string
          to_warehouse_id?: string
          product_id?: string
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          from_warehouse_id?: string
          to_warehouse_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          id: string
          supplier_id: string
          order_number: string
          expected_delivery_date: string
          warehouse_id: string
          notes: string
          status: string
          total_amount: number
          payment_status: string
          paid_amount: number
          created_at: string
          updated_at: string
          deleted: boolean
          logistics_cost: number
          transit_cost: number
          tax_rate: number
          subtotal: number
          tax_amount: number
          total_ttc: number
          shipping_cost: number
          discount: number
        }
        Insert: {
          id?: string
          supplier_id: string
          order_number?: string
          expected_delivery_date?: string
          warehouse_id?: string
          notes?: string
          status?: string
          total_amount?: number
          payment_status?: string
          paid_amount?: number
          created_at?: string
          updated_at?: string
          deleted?: boolean
          logistics_cost?: number
          transit_cost?: number
          tax_rate?: number
          subtotal?: number
          tax_amount?: number
          total_ttc?: number
          shipping_cost?: number
          discount?: number
        }
        Update: {
          id?: string
          supplier_id?: string
          order_number?: string
          expected_delivery_date?: string
          warehouse_id?: string
          notes?: string
          status?: string
          total_amount?: number
          payment_status?: string
          paid_amount?: number
          created_at?: string
          updated_at?: string
          deleted?: boolean
          logistics_cost?: number
          transit_cost?: number
          tax_rate?: number
          subtotal?: number
          tax_amount?: number
          total_ttc?: number
          shipping_cost?: number
          discount?: number
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
          selling_price: number
        }
        Insert: {
          id?: string
          purchase_order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
          selling_price: number
        }
        Update: {
          id?: string
          purchase_order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
          selling_price?: number
        }
        Relationships: []
      }
      delivery_notes: {
        Row: {
          id: string
          delivery_number: string
          purchase_order_id: string
          supplier_id: string
          delivery_date: string
          status: string
          notes: string
          created_at: string
          updated_at: string
          deleted: boolean
        }
        Insert: {
          id?: string
          delivery_number?: string
          purchase_order_id?: string
          supplier_id?: string
          delivery_date?: string
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
          deleted?: boolean
        }
        Update: {
          id?: string
          delivery_number?: string
          purchase_order_id?: string
          supplier_id?: string
          delivery_date?: string
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
          deleted?: boolean
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
