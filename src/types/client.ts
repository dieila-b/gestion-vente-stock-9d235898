
// Client interface definition
export interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: "particulier" | "entreprise";
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  notes?: string;
  client_code?: string;
  client_type?: string;
  created_at?: string;
  updated_at?: string;
  // Add missing properties
  mobile_1?: string;
  mobile_2?: string;
  whatsapp?: string;
  credit_limit?: number;
  rc_number?: string;
  cc_number?: string;
  tax_number?: string;
}
