
export interface Client {
  id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  mobile_1?: string;
  mobile_2?: string;
  whatsapp?: string;
  credit_limit?: number;
  rc_number?: string;
  cc_number?: string;
  status: string; // Changed from optional to required
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  balance?: number;
  client_type?: string;
  client_code?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
