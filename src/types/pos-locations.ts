
export type POSLocation = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email?: string | null;
  manager: string;
  status: string;
  capacity: number;
  occupied: number;
  surface: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string | null;
};
