
export interface POSLocation {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: string;
  status?: string;
  is_active?: boolean;
  capacity?: number;
  occupied?: number;
  surface?: number;
  created_at?: string;
  updated_at?: string;
}
