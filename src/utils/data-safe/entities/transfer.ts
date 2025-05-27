
import { safeArray } from '../safe-access';
import { safeWarehouse } from './warehouse';
import { safePOSLocation } from './pos-location';
import { safeProduct } from './product';

/**
 * Cast with type checking to fix Transfer typings
 */
export function castToTransfers(data: any[]): any[] {
  return (data || []).map(item => {
    // Handle if item is a JSON object from Supabase functions
    const transfer = typeof item === 'string' ? JSON.parse(item) : item;
    
    return {
      ...transfer,
      source_warehouse: safeWarehouse(transfer.source_warehouse),
      destination_warehouse: safeWarehouse(transfer.destination_warehouse),
      source_pos: safePOSLocation(transfer.source_pos),
      destination_pos: safePOSLocation(transfer.destination_pos),
      product: safeProduct(transfer.product),
    };
  });
}
