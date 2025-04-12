
import type { PostgrestError } from "@supabase/supabase-js";

// Type guard to check if an object is a SelectQueryError
export function isSelectQueryError(obj: any): obj is { error: true } & String {
  return obj && typeof obj === 'object' && obj.error === true;
}

// Safely access nested properties when they could be SelectQueryError
export function safeGet<T, K extends keyof T>(obj: T | { error: true } & String, key: K, defaultValue: any = null): T[K] {
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
export function safeArray<T>(items: T[] | { error: true } & String): T[] {
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
  return supplier;
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
  return product;
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
  return warehouse;
}

// Safely handle POS location properties
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
  return location;
}

// Cast with type checking to fix Transfer typings
export function castToTransfers(data: any[]): any[] {
  return data.map(item => ({
    ...item,
    source_warehouse: safeWarehouse(item.source_warehouse),
    destination_warehouse: safeWarehouse(item.destination_warehouse),
    source_pos: safePOSLocation(item.source_pos),
    destination_pos: safePOSLocation(item.destination_pos),
    items: safeArray(item.items)
  }));
}
