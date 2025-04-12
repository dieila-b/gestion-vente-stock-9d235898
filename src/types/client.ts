
export interface Client {
  id: string;
  company_name: string;
  contact_name?: string;
  client_code?: string;
  client_type?: string;
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
  notes?: string;
  credit_limit?: number;
  tax_number?: string;
  rc_number?: string;
  cc_number?: string;
  payment_terms?: string;
  created_at: string;
  updated_at: string;
  status?: string;
}
