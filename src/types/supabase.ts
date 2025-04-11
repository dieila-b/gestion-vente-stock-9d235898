
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
          type: string
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
          name: string
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
          unit_id: string
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
          unit_id?: string
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
          unit_id?: string
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
          whatsapp: string
          mobile_1: string
          mobile_2: string
          credit_limit: number
          balance: number
          rc_number: string
          cc_number: string
          tax_number: string
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
          status: string
          whatsapp?: string
          mobile_1?: string
          mobile_2?: string
          credit_limit?: number
          balance?: number
          rc_number?: string
          cc_number?: string
          tax_number?: string
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
          whatsapp?: string
          mobile_1?: string
          mobile_2?: string
          credit_limit?: number
          balance?: number
          rc_number?: string
          cc_number?: string
          tax_number?: string
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
          date: string
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          amount: number
          description?: string
          date: string
          category_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          amount?: number
          description?: string
          date?: string
          category_id?: string
          created_at?: string
        }
        Relationships: []
      }
      outcome_entries: {
        Row: {
          id: string
          amount: number
          description: string
          date: string
          expense_category_id: string
          created_at: string
          receipt_number: string
          payment_method: string
          status: string
        }
        Insert: {
          id?: string
          amount: number
          description?: string
          date: string
          expense_category_id?: string
          created_at?: string
          receipt_number?: string
          payment_method?: string
          status?: string
        }
        Update: {
          id?: string
          amount?: number
          description?: string
          date?: string
          expense_category_id?: string
          created_at?: string
          receipt_number?: string
          payment_method?: string
          status?: string
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
          id?: string
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
          total: number
          discount: number
          delivered_quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          total?: number
          discount?: number
          delivered_quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          total?: number
          discount?: number
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
      preorders: {
        Row: {
          id: string
          client_id: string
          notes: string
          status: string
          total_amount: number
          paid_amount: number
          remaining_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id?: string
          notes?: string
          status?: string
          total_amount?: number
          paid_amount?: number
          remaining_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          notes?: string
          status?: string
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
          total_price: number
          discount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          preorder_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          discount?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          preorder_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          discount?: number
          status?: string
          created_at?: string
        }
        Relationships: []
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
          transit_cost: number
          logistics_cost: number
          tax_rate: number
          subtotal: number
          tax_amount: number
          total_ttc: number
          shipping_cost: number
          discount: number
          created_at: string
          updated_at: string
          deleted: boolean
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
          transit_cost?: number
          logistics_cost?: number
          tax_rate?: number
          subtotal?: number
          tax_amount?: number
          total_ttc?: number
          shipping_cost?: number
          discount?: number
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
          transit_cost?: number
          logistics_cost?: number
          tax_rate?: number
          subtotal?: number
          tax_amount?: number
          total_ttc?: number
          shipping_cost?: number
          discount?: number
          created_at?: string
          updated_at?: string
          deleted?: boolean
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
          selling_price: number
          created_at: string
        }
        Insert: {
          id?: string
          purchase_order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          selling_price?: number
          created_at?: string
        }
        Update: {
          id?: string
          purchase_order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          selling_price?: number
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
          source_warehouse_id: string
          destination_warehouse_id: string
          source_pos_id: string
          destination_pos_id: string
          transfer_type: string
          notes: string
          status: string
          transfer_date: string
        }
        Insert: {
          id?: string
          from_warehouse_id?: string
          to_warehouse_id?: string
          product_id?: string
          quantity: number
          created_at?: string
          source_warehouse_id?: string
          destination_warehouse_id?: string
          source_pos_id?: string
          destination_pos_id?: string
          transfer_type?: string
          notes?: string
          status?: string
          transfer_date?: string
        }
        Update: {
          id?: string
          from_warehouse_id?: string
          to_warehouse_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          source_warehouse_id?: string
          destination_warehouse_id?: string
          source_pos_id?: string
          destination_pos_id?: string
          transfer_type?: string
          notes?: string
          status?: string
          transfer_date?: string
        }
        Relationships: []
      }
      stock_transfer_items: {
        Row: {
          id: string
          transfer_id: string
          product_id: string
          quantity: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          transfer_id?: string
          product_id?: string
          quantity: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          transfer_id?: string
          product_id?: string
          quantity?: number
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          id: string
          name: string
          location: string
          surface: number
          capacity: number
          occupied: number
          manager: string
          status: string
          address: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string
          surface?: number
          capacity?: number
          occupied?: number
          manager?: string
          status?: string
          address?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          surface?: number
          capacity?: number
          occupied?: number
          manager?: string
          status?: string
          address?: string
          is_active?: boolean
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
      warehouse_stock_movements: {
        Row: {
          id: string
          product_id: string
          warehouse_id: string
          quantity: number
          type: string
          created_at: string
          reason: string
        }
        Insert: {
          id?: string
          product_id?: string
          warehouse_id?: string
          quantity: number
          type: string
          created_at?: string
          reason?: string
        }
        Update: {
          id?: string
          product_id?: string
          warehouse_id?: string
          quantity?: number
          type?: string
          created_at?: string
          reason?: string
        }
        Relationships: []
      }
      // Additional tables that were missing
      bank_accounts: {
        Row: {
          id: string
          name: string
          bank_name: string
          account_type: string
          account_number: string
          current_balance: number
          initial_balance: number
          status: string
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
          status?: string
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
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_method: string
          created_at: string
          notes: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          payment_method: string
          created_at?: string
          notes?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_method?: string
          created_at?: string
          notes?: string
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
          payment_status: "paid" | "partial" | "pending"
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
          payment_status?: "paid" | "partial" | "pending"
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
          payment_status?: "paid" | "partial" | "pending"
          paid_amount?: number
          remaining_amount?: number
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_id: string
          quantity: number
          price: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          product_id: string
          quantity: number
          price: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          product_id?: string
          quantity?: number
          price?: number
          total?: number
          created_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          name: string
          phone: string
          email: string
          address: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone?: string
          email?: string
          address?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string
          address?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplier_orders: {
        Row: {
          id: string
          supplier_id: string
          order_number: string
          status: string
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          order_number?: string
          status?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          order_number?: string
          status?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
        Relationships: []
      }
      supplier_returns: {
        Row: {
          id: string
          supplier_id: string
          purchase_order_id: string
          return_date: string
          status: string
          notes: string
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          purchase_order_id?: string
          return_date: string
          status?: string
          notes?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          purchase_order_id?: string
          return_date?: string
          status?: string
          notes?: string
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplier_return_items: {
        Row: {
          id: string
          return_id: string
          product_id: string
          quantity: number
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          return_id: string
          product_id: string
          quantity: number
          reason?: string
          created_at?: string
        }
        Update: {
          id?: string
          return_id?: string
          product_id?: string
          quantity?: number
          reason?: string
          created_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          name: string
          quantity: number
          category: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          quantity?: number
          category?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          quantity?: number
          category?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_invoices: {
        Row: {
          id: string
          invoice_number: string
          supplier_id: string
          issue_date: string
          due_date: string
          total_amount: number
          tax_amount: number
          payment_status: string
          paid_amount: number
          remaining_amount: number
          status: string
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
          tax_amount?: number
          payment_status?: string
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
          supplier_id?: string
          issue_date?: string
          due_date?: string
          total_amount?: number
          tax_amount?: number
          payment_status?: string
          paid_amount?: number
          remaining_amount?: number
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_invoice_payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_method: string
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          payment_method: string
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_method?: string
          notes?: string
          created_at?: string
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
      delivery_note_items: {
        Row: {
          id: string
          delivery_note_id: string
          product_id: string
          expected_quantity: number
          received_quantity: number
          unit_price: number
          status: string
          created_at: string
          quantity_received: number
        }
        Insert: {
          id?: string
          delivery_note_id: string
          product_id: string
          expected_quantity: number
          received_quantity?: number
          unit_price: number
          status?: string
          created_at?: string
          quantity_received?: number
        }
        Update: {
          id?: string
          delivery_note_id?: string
          product_id?: string
          expected_quantity?: number
          received_quantity?: number
          unit_price?: number
          status?: string
          created_at?: string
          quantity_received?: number
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
