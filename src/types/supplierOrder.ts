
export interface SupplierOrderProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  reference: string;
  status?: "pending" | "validated" | "rejected";
  qualityCheck?: boolean;
  notes?: string;
  priceRequested?: boolean;
}

export interface SupplierOrder {
  id: string;
  supplierId: string;
  orderNumber: string;
  status: "draft" | "pending" | "validated" | "shipped" | "delivered" | "cancelled" | "price_request";
  paymentStatus: "pending" | "partial" | "paid";
  orderStatus: "pending" | "delivered";
  createdAt: string;
  expectedDeliveryDate: string;
  products: SupplierOrderProduct[];
  totalAmount: number;
  paidAmount?: number;
  remainingAmount?: number;
  notes?: string;
  validatedBy?: string;
  deliveryAddress: string;
  discount?: number;
  shippingCost?: number;
  taxRate?: number;
  customsDuty?: number;
  paymentTerms?: string;
  qualityCheckRequired?: boolean;
  isPriceRequest?: boolean;
}
