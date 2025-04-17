
import { isSelectQueryError } from '../safe-access';

/**
 * Safely handle product properties
 */
export function safeProduct(product: any): {
  id?: string;
  name?: string;
  reference?: string;
  category?: string;
  price?: number;
} {
  if (isSelectQueryError(product)) {
    return {
      id: '',
      name: 'Produit non disponible',
      reference: '',
      category: '',
      price: 0
    };
  }
  return product || { 
    id: '', 
    name: 'Produit inconnu', 
    reference: '', 
    category: '',
    price: 0 
  };
}
