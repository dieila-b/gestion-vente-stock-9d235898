
import { Client } from "@/types/client_unified";

// Enforce required fields in report types
export interface PeriodTotals {
  total: number;
  paid: number;
  remaining: number;
}

export interface DailyProductSales {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_sales: number;
}

export interface DailyClientSales {
  client: Client;
  client_id: string;
  total: number;
  paid_amount: number;
  remaining_amount: number;
}

export type SalesByProduct = DailyProductSales;
export type ClientSale = DailyClientSales;

// Add a DateRange type for UnpaidReport component
export interface DateRange {
  from?: Date;
  to?: Date;
}
