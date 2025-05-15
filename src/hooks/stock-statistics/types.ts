
export interface StockItem {
  id: string;
  warehouse_id: string;
  name: string;
  quantity: number;
  product: any;
  unit_price: number;
  total_value: number;
}

export interface WarehouseStockData {
  id: string;
  warehouse_id: string;
  warehouse: {
    name: string;
  };
  quantity: number;
  unit_price: number;
  total_value: number;
  product: any;
}
