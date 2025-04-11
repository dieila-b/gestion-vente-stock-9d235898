
/**
 * Define types for geographic data
 */

export interface ParentZone {
  id: string;
  name: string;
  type: "region" | "zone" | "emplacement";
}

export interface GeographicZone {
  id: string;
  name: string;
  type: "region" | "zone" | "emplacement";
  description?: string;
  parent_id?: string;
  created_at: string;
}

export interface ZoneType {
  id: string;
  name: string;
}
