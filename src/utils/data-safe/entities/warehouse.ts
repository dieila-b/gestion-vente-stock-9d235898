
import { isSelectQueryError } from '../safe-access';

/**
 * Safely handle warehouse properties
 */
export function safeWarehouse(warehouse: any): {
  id?: string;
  name: string;
} {
  if (isSelectQueryError(warehouse)) {
    return {
      id: '',
      name: 'Entrepôt non disponible'
    };
  }
  return warehouse || { id: '', name: 'Entrepôt inconnu' };
}
