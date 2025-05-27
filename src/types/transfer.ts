
export interface Transfer {
  id: string;
  reference?: string;
  source_warehouse_id?: string;
  source_pos_id?: string;
  destination_warehouse_id?: string;
  destination_pos_id?: string;
  product_id: string;
  quantity: number;
  transfer_type: "depot_to_pos" | "pos_to_depot" | "depot_to_depot" | "pos_to_pos";
  status: "pending" | "completed" | "cancelled";
  transfer_date?: string;
  notes?: string;
  created_at: string;
  
  // Relations
  source_warehouse?: {
    id: string;
    name: string;
  };
  destination_warehouse?: {
    id: string;
    name: string;
  };
  source_pos?: {
    id: string;
    name: string;
  };
  destination_pos?: {
    id: string;
    name: string;
  };
  product?: {
    id: string;
    name: string;
    reference?: string;
  };
}
