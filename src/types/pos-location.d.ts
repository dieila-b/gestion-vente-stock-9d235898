
/**
 * Type definition for POS (Point of Sale) locations
 */
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

/**
 * A partial version of POSLocation for when we only need some fields
 */
export type POSLocationPartial = Pick<POSLocation, 'id' | 'name'>;

/**
 * Type for POS location with simplified fields, ready for display
 */
export interface POSLocationDisplay {
  id: string;
  name: string;
  address?: string;
  manager?: string;
  status?: string;
}
