
export interface POSLocation {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  is_active: boolean;
  manager: string;
  capacity: number;
  occupied: number;
  surface: number;
  created_at: string;
  updated_at: string | null;
}
