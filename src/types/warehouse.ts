
export interface Warehouse {
  id: string;
  name: string;
  address: string;
  location: string;
  status: string;
  is_active: boolean;
  manager: string;
  capacity: number;
  occupied: number;
  surface: number;
  created_at: string;
  updated_at: string | null;
}
