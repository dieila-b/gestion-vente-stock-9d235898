
export type GeographicZone = {
  id: string;
  name: string;
  type: "region" | "zone" | "emplacement";
  parent_id?: string;
  description?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type ParentZone = Pick<GeographicZone, "id" | "name" | "type">;
