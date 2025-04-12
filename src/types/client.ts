
export interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email?: string;
  phone?: string;
  address?: string;
  zone_id?: string;
  tax_number?: string;
  payment_terms?: string;
  credit_limit?: number;
  status: 'particulier' | 'entreprise';
  created_at?: string;
  updated_at?: string;
  client_code?: string;
  client_type?: string;
  rc_number?: string;
  cc_number?: string;
  city?: string;
  postal_code?: string;
  landline?: string;
  whatsapp?: string;
  mobile_1?: string;
  mobile_2?: string;
  birth_date?: string;
  balance?: number;
}
