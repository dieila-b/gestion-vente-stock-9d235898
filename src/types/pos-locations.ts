
export interface POSLocation {
  id: string;
  name: string;
  address?: string; // Make address optional to match usage
  phone?: string;
  email?: string;
  manager?: string;
  status?: string;
  is_active?: boolean;
  capacity?: number;
  occupied?: number;
  surface?: number;
}
