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
          id: string;
          cash_register_id: string;
          type: string;
          amount: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          cash_register_id?: string;
          type: string;
          amount?: number;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          cash_register_id?: string;
          type?: string;
          amount?: number;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      cash_registers: {
        Row: {
          id: string;
          name: string;
          initial_amount: number;
          current_amount: number;
          status: string;
          opened_at: string;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          initial_amount?: number;
          current_amount?: number;
          status?: string;
          opened_at?: string;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          initial_amount?: number;
          current_amount?: number;
          status?: string;
          opened_at?: string;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      catalog: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string | null;
          reference: string | null;
          price: number;
          purchase_price: number;
          stock: number;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category?: string | null;
          reference?: string | null;
          price?: number;
          purchase_price?: number;
          stock?: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          reference?: string | null;
          price?: number;
          purchase_price?: number;
          stock?: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          client_code: string | null;
          client_type: string | null;
          company_name: string | null;
          contact_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_code?: string | null;
          client_type?: string | null;
          company_name?: string | null;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_code?: string | null;
          client_type?: string | null;
          company_name?: string | null;
          contact_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customer_returns: {
        Row: {
          id: string;
          return_number: string | null;
          client_id: string | null;
          invoice_id: string | null;
          return_date: string;
          total_amount: number;
          status: "pending" | "completed" | "cancelled";
          reason: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          return_number?: string | null;
          client_id?: string | null;
          invoice_id?: string | null;
          return_date?: string;
          total_amount?: number;
          status?: "pending" | "completed" | "cancelled";
          reason?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          return_number?: string | null;
          client_id?: string | null;
          invoice_id?: string | null;
          return_date?: string;
          total_amount?: number;
          status?: "pending" | "completed" | "cancelled";
          reason?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customer_return_items: {
        Row: {
          id: string;
          return_id: string | null;
          product_id: string | null;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          return_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          return_id?: string | null;
          product_id?: string | null;
          quantity?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      expense_categories: {
        Row: {
          id: string;
          name: string;
          type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      income_entries: {
        Row: {
          id: string;
          amount: number;
          description: string | null;
          category_id: string | null;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          amount: number;
          description?: string | null;
          category_id?: string | null;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          description?: string | null;
          category_id?: string | null;
          date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      outcome_entries: {
        Row: {
          id: string;
          amount: number;
          description: string | null;
          expense_category_id: string | null;
          date: string;
          payment_method: string;
          receipt_number: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          amount: number;
          description?: string | null;
          expense_category_id?: string | null;
          date: string;
          payment_method?: string;
          receipt_number?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          amount?: number;
          description?: string | null;
          expense_category_id?: string | null;
          date?: string;
          payment_method?: string;
          receipt_number?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      pos_locations: {
        Row: {
          id: string;
          name: string;
          location: string;
          surface: number;
          capacity: number;
          occupied: number;
          manager: string;
          status: string;
          address: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          phone: string;
          email: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string;
          surface?: number;
          capacity?: number;
          occupied?: number;
          manager?: string;
          status?: string;
          address?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          phone?: string;
          email?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          surface?: number;
          capacity?: number;
          occupied?: number;
          manager?: string;
          status?: string;
          address?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          phone?: string;
          email?: string;
        };
        Relationships: [];
      };
      warehouse_stock: {
        Row: {
          id: string;
          product_id: string | null;
          warehouse_id: string | null;
          pos_location_id: string | null;
          quantity: number;
          unit_price: number;
          total_value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          warehouse_id?: string | null;
          pos_location_id?: string | null;
          quantity?: number;
          unit_price?: number;
          total_value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          warehouse_id?: string | null;
          pos_location_id?: string | null;
          quantity?: number;
          unit_price?: number;
          total_value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      warehouses: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          surface: number;
          capacity: number;
          occupied: number;
          manager: string | null;
          status: string;
          address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string | null;
          surface?: number;
          capacity?: number;
          occupied?: number;
          manager?: string | null;
          status?: string;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string | null;
          surface?: number;
          capacity?: number;
          occupied?: number;
          manager?: string | null;
          status?: string;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  }
}

// SelectQueryError type for error responses
export interface SelectQueryError<T = string> {
  error: true;
}
