export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cash_register_transactions: {
        Row: {
          amount: number | null
          cash_register_id: string | null
          created_at: string | null
          description: string | null
          id: string
          type: string
        }
        Insert: {
          amount?: number | null
          cash_register_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          type: string
        }
        Update: {
          amount?: number | null
          cash_register_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_register_transactions_cash_register_id_fkey"
            columns: ["cash_register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_registers: {
        Row: {
          closed_at: string | null
          created_at: string | null
          current_amount: number | null
          id: string
          initial_amount: number | null
          name: string
          opened_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          current_amount?: number | null
          id?: string
          initial_amount?: number | null
          name: string
          opened_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          current_amount?: number | null
          id?: string
          initial_amount?: number | null
          name?: string
          opened_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      catalog: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number | null
          purchase_price: number | null
          reference: string | null
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
          purchase_price?: number | null
          reference?: string | null
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
          purchase_price?: number | null
          reference?: string | null
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          client_code: string | null
          client_type: string | null
          company_name: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_code?: string | null
          client_type?: string | null
          company_name?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_code?: string | null
          client_type?: string | null
          company_name?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_return_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number | null
          return_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          return_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          return_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_return_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "customer_returns"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_returns: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          reason: string | null
          return_date: string | null
          return_number: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          reason?: string | null
          return_date?: string | null
          return_number?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          reason?: string | null
          return_date?: string | null
          return_number?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_returns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_returns_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      expense_entries: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          expense_category_id: string | null
          id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          expense_category_id?: string | null
          id?: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          expense_category_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_entries_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      geographic_zones: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "geographic_zones_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "geographic_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      income_entries: {
        Row: {
          amount: number | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
        }
        Insert: {
          amount?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
        }
        Update: {
          amount?: number | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_users: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          phone: string | null
          photo_url: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          delivered_quantity: number | null
          discount: number | null
          id: string
          order_id: string | null
          price: number | null
          product_id: string | null
          quantity: number | null
          total: number | null
        }
        Insert: {
          created_at?: string | null
          delivered_quantity?: number | null
          discount?: number | null
          id?: string
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          quantity?: number | null
          total?: number | null
        }
        Update: {
          created_at?: string | null
          delivered_quantity?: number | null
          discount?: number | null
          id?: string
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          quantity?: number | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payments: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          payment_method: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_method?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          payment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_id: string | null
          comment: string | null
          created_at: string | null
          delivery_status: string | null
          discount: number | null
          final_total: number | null
          id: string
          paid_amount: number | null
          payment_status: string | null
          remaining_amount: number | null
          status: string | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          delivery_status?: string | null
          discount?: number | null
          final_total?: number | null
          id?: string
          paid_amount?: number | null
          payment_status?: string | null
          remaining_amount?: number | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          delivery_status?: string | null
          discount?: number | null
          final_total?: number | null
          id?: string
          paid_amount?: number | null
          payment_status?: string | null
          remaining_amount?: number | null
          status?: string | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          client_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_method: string | null
        }
        Insert: {
          amount?: number | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
        }
        Update: {
          amount?: number | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_locations: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          manager: string | null
          name: string
          occupied: number | null
          phone: string | null
          status: string | null
          surface: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          manager?: string | null
          name: string
          occupied?: number | null
          phone?: string | null
          status?: string | null
          surface?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          manager?: string | null
          name?: string
          occupied?: number | null
          phone?: string | null
          status?: string | null
          surface?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      preorder_items: {
        Row: {
          created_at: string | null
          discount: number | null
          id: string
          preorder_id: string | null
          product_id: string | null
          quantity: number | null
          status: string | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          id?: string
          preorder_id?: string | null
          product_id?: string | null
          quantity?: number | null
          status?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          id?: string
          preorder_id?: string | null
          product_id?: string | null
          quantity?: number | null
          status?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "preorder_items_preorder_id_fkey"
            columns: ["preorder_id"]
            isOneToOne: false
            referencedRelation: "preorders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preorder_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      preorders: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          paid_amount: number | null
          remaining_amount: number | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          remaining_amount?: number | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number | null
          remaining_amount?: number | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preorders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      product_units: {
        Row: {
          abbreviation: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          abbreviation?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          purchase_order_id: string | null
          quantity: number | null
          selling_price: number | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id?: string | null
          quantity?: number | null
          selling_price?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id?: string | null
          quantity?: number | null
          selling_price?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          discount: number | null
          expected_delivery_date: string | null
          id: string
          logistics_cost: number | null
          notes: string | null
          order_number: string | null
          paid_amount: number | null
          payment_status: string | null
          shipping_cost: number | null
          status: string | null
          subtotal: number | null
          supplier_id: string | null
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number | null
          total_ttc: number | null
          transit_cost: number | null
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          expected_delivery_date?: string | null
          id?: string
          logistics_cost?: number | null
          notes?: string | null
          order_number?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          total_ttc?: number | null
          transit_cost?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          expected_delivery_date?: string | null
          id?: string
          logistics_cost?: number | null
          notes?: string | null
          order_number?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          total_ttc?: number | null
          transit_cost?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          created_at: string | null
          from_warehouse_id: string | null
          id: string
          product_id: string | null
          quantity: number
          to_warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          from_warehouse_id?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          to_warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          from_warehouse_id?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          to_warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_stock: {
        Row: {
          created_at: string | null
          id: string
          pos_location_id: string | null
          product_id: string | null
          quantity: number | null
          total_value: number | null
          unit_price: number | null
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pos_location_id?: string | null
          product_id?: string | null
          quantity?: number | null
          total_value?: number | null
          unit_price?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pos_location_id?: string | null
          product_id?: string | null
          quantity?: number | null
          total_value?: number | null
          unit_price?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_stock_pos_location_id_fkey"
            columns: ["pos_location_id"]
            isOneToOne: false
            referencedRelation: "pos_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_stock_movements: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          type: string
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity: number
          type: string
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          type?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          location: string | null
          manager: string | null
          name: string
          occupied: number | null
          status: string | null
          surface: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          manager?: string | null
          name: string
          occupied?: number | null
          status?: string | null
          surface?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          manager?: string | null
          name?: string
          occupied?: number | null
          status?: string | null
          surface?: number | null
          updated_at?: string | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
