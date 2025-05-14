
import { safeArray } from '../safe-access';
import { safeWarehouse } from './warehouse';
import { safePOSLocation } from './pos-location';
import { safeProduct } from './product';

/**
 * Cast with type checking to fix Transfer typings
 */
export function castToTransfers(data: any[]): any[] {
  return (data || []).map(item => ({
    ...item,
    source_warehouse: safeWarehouse(item.source_warehouse),
    destination_warehouse: safeWarehouse(item.destination_warehouse),
    product: safeProduct(item.product),
  }));
}
