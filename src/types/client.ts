
export interface Client {
  id: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  company_name?: string;
  notes?: string;
  client_code?: string;
  client_type?: string;
  created_at?: string;
  updated_at?: string;
  status: string;
  
  // Additional properties
  whatsapp?: string;
  mobile_1?: string;
  mobile_2?: string;
  credit_limit?: number;
  rc_number?: string;
  cc_number?: string;
  tax_number?: string;
  balance?: number;
  payment_terms?: string;
}

export interface NewClient {
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  company_name: string;
  notes?: string;
  client_code?: string;
  client_type?: string;
  status: string;
  
  // Additional properties
  whatsapp?: string;
  mobile_1?: string;
  mobile_2?: string;
  credit_limit?: number;
  rc_number?: string;
  cc_number?: string;
  tax_number?: string;
  payment_terms?: string;
}

export type ClientFormData = Omit<Client, "id" | "created_at" | "updated_at">;
