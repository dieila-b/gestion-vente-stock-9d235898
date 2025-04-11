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
          price: number
          stock: number
          reference: string
          category: string
          image_url: string
          purchase_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          price?: number
          stock?: number
          reference?: string
          category?: string
          image_url?: string
          purchase_price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          stock?: number
          reference?: string
          category?: string
          image_url?: string
          purchase_price?: number
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
        }
        Relationships: []
      }
      customer_return_items: {
        Row: {
          id: string
          return_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          return_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          return_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
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
          }
        ]
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
          }
        ]
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
          amount?: number
          description?: string
          expense_category_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          amount?: number
          description?: string
          expense_category_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcome_entries_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          discount: number
          delivered_quantity: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          discount?: number
          delivered_quantity?: number
          total?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          discount?: number
          delivered_quantity?: number
          total?: number
          created_at?: string
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
          }
        ]
      }
      orders: {
        Row: {
          id: string
          client_id: string
          created_at: string
          updated_at: string
          status: string
          payment_status: string
          comment: string
          total: number
          discount: number
          final_total: number
          paid_amount: number
          remaining_amount: number
          delivery_status: string
        }
        Insert: {
          id?: string
          client_id?: string
          created_at?: string
          updated_at?: string
          status?: string
          payment_status?: string
          comment?: string
          total?: number
          discount?: number
          final_total?: number
          paid_amount?: number
          remaining_amount?: number
          delivery_status?: string
        }
        Update: {
          id?: string
          client_id?: string
          created_at?: string
          updated_at?: string
          status?: string
          payment_status?: string
          comment?: string
          total?: number
          discount?: number
          final_total?: number
          paid_amount?: number
          remaining_amount?: number
          delivery_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          client_id: string
          issue_date: string
          due_date: string
          total_amount: number
          payment_status: string
          paid_amount: number
          remaining_amount: number
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number?: string
          client_id?: string
          issue_date?: string
          due_date?: string
          total_amount?: number
          payment_status?: string
          paid_amount?: number
          remaining_amount?: number
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
          payment_status?: string
          paid_amount?: number
          remaining_amount?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_id: string
          quantity: number
          price: number
          discount: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id?: string
          product_id?: string
          quantity?: number
          price?: number
          discount?: number
          total?: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          product_id?: string
          quantity?: number
          price?: number
          discount?: number
          total?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          }
        ]
      }
      invoice_payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_date: string
          payment_method: string
          reference: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string
          reference?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string
          reference?: string
          notes?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_name: string
          email: string
          phone: string
          address: string
          city: string
          country: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string
          contact_name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          country?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          country?: string
          notes?: string
          created_at?: string
          updated_at?: string
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
          remaining_amount: number
          created_at: string
          updated_at: string
          deleted: boolean
        }
        Insert: {
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
          remaining_amount?: number
          created_at?: string
          updated_at?: string
          deleted?: boolean
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
          remaining_amount?: number
          created_at?: string
          updated_at?: string
          deleted?: boolean
        }
        Relationships: [
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
          }
        ]
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
          updated_at: string
        }
        Insert: {
          id?: string
          purchase_order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          purchase_order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
          updated_at?: string
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
          }
        ]
      }
      warehouses: {
        Row: {
          id: string
          name: string
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          created_at?: string
          updated_at?: string
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
          }
        ]
      }
      delivery_note_items: {
        Row: {
          id: string
          delivery_note_id: string
          product_id: string
          quantity_ordered: number
          quantity_received: number
          unit_price: number
          total_price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          delivery_note_id?: string
          product_id?: string
          quantity_ordered?: number
          quantity_received?: number
          unit_price?: number
          total_price?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          delivery_note_id?: string
          product_id?: string
          quantity_ordered?: number
          quantity_received?: number
          unit_price?: number
          total_price?: number
          created_at?: string
          updated_at?: string
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
          }
        ]
      }
      stock_transfers: {
        Row: {
          id: string
          source_warehouse_id: string
          destination_warehouse_id: string
          source_pos_id: string
          destination_pos_id: string
          transfer_type: string
          notes: string
          status: string
          transfer_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          source_warehouse_id?: string
          destination_warehouse_id?: string
          source_pos_id?: string
          destination_pos_id?: string
          transfer_type?: string
          notes?: string
          status?: string
          transfer_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          source_warehouse_id?: string
          destination_warehouse_id?: string
          source_pos_id?: string
          destination_pos_id?: string
          transfer_type?: string
          notes?: string
          status?: string
          transfer_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_transfer_items: {
        Row: {
          id: string
          transfer_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
          status: string
        }
        Insert: {
          id?: string
          transfer_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
          status?: string
        }
        Update: {
          id?: string
          transfer_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
          status?: string
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
          }
        ]
      }
      pos_locations: {
        Row: {
          id: string
          name: string
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_users: {
        Row: {
          id: string
          email: string
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role: "manager" | "admin" | "employee"
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: "manager" | "admin" | "employee"
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          id: string
          name: string
          bank_name: string
          account_type: string
          account_number: string
          current_balance: number
          initial_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          bank_name: string
          account_type: string
          account_number: string
          current_balance?: number
          initial_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          bank_name?: string
          account_type?: string
          account_number?: string
          current_balance?: number
          initial_balance?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      warehouse_stock_movements: {
        Row: {
          id: string
          warehouse_id: string
          product_id: string
          quantity: number
          type: string
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          warehouse_id: string
          product_id: string
          quantity: number
          type: string
          reason: string
          created_at?: string
        }
        Update: {
          id?: string
          warehouse_id?: string
          product_id?: string
          quantity?: number
          type?: string
          reason?: string
          created_at?: string
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
          }
        ]
      }
      income_entries: {
        Row: {
          id: string
          amount: number
          description: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          amount: number
          description?: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          amount?: number
          description?: string
          date?: string
          created_at?: string
        }
        Relationships: []
      }
      supplier_orders: {
        Row: {
          id: string
          supplier_id: string
          order_date: string
          status: string
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          order_date?: string
          status?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          order_date?: string
          status?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      supplier_order_products: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_order_products_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "supplier_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_order_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog"
            referencedColumns: ["id"]
          }
        ]
      }
      quotes: {
        Row: {
          id: string
          quote_number: string
          client_id: string
          issue_date: string
          expiry_date: string
          total_amount: number
          status: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quote_number?: string
          client_id: string
          issue_date: string
          expiry_date: string
          total_amount: number
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quote_number?: string
          client_id?: string
          issue_date?: string
          expiry_date?: string
          total_amount?: number
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_invoices: {
        Row: {
          id: string
          invoice_number: string
          supplier_id: string
          issue_date: string
          due_date: string
          total_amount: number
          payment_status: string
          paid_amount: number
          remaining_amount: number
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          supplier_id: string
          issue_date: string
          due_date: string
          total_amount: number
          payment_status?: string
          paid_amount?: number
          remaining_amount?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          supplier_id?: string
          issue_date?: string
          due_date?: string
          total_amount?: number
          payment_status?: string
          paid_amount?: number
          remaining_amount?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      purchase_invoice_payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_date: string
          payment_method: string
          reference: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          payment_date: string
          payment_method: string
          reference?: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string
          reference?: string
          notes?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "purchase_invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      product_units: {
        Row: {
          id: string
          name: string
          abbreviation: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          abbreviation: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          abbreviation?: string
          created_at?: string
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
