
export interface StockMovement {
  id: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  type: 'in' | 'out';
  reason?: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    reference?: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
  pos_location?: {
    id: string;
    name: string;
  } | null;
}

export interface StockEntryForm {
  productId: string;
  warehouseId: string;
  quantity: number;
  unitPrice: number;
  reason: string;
}

export interface FormValues {
  product: string;
  warehouse: string;
  quantity: number;
  unitPrice?: number;
  reason: string;
}
