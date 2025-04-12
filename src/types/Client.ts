
export interface Client {
  id: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  client_code?: string;
  client_type?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  status: string; // Changed to match client.ts
  balance?: number;
}
