
export interface Transfer {
  id: string;
  status: string;
  transfer_type: string;
  notes: string;
  transfer_date: string;
  source_warehouse?: {
    name: string;
  };
  destination_warehouse?: {
    name: string;
  };
  source_pos?: {
    name: string;
  };
  destination_pos?: {
    name: string;
  };
  items?: any[];
  reference?: string;
  
  // Add the missing properties
  source_warehouse_id?: string;
  destination_warehouse_id?: string;
  source_pos_id?: string;
  destination_pos_id?: string;
}
