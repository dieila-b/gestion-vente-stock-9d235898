
import { Database } from "@/integrations/supabase/types";

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type CatalogRow = Database['public']['Tables']['catalog']['Row'];
export type TransferRow = Database['public']['Tables']['stock_transfers']['Row'];

export interface Activity {
  id: string;
  action: string;
  details: string;
  time: string;
  timestamp: Date;
  status?: string;
  uniqueKey?: string;
}

// Type guard functions to check if payload has required properties
export const isOrderRow = (payload: any): payload is OrderRow => {
  return payload && typeof payload.id === 'string' && typeof payload.created_at === 'string';
};

export const isCatalogRow = (payload: any): payload is CatalogRow => {
  return payload && typeof payload.id === 'string' && typeof payload.updated_at === 'string';
};

export const isTransferRow = (payload: any): payload is TransferRow => {
  return payload && typeof payload.id === 'string' && typeof payload.created_at === 'string';
};

