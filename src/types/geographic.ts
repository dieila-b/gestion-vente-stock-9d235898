
export interface GeographicZone {
  id: string;
  name: string;
  type: 'region' | 'zone' | 'emplacement';
  parent_id?: string;
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  created_at?: string;
  updated_at?: string;
}
