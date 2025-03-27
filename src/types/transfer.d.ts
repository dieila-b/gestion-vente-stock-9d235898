
export interface Transfer {
  id: string;
  reference?: string;
  source_warehouse_id?: string | null;
  destination_warehouse_id?: string | null;
  source_pos_id?: string | null;
  destination_pos_id?: string | null;
  status: "pending" | "completed" | "cancelled";
  transfer_type: "depot_to_pos" | "pos_to_depot" | "depot_to_depot";
  notes: string | null;
  created_at: string;
  transfer_date: string;
  source_warehouse?: { name: string };
  destination_warehouse?: { name: string };
  source_pos?: { name: string };
  destination_pos?: { name: string };
  items?: Array<{
    quantity: number;
    product?: {
      name: string;
    };
  }>;
}

export interface TransferItem {
  id: string;
  transfer_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: { name: string; };
}

export interface TransferWithItems extends Transfer {
  items: TransferItem[];
}
