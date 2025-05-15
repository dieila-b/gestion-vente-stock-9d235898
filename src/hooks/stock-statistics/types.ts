
export interface StockItem {
  id: string;
  warehouse_id: string;
  name: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    reference?: string;
    category?: string;
  };
  unit_price: number;
  total_value: number;
}
