
export interface Transfer {
  id: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  source_warehouse?: { name: string };
  destination_warehouse?: { name: string };
  product?: { name: string };
  
  // Additional properties needed for the transfer components
  reference?: string;
  transfer_date?: string;
  transfer_type?: "depot_to_pos" | "pos_to_depot" | "depot_to_depot";
  status?: "pending" | "completed" | "cancelled";
  notes?: string;
  source_pos?: { name: string };
  destination_pos?: { name: string };
  items?: { transfer_id: string; quantity: number }[];
}
