
export interface Client {
  id: string;
  company_name: string;
  contact_name?: string;
  client_code?: string;
  client_type?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  status?: string;
}
