
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
}
