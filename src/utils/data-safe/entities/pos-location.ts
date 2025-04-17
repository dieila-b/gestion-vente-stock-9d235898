
import { isSelectQueryError } from '../safe-access';

/**
 * Safely handle POS location properties
 */
export function safePOSLocation(location: any): any {
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
      surface: 0
    };
  }
  return location || { id: '', name: 'Emplacement inconnu' };
}
