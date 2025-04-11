
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
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          cash_register_id?: string
          type: string
          amount?: number
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          cash_register_id?: string
          type?: string
          amount?: number
          description?: string | null
          created_at?: string | null
        }
      }
      cash_registers: {
        Row: {
          id: string
          name: string
          initial_amount: number
          current_amount: number
          status: string | null
          opened_at: string | null
          closed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          initial_amount?: number
          current_amount?: number
          status?: string | null
          opened_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          initial_amount?: number
          current_amount?: number
          status?: string | null
          opened_at?: string | null
          closed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      catalog: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          purchase_price: number
          category: string | null
          stock: number
          reference: string | null
          image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number
          purchase_price?: number
          category?: string | null
          stock?: number
          reference?: string | null
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          purchase_price?: number
          category?: string | null
          stock?: number
          reference?: string | null
          image_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          company_name: string | null
          contact_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
          status?: 'particulier' | 'entreprise'
        }
        Insert: {
          id?: string
          company_name?: string | null
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          status?: 'particulier' | 'entreprise'
        }
        Update: {
          id?: string
          company_name?: string | null
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          status?: 'particulier' | 'entreprise'
        }
      }
      internal_users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: string | null
          phone: string | null
          address: string | null
          photo_url: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string | null
          phone?: string | null
          address?: string | null
          photo_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string | null
          phone?: string | null
          address?: string | null
          photo_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string | null
          total: number
          discount: number
          final_total: number
          status: string | null
          delivery_status: string | null
          payment_status: string | null
          paid_amount: number
          remaining_amount: number
          comment: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          total?: number
          discount?: number
          final_total?: number
          status?: string | null
          delivery_status?: string | null
          payment_status?: string | null
          paid_amount?: number
          remaining_amount?: number
          comment?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          total?: number
          discount?: number
          final_total?: number
          status?: string | null
          delivery_status?: string | null
          payment_status?: string | null
          paid_amount?: number
          remaining_amount?: number
          comment?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          price: number
          discount: number
          total: number
          delivered_quantity: number
          created_at: string | null
          delivery_status?: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          price?: number
          discount?: number
          total?: number
          delivered_quantity?: number
          created_at?: string | null
          delivery_status?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          price?: number
          discount?: number
          total?: number
          delivered_quantity?: number
          created_at?: string | null
          delivery_status?: string | null
        }
      }
      order_payments: {
        Row: {
          id: string
          order_id: string | null
          amount: number
          payment_method: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          amount?: number
          payment_method?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          amount?: number
          payment_method?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
      preorders: {
        Row: {
          id: string
          client_id: string | null
          total_amount: number
          paid_amount: number
          remaining_amount: number
          status: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          total_amount?: number
          paid_amount?: number
          remaining_amount?: number
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          total_amount?: number
          paid_amount?: number
          remaining_amount?: number
          status?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      preorder_items: {
        Row: {
          id: string
          preorder_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          status: string | null
          discount: number
          created_at: string | null
        }
        Insert: {
          id?: string
          preorder_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          status?: string | null
          discount?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          preorder_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          status?: string | null
          discount?: number
          created_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          client_id: string | null
          amount: number
          payment_method: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          amount?: number
          payment_method?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string | null
          amount?: number
          payment_method?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
      customer_returns: {
        Row: {
          id: string
          return_number: string | null
          client_id: string | null
          invoice_id: string | null
          return_date: string | null
          total_amount: number
          status: string | null
          reason: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          return_number?: string | null
          client_id?: string | null
          invoice_id?: string | null
          return_date?: string | null
          total_amount?: number
          status?: string | null
          reason?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          return_number?: string | null
          client_id?: string | null
          invoice_id?: string | null
          return_date?: string | null
          total_amount?: number
          status?: string | null
          reason?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      customer_return_items: {
        Row: {
          id: string
          return_id: string | null
          product_id: string | null
          quantity: number
          created_at: string | null
        }
        Insert: {
          id?: string
          return_id?: string | null
          product_id?: string | null
          quantity?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          return_id?: string | null
          product_id?: string | null
          quantity?: number
          created_at?: string | null
        }
      }
      expense_categories: {
        Row: {
          id: string
          name: string
          type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string | null
          created_at?: string | null
        }
      }
      income_entries: {
        Row: {
          id: string
          amount: number
          description: string | null
          category_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          amount?: number
          description?: string | null
          category_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          amount?: number
          description?: string | null
          category_id?: string | null
          created_at?: string | null
        }
      }
      expense_entries: {
        Row: {
          id: string
          amount: number
          description: string | null
          expense_category_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          amount?: number
          description?: string | null
          expense_category_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          amount?: number
          description?: string | null
          expense_category_id?: string | null
          created_at?: string | null
        }
      }
      warehouse_stock_movements: {
        Row: {
          id: string
          product_id: string | null
          warehouse_id: string | null
          quantity: number
          type: string
          created_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          warehouse_id?: string | null
          quantity?: number
          type: string
          created_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          warehouse_id?: string | null
          quantity?: number
          type?: string
          created_at?: string | null
        }
      }
      stock_transfers: {
        Row: {
          id: string
          from_warehouse_id: string | null
          to_warehouse_id: string | null
          product_id: string | null
          quantity: number
          created_at: string | null
        }
        Insert: {
          id?: string
          from_warehouse_id?: string | null
          to_warehouse_id?: string | null
          product_id?: string | null
          quantity?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          from_warehouse_id?: string | null
          to_warehouse_id?: string | null
          product_id?: string | null
          quantity?: number
          created_at?: string | null
        }
      }
      warehouses: {
        Row: {
          id: string
          name: string
          address: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      warehouse_stock: {
        Row: {
          id: string
          product_id: string | null
          warehouse_id: string | null
          pos_location_id: string | null
          quantity: number
          unit_price: number
          total_value: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          warehouse_id?: string | null
          pos_location_id?: string | null
          quantity?: number
          unit_price?: number
          total_value?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          warehouse_id?: string | null
          pos_location_id?: string | null
          quantity?: number
          unit_price?: number
          total_value?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      pos_locations: {
        Row: {
          id: string
          name: string
          address: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      product_units: {
        Row: {
          id: string
          name: string
          abbreviation: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          abbreviation?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          abbreviation?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for specific tables
export type CashRegister = Database['public']['Tables']['cash_registers']['Row']
export type CashRegisterTransaction = Database['public']['Tables']['cash_register_transactions']['Row']
export type CatalogItem = Database['public']['Tables']['catalog']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type InternalUser = Database['public']['Tables']['internal_users']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderPayment = Database['public']['Tables']['order_payments']['Row']
export type Preorder = Database['public']['Tables']['preorders']['Row']
export type PreorderItem = Database['public']['Tables']['preorder_items']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type CustomerReturn = Database['public']['Tables']['customer_returns']['Row']
export type CustomerReturnItem = Database['public']['Tables']['customer_return_items']['Row']
export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']
export type IncomeEntry = Database['public']['Tables']['income_entries']['Row']
export type ExpenseEntry = Database['public']['Tables']['expense_entries']['Row']
export type WarehouseStockMovement = Database['public']['Tables']['warehouse_stock_movements']['Row']
export type StockTransfer = Database['public']['Tables']['stock_transfers']['Row']
export type Warehouse = Database['public']['Tables']['warehouses']['Row']
export type WarehouseStock = Database['public']['Tables']['warehouse_stock']['Row']
export type POSLocation = Database['public']['Tables']['pos_locations']['Row']
export type ProductUnit = Database['public']['Tables']['product_units']['Row']
