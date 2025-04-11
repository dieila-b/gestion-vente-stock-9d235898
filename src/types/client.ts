
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
}
