
import { DeliveryNote } from "@/types/db-adapter";
import { isSelectQueryError } from '../safe-access';

/**
 * Safely handle delivery note properties
 */
export function safeDeliveryNote(deliveryNote: any): DeliveryNote {
  if (isSelectQueryError(deliveryNote)) {
    return {
      id: '',
      delivery_number: 'BL-0000',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: ''
    };
  }
  return deliveryNote || {
    id: '',
    delivery_number: 'BL-0000',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: ''
  };
}
