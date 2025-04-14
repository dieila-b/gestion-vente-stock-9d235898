
import type { SelectQueryError } from "@/types/db-adapter";

// Type guard to check if an object is a SelectQueryError
export function isSelectQueryError(obj: any): obj is SelectQueryError {
  return obj && typeof obj === 'object' && obj.error === true;
}

// Safely access nested properties when they could be SelectQueryError
export function safeGet<T, K extends keyof T>(obj: T | SelectQueryError, key: K, defaultValue: any = null): T[K] {
  if (isSelectQueryError(obj)) {
    return defaultValue;
  }
  return obj[key] ?? defaultValue;
}

// Safely access client properties from a relation that could be SelectQueryError
export function safeClient(client: any): { 
  id: string; 
  company_name: string; 
  contact_name?: string;
  status?: string;
  email?: string;
  phone?: string;
} {
  if (isSelectQueryError(client)) {
    return {
      id: '',
      company_name: 'Erreur de chargement',
      contact_name: '',
      status: '',
      email: '',
      phone: ''
    };
  }
  return client;
}

// Safely handle arrays that could be SelectQueryError
export function safeArray<T>(items: T[] | SelectQueryError): T[] {
  if (isSelectQueryError(items)) {
    return [];
  }
  return items;
}

// Safely handle supplier properties
export function safeSupplier(supplier: any): {
  id: string;
  name: string;
  phone?: string;
  email?: string;
} {
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

// Safely handle product properties
export function safeProduct(product: any): {
  id?: string;
  name?: string;
  reference?: string;
  category?: string;
} {
  if (isSelectQueryError(product)) {
    return {
      id: '',
      name: 'Produit non disponible',
      reference: '',
      category: ''
    };
  }
  return product || { 
    id: '', 
    name: 'Produit inconnu', 
    reference: '', 
    category: '' 
  };
}

// Safely handle purchase order properties
export function safePurchaseOrder(purchaseOrder: any): {
  id: string;
  order_number: string;
} {
  if (isSelectQueryError(purchaseOrder)) {
    return {
      id: '',
      order_number: 'Bon de commande non disponible'
    };
  }
  return purchaseOrder || { id: '', order_number: '' };
}

// Safely handle delivery note properties
export function safeDeliveryNote(deliveryNote: any): {
  id: string;
  delivery_number: string;
} {
  if (isSelectQueryError(deliveryNote)) {
    return {
      id: '',
      delivery_number: 'Bon de livraison non disponible'
    };
  }
  return deliveryNote || { id: '', delivery_number: '' };
}

// Safely handle warehouse properties
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
