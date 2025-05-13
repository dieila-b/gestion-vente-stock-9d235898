
import { isSelectQueryError } from '../safe-access';
import { POSLocation } from '@/types/pos-locations';

/**
 * Safely handle POS location properties
 */
export function safePOSLocation(location: any): POSLocation {
  if (isSelectQueryError(location)) {
    return {
      id: '',
      name: 'Emplacement non disponible',
      phone: '',
      email: '',
      address: '',
      status: '',
      is_active: true,
      manager: '',
      capacity: 0,
      occupied: 0,
      surface: 0,
      created_at: '',
      updated_at: null
    };
  }
  
  if (!location) {
    return {
      id: '',
      name: 'Emplacement inconnu',
      phone: '',
      email: '',
      address: '',
      status: '',
      is_active: true,
      manager: '',
      capacity: 0,
      occupied: 0,
      surface: 0,
      created_at: '',
      updated_at: null
    };
  }
  
  return location;
}
