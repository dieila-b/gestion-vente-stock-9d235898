
export interface Client {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  status: "entreprise" | "particulier";
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  client_type?: string;
  client_code?: string;
}
