
export interface POSLocation {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location?: string;
  surface?: number;
  capacity?: number;
  occupied?: number;
  manager?: string;
  status?: string;
  address?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
