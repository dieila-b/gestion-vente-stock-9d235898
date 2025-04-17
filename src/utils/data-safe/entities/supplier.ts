
import { Supplier } from "@/types/db-adapter";
import { isSelectQueryError } from '../safe-access';

/**
 * Safely handle supplier properties
 */
export function safeSupplier(supplier: any): Supplier {
  if (isSelectQueryError(supplier)) {
    return {
      id: '',
      name: 'Erreur de chargement',
      phone: '',
      email: ''
    };
  }
  return supplier || { 
    id: '', 
    name: 'Fournisseur inconnu', 
    phone: '', 
    email: '' 
  };
}
