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
        Relationships: [
          {
            foreignKeyName: "cash_register_transactions_cash_register_id_fkey"
            columns: ["cash_register_id"]
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
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
        Relationships: []
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
          status: 'particulier' | 'entreprise' | null
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
          status?: 'particulier' | 'entreprise' | null
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
          status?: 'particulier' | 'entreprise' | null
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "internal_users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
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
          delivery_status: string | null
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
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "order_payments_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "preorders_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "preorder_items_preorder_id_fkey"
            columns: ["preorder_id"]
            referencedRelation: "preorders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preorder_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "customer_returns_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_returns_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "customer_return_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_return_items_return_id_fkey"
            columns: ["return_id"]
            referencedRelation: "customer_returns"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "income_entries_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "expense_entries_expense_category_id_fkey"
            columns: ["expense_category_id"]
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "warehouse_stock_movements_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "warehouse_stock_pos_location_id_fkey"
            columns: ["pos_location_id"]
            referencedRelation: "pos_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_stock_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: []
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
        Relationships: []
      }
      geographic_zones: {
        Row: {
          id: string
          name: string
          type: string
          parent_id: string | null
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: string
          parent_id?: string | null
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string
          parent_id?: string | null
          description?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geographic_zones_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "geographic_zones"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_orders: {
        Row: {
          id: string
          supplier_id: string | null
          order_number: string | null
          expected_delivery_date: string | null
          warehouse_id: string | null
          notes: string | null
          status: string | null
          total_amount: number
          payment_status: string | null
          paid_amount: number
          logistics_cost: number
          transit_cost: number
          tax_rate: number
          subtotal: number
          tax_amount: number
          total_ttc: number
          shipping_cost: number
          discount: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          supplier_id?: string | null
          order_number?: string | null
          expected_delivery_date?: string | null
          warehouse_id?: string | null
          notes?: string | null
          status?: string | null
          total_amount?: number
          payment_status?: string | null
          paid_amount?: number
          logistics_cost?: number
          transit_cost?: number
          tax_rate?: number
          subtotal?: number
          tax_amount?: number
          total_ttc?: number
          shipping_cost?: number
          discount?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          supplier_id?: string | null
          order_number?: string | null
          expected_delivery_date?: string | null
          warehouse_id?: string | null
          notes?: string | null
          status?: string | null
          total_amount?: number
          payment_status?: string | null
          paid_amount?: number
          logistics_cost?: number
          transit_cost?: number
          tax_rate?: number
          subtotal?: number
          tax_amount?: number
          total_ttc?: number
          shipping_cost?: number
          discount?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string | null
          product_id: string | null
          quantity: number
          unit_price: number
          selling_price: number
          total_price: number
          created_at: string | null
        }
        Insert: {
          id?: string
          purchase_order_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
          selling_price?: number
          total_price?: number
          created_at?: string | null
        }
        Update: {
          id?: string
          purchase_order_id?: string | null
          product_id?: string | null
          quantity?: number
          unit_price?: number
          selling_price?: number
          total_price?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          }
        ]
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
export type GeographicZone = Database['public']['Tables']['geographic_zones']['Row']
export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row']
export type PurchaseOrderItem = Database['public']['Tables']['purchase_order_items']['Row']
export type Warehouse = Database['public']['Tables']['warehouses']['Row']
export type WarehouseStock = Database['public']['Tables']['warehouse_stock']['Row']
export type POSLocation = Database['public']['Tables']['pos_locations']['Row']
export type ProductUnit = Database['public']['Tables']['product_units']['Row']

// Add type for fixing the nested relationship issues
export type SupabaseNested<T> = T | null;
