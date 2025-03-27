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
      bank_accounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          bank_name: string | null
          created_at: string | null
          current_balance: number | null
          id: string
          initial_balance: number | null
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cash_register_transactions: {
        Row: {
          amount: number
          cash_register_id: string
          created_at: string | null
          description: string | null
          id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          cash_register_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          cash_register_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string
          updated_at?: string | null
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
          created_at: string | null
          current_amount: number | null
          id: string
          initial_amount: number | null
          last_counted_at: string | null
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          id?: string
          initial_amount?: number | null
          last_counted_at?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          id?: string
          initial_amount?: number | null
          last_counted_at?: string | null
          name?: string
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
          unit_id: string | null
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
          unit_id?: string | null
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
          unit_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "product_units"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          balance: number | null
          birth_date: string | null
          cc_number: string | null
          city: string | null
          client_code: string | null
          client_type: string | null
          company_name: string | null
          contact_name: string | null
          created_at: string
          credit_limit: number | null
          date: string | null
          email: string | null
          first_name: string | null
          id: string
          landline: string | null
          last_name: string | null
          mobile_1: string | null
          mobile_2: string | null
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          rc_number: string | null
          registration_number: string | null
          status: string | null
          tax_number: string | null
          updated_at: string
          whatsapp: string | null
          zone_id: string | null
        }
        Insert: {
          address?: string | null
          balance?: number | null
          birth_date?: string | null
          cc_number?: string | null
          city?: string | null
          client_code?: string | null
          client_type?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          credit_limit?: number | null
          date?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          landline?: string | null
          last_name?: string | null
          mobile_1?: string | null
          mobile_2?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          rc_number?: string | null
          registration_number?: string | null
          status?: string | null
          tax_number?: string | null
          updated_at?: string
          whatsapp?: string | null
          zone_id?: string | null
        }
        Update: {
          address?: string | null
          balance?: number | null
          birth_date?: string | null
          cc_number?: string | null
          city?: string | null
          client_code?: string | null
          client_type?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string
          credit_limit?: number | null
          date?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          landline?: string | null
          last_name?: string | null
          mobile_1?: string | null
          mobile_2?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          rc_number?: string | null
          registration_number?: string | null
          status?: string | null
          tax_number?: string | null
          updated_at?: string
          whatsapp?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "geographic_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_return_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          reason: string | null
          return_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          reason?: string | null
          return_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          reason?: string | null
          return_id?: string | null
          total_price?: number
          unit_price?: number
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
          return_number: string
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
          return_number: string
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
          return_number?: string
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
      delivery_note_items: {
        Row: {
          created_at: string | null
          delivery_note_id: string | null
          id: string
          notes: string | null
          product_id: string | null
          quality_status: string | null
          quantity_ordered: number
          quantity_received: number
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          delivery_note_id?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quality_status?: string | null
          quantity_ordered?: number
          quantity_received?: number
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          delivery_note_id?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quality_status?: string | null
          quantity_ordered?: number
          quantity_received?: number
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_note_items_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: false
            referencedRelation: "delivery_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_note_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_delivery_note_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_notes: {
        Row: {
          created_at: string | null
          deleted: boolean | null
          delivery_date: string | null
          delivery_number: string
          id: string
          notes: string | null
          purchase_order_id: string | null
          received_by: string | null
          status: string | null
          supplier_id: string | null
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted?: boolean | null
          delivery_date?: string | null
          delivery_number: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          received_by?: string | null
          status?: string | null
          supplier_id?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted?: boolean | null
          delivery_date?: string | null
          delivery_number?: string
          id?: string
          notes?: string | null
          purchase_order_id?: string | null
          received_by?: string | null
          status?: string | null
          supplier_id?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_notes_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notes_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_notes_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_credit_notes: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          credit_number: string
          id: string
          notes: string | null
          original_invoice_id: string | null
          reason: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          credit_number: string
          id?: string
          notes?: string | null
          original_invoice_id?: string | null
          reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          credit_number?: string
          id?: string
          notes?: string | null
          original_invoice_id?: string | null
          reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_credit_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_credit_notes_original_invoice_id_fkey"
            columns: ["original_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_entries: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          id: string
          source: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      geographic_zones: {
        Row: {
          coordinates: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          type?: string
          updated_at?: string
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
          amount: number
          category_id: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          receipt_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          receipt_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          receipt_number?: string | null
          updated_at?: string | null
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
          created_at: string
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          last_restock_date: string | null
          max_stock_level: number | null
          min_stock_level: number | null
          name: string
          product_id: string | null
          quantity: number | null
          status: string | null
          supplier_id: string | null
          total_value: number | null
          unit_price: number | null
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          last_restock_date?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name: string
          product_id?: string | null
          quantity?: number | null
          status?: string | null
          supplier_id?: string | null
          total_value?: number | null
          unit_price?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          last_restock_date?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name?: string
          product_id?: string | null
          quantity?: number | null
          status?: string | null
          supplier_id?: string | null
          total_value?: number | null
          unit_price?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          discount: number | null
          id: string
          invoice_id: string | null
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          id?: string
          invoice_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          id?: string
          invoice_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoice_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number | null
          client_code: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          code: string | null
          company_info: Json | null
          created_at: string | null
          deposit: string | null
          description: string | null
          discount: number | null
          id: string
          invoice_number: string
          paid_amount: number | null
          payment_status: string | null
          remaining_amount: number | null
          shipping_cost: number | null
          signature: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          vat_rate: number | null
        }
        Insert: {
          amount?: number | null
          client_code?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          code?: string | null
          company_info?: Json | null
          created_at?: string | null
          deposit?: string | null
          description?: string | null
          discount?: number | null
          id?: string
          invoice_number: string
          paid_amount?: number | null
          payment_status?: string | null
          remaining_amount?: number | null
          shipping_cost?: number | null
          signature?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Update: {
          amount?: number | null
          client_code?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          code?: string | null
          company_info?: Json | null
          created_at?: string | null
          deposit?: string | null
          description?: string | null
          discount?: number | null
          id?: string
          invoice_number?: string
          paid_amount?: number | null
          payment_status?: string | null
          remaining_amount?: number | null
          shipping_cost?: number | null
          signature?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          delivered_quantity: number | null
          delivery_status: string | null
          discount: number | null
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
          total: number
        }
        Insert: {
          created_at?: string
          delivered_quantity?: number | null
          delivery_status?: string | null
          discount?: number | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
          total?: number
        }
        Update: {
          created_at?: string
          delivered_quantity?: number | null
          delivery_status?: string | null
          discount?: number | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
          total?: number
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          payment_method: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          payment_method: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          payment_method?: string
          updated_at?: string | null
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
          created_at: string
          delivery_status: string | null
          depot: string | null
          discount: number
          final_total: number
          id: string
          paid_amount: number | null
          payment_status: string | null
          remaining_amount: number | null
          status: string | null
          total: number
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          comment?: string | null
          created_at?: string
          delivery_status?: string | null
          depot?: string | null
          discount?: number
          final_total?: number
          id?: string
          paid_amount?: number | null
          payment_status?: string | null
          remaining_amount?: number | null
          status?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          comment?: string | null
          created_at?: string
          delivery_status?: string | null
          depot?: string | null
          discount?: number
          final_total?: number
          id?: string
          paid_amount?: number | null
          payment_status?: string | null
          remaining_amount?: number | null
          status?: string | null
          total?: number
          updated_at?: string
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
      outcome_entries: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          date: string | null
          description: string | null
          expense_category_id: string | null
          id: string
          payment_method: string | null
          receipt_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          expense_category_id?: string | null
          id?: string
          payment_method?: string | null
          receipt_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          expense_category_id?: string | null
          id?: string
          payment_method?: string | null
          receipt_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outcome_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcome_entries_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          updated_at?: string | null
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
          created_at: string
          id: string
          manager: string | null
          name: string
          occupied: number | null
          phone: string | null
          status: string | null
          surface: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string
          id?: string
          manager?: string | null
          name: string
          occupied?: number | null
          phone?: string | null
          status?: string | null
          surface?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string
          id?: string
          manager?: string | null
          name?: string
          occupied?: number | null
          phone?: string | null
          status?: string | null
          surface?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pos_sellers: {
        Row: {
          created_at: string
          id: string
          pos_location_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pos_location_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pos_location_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pos_sellers_pos_location_id_fkey"
            columns: ["pos_location_id"]
            isOneToOne: false
            referencedRelation: "pos_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sellers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "internal_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      preorder_items: {
        Row: {
          created_at: string | null
          discount: number
          id: string
          preorder_id: string | null
          product_id: string | null
          quantity: number
          status: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount?: number
          id?: string
          preorder_id?: string | null
          product_id?: string | null
          quantity?: number
          status?: string | null
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          discount?: number
          id?: string
          preorder_id?: string | null
          product_id?: string | null
          quantity?: number
          status?: string | null
          total_price?: number
          unit_price?: number
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
          expected_delivery_date: string | null
          id: string
          notes: string | null
          paid_amount: number
          remaining_amount: number
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number
          remaining_amount?: number
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number
          remaining_amount?: number
          status?: string
          total_amount?: number
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
          created_at: string
          description: string | null
          id: string
          name: string
          symbol: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          symbol: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          catalog_id: string | null
          category: string | null
          created_at: string
          id: string
          image: string | null
          name: string
          price: number
          reference: string | null
          updated_at: string
        }
        Insert: {
          catalog_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image?: string | null
          name: string
          price?: number
          reference?: string | null
          updated_at?: string
        }
        Update: {
          catalog_id?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image?: string | null
          name?: string
          price?: number
          reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_invoice_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "purchase_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_invoices: {
        Row: {
          approved_at: string | null
          created_at: string | null
          delivery_note_id: string | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_amount: number | null
          payment_status: string | null
          purchase_order_id: string | null
          remaining_amount: number | null
          shipping_cost: number | null
          supplier_id: string | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          created_at?: string | null
          delivery_note_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          purchase_order_id?: string | null
          remaining_amount?: number | null
          shipping_cost?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          created_at?: string | null
          delivery_note_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          purchase_order_id?: string | null
          remaining_amount?: number | null
          shipping_cost?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_invoices_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: false
            referencedRelation: "delivery_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_invoices_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          purchase_id: string | null
          quantity: number | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          designation: string | null
          id: string
          product_code: string | null
          product_id: string | null
          purchase_order_id: string | null
          quantity: number
          selling_price: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          designation?: string | null
          id?: string
          product_code?: string | null
          product_id?: string | null
          purchase_order_id?: string | null
          quantity?: number
          selling_price?: number | null
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          designation?: string | null
          id?: string
          product_code?: string | null
          product_id?: string | null
          purchase_order_id?: string | null
          quantity?: number
          selling_price?: number | null
          total_price?: number
          unit_price?: number
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
          customs_duty: number | null
          deleted: boolean | null
          delivery_address: string | null
          delivery_note_id: string | null
          discount: number | null
          expected_delivery_date: string | null
          id: string
          logistics_cost: number | null
          notes: string | null
          order_number: string
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
          user_id: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          customs_duty?: number | null
          deleted?: boolean | null
          delivery_address?: string | null
          delivery_note_id?: string | null
          discount?: number | null
          expected_delivery_date?: string | null
          id?: string
          logistics_cost?: number | null
          notes?: string | null
          order_number: string
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
          user_id?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          customs_duty?: number | null
          deleted?: boolean | null
          delivery_address?: string | null
          delivery_note_id?: string | null
          discount?: number | null
          expected_delivery_date?: string | null
          id?: string
          logistics_cost?: number | null
          notes?: string | null
          order_number?: string
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
          user_id?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_delivery_note_id_fkey"
            columns: ["delivery_note_id"]
            isOneToOne: false
            referencedRelation: "delivery_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
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
      purchases: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          order_number: string | null
          status: string | null
          supplier_id: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          order_number?: string | null
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          order_number?: string | null
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          amount: number | null
          client_email: string | null
          client_name: string
          created_at: string | null
          description: string | null
          discount: number | null
          id: string
          quote_number: string
          status: string | null
          updated_at: string | null
          validity_date: string | null
          vat_rate: number | null
        }
        Insert: {
          amount?: number | null
          client_email?: string | null
          client_name: string
          created_at?: string | null
          description?: string | null
          discount?: number | null
          id?: string
          quote_number: string
          status?: string | null
          updated_at?: string | null
          validity_date?: string | null
          vat_rate?: number | null
        }
        Update: {
          amount?: number | null
          client_email?: string | null
          client_name?: string
          created_at?: string | null
          description?: string | null
          discount?: number | null
          id?: string
          quote_number?: string
          status?: string | null
          updated_at?: string | null
          validity_date?: string | null
          vat_rate?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      stock: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          purchase_price: number | null
          quantity: number | null
          sale_price: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_price?: number | null
          quantity?: number | null
          sale_price?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_price?: number | null
          quantity?: number | null
          sale_price?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfer_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          transfer_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity: number
          transfer_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          created_at: string | null
          destination_pos_id: string | null
          destination_warehouse_id: string | null
          id: string
          notes: string | null
          reference: string | null
          source_pos_id: string | null
          source_warehouse_id: string | null
          status: string | null
          transfer_date: string | null
          transfer_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          destination_pos_id?: string | null
          destination_warehouse_id?: string | null
          id?: string
          notes?: string | null
          reference?: string | null
          source_pos_id?: string | null
          source_warehouse_id?: string | null
          status?: string | null
          transfer_date?: string | null
          transfer_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          destination_pos_id?: string | null
          destination_warehouse_id?: string | null
          id?: string
          notes?: string | null
          reference?: string | null
          source_pos_id?: string | null
          source_warehouse_id?: string | null
          status?: string | null
          transfer_date?: string | null
          transfer_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_destination_pos_id_fkey"
            columns: ["destination_pos_id"]
            isOneToOne: false
            referencedRelation: "pos_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_destination_warehouse_id_fkey"
            columns: ["destination_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_source_pos_id_fkey"
            columns: ["source_pos_id"]
            isOneToOne: false
            referencedRelation: "pos_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_source_warehouse_id_fkey"
            columns: ["source_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_order_products: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          inventory_id: string | null
          name: string
          notes: string | null
          order_id: string
          price_requested: boolean | null
          quality_check: boolean | null
          quantity: number
          reference: string | null
          status: string | null
          total_price: number | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          inventory_id?: string | null
          name: string
          notes?: string | null
          order_id: string
          price_requested?: boolean | null
          quality_check?: boolean | null
          quantity: number
          reference?: string | null
          status?: string | null
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          inventory_id?: string | null
          name?: string
          notes?: string | null
          order_id?: string
          price_requested?: boolean | null
          quality_check?: boolean | null
          quantity?: number
          reference?: string | null
          status?: string | null
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_order_products_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "supplier_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_orders: {
        Row: {
          created_at: string | null
          customs_duty: number | null
          delivery_address: string | null
          discount: number | null
          expected_delivery_date: string | null
          id: string
          is_price_request: boolean | null
          notes: string | null
          order_number: string
          order_status: string | null
          paid_amount: number | null
          payment_status: string | null
          payment_terms: string | null
          quality_check_required: boolean | null
          remaining_amount: number | null
          shipping_cost: number | null
          status: string | null
          supplier_id: string
          tax_rate: number | null
          total_amount: number | null
          validated_by: string | null
        }
        Insert: {
          created_at?: string | null
          customs_duty?: number | null
          delivery_address?: string | null
          discount?: number | null
          expected_delivery_date?: string | null
          id?: string
          is_price_request?: boolean | null
          notes?: string | null
          order_number: string
          order_status?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          payment_terms?: string | null
          quality_check_required?: boolean | null
          remaining_amount?: number | null
          shipping_cost?: number | null
          status?: string | null
          supplier_id: string
          tax_rate?: number | null
          total_amount?: number | null
          validated_by?: string | null
        }
        Update: {
          created_at?: string | null
          customs_duty?: number | null
          delivery_address?: string | null
          discount?: number | null
          expected_delivery_date?: string | null
          id?: string
          is_price_request?: boolean | null
          notes?: string | null
          order_number?: string
          order_status?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          payment_terms?: string | null
          quality_check_required?: boolean | null
          remaining_amount?: number | null
          shipping_cost?: number | null
          status?: string | null
          supplier_id?: string
          tax_rate?: number | null
          total_amount?: number | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_return_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          reason: string | null
          supplier_return_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          reason?: string | null
          supplier_return_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          reason?: string | null
          supplier_return_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "supplier_return_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_return_items_supplier_return_id_fkey"
            columns: ["supplier_return_id"]
            isOneToOne: false
            referencedRelation: "supplier_returns"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_returns: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          purchase_invoice_id: string | null
          reason: string | null
          return_number: string
          status: string | null
          supplier_id: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          purchase_invoice_id?: string | null
          reason?: string | null
          return_number: string
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          purchase_invoice_id?: string | null
          reason?: string | null
          return_number?: string
          status?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_returns_purchase_invoice_id_fkey"
            columns: ["purchase_invoice_id"]
            isOneToOne: false
            referencedRelation: "purchase_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_returns_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string | null
          delivery_score: number | null
          email: string | null
          id: string
          last_delivery: string | null
          name: string
          orders_count: number | null
          pending_orders: number | null
          performance_score: number | null
          phone: string | null
          product_categories: string[] | null
          products_count: number | null
          quality_score: number | null
          rating: number | null
          reliability: number | null
          status: string | null
          total_revenue: number | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string | null
          delivery_score?: number | null
          email?: string | null
          id?: string
          last_delivery?: string | null
          name: string
          orders_count?: number | null
          pending_orders?: number | null
          performance_score?: number | null
          phone?: string | null
          product_categories?: string[] | null
          products_count?: number | null
          quality_score?: number | null
          rating?: number | null
          reliability?: number | null
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string | null
          delivery_score?: number | null
          email?: string | null
          id?: string
          last_delivery?: string | null
          name?: string
          orders_count?: number | null
          pending_orders?: number | null
          performance_score?: number | null
          phone?: string | null
          product_categories?: string[] | null
          products_count?: number | null
          quality_score?: number | null
          rating?: number | null
          reliability?: number | null
          status?: string | null
          total_revenue?: number | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      warehouse_stock: {
        Row: {
          created_at: string | null
          id: string
          max_stock_level: number | null
          min_stock_level: number | null
          pos_location_id: string | null
          price: number | null
          product_id: string
          quantity: number
          total_value: number
          unit_price: number
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_stock_level?: number | null
          min_stock_level?: number | null
          pos_location_id?: string | null
          price?: number | null
          product_id: string
          quantity?: number
          total_value?: number
          unit_price?: number
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_stock_level?: number | null
          min_stock_level?: number | null
          pos_location_id?: string | null
          price?: number | null
          product_id?: string
          quantity?: number
          total_value?: number
          unit_price?: number
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_warehouse_stock_catalog"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_warehouse_stock_warehouse"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_stock_pos_location_id_fkey"
            columns: ["pos_location_id"]
            isOneToOne: false
            referencedRelation: "pos_locations"
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
          notes: string | null
          product_id: string
          quantity: number
          reason: string | null
          total_value: number
          type: string
          unit_price: number
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          total_value?: number
          type: string
          unit_price?: number
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          total_value?: number
          type?: string
          unit_price?: number
          updated_at?: string | null
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
          capacity: number | null
          created_at: string
          id: string
          location: string
          manager: string
          name: string
          occupied: number | null
          status: string | null
          surface: number | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          id?: string
          location: string
          manager: string
          name: string
          occupied?: number | null
          status?: string | null
          surface?: number | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          id?: string
          location?: string
          manager?: string
          name?: string
          occupied?: number | null
          status?: string | null
          surface?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_purchase_order: {
        Args: {
          new_status: string
          order_id: string
        }
        Returns: boolean
      }
      delete_purchase_order: {
        Args: {
          order_id: string
        }
        Returns: undefined
      }
      is_internal_user: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "manager" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
