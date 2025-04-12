
export interface Client {
  id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  balance?: number;
  client_code?: string;
  client_type?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  mobile_1?: string;
  mobile_2?: string;
  whatsapp?: string;
  credit_limit?: number;
  rc_number?: string;
  cc_number?: string;
  status?: string;
}
