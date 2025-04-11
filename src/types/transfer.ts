
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
}
