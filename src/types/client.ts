
export interface Client {
  id: string;
  company_name: string; // Making this required to match expectations
  contact_name?: string;
  email?: string;
  phone?: string;
  mobile_1?: string;
  mobile_2?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  client_code?: string;
  client_type?: string;
  notes?: string;
  credit_limit?: number;
  tax_number?: string;
  rc_number?: string;
  cc_number?: string;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
  status?: 'particulier' | 'entreprise' | string;
  balance?: number;
}
