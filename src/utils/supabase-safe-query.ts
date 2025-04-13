import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { db } from "./db-adapter";
import { BankAccount, DeliveryNote, Supplier, SelectQueryError } from "@/types/db-adapter";

/**
 * Type guard to check if an object is a SelectQueryError
 */
export function isSelectQueryError(obj: any): obj is SelectQueryError {
  return obj && typeof obj === 'object' && obj.error === true;
}

/**
 * Safely access nested properties when they could be SelectQueryError
 */
export function safeGet<T, K extends keyof T>(obj: T | SelectQueryError, key: K, defaultValue: any = null): any {
  if (isSelectQueryError(obj)) {
    return defaultValue;
  }
  return obj[key] ?? defaultValue;
}

/**
 * Safely handle client properties from a relation that could be SelectQueryError
 */
export function safeClient(client: any): { 
  id: string; 
  company_name: string; 
  contact_name?: string;
  status?: string;
  email?: string;
  phone?: string;
  mobile_1?: string;
  whatsapp?: string;
  credit_limit?: number;
  rc_number?: string;
  cc_number?: string;
  created_at: string;
  updated_at: string;
} {
  if (isSelectQueryError(client)) {
    return {
      id: '',
      company_name: 'Erreur de chargement',
      contact_name: '',
      status: 'particulier',
      email: '',
      phone: '',
      mobile_1: '',
      whatsapp: '',
      credit_limit: 0,
      rc_number: '',
      cc_number: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  return {
    ...client,
    status: client.status || 'particulier',
    created_at: client.created_at || new Date().toISOString(),
    updated_at: client.updated_at || new Date().toISOString()
  };
}

/**
 * Safely handle arrays that could be SelectQueryError
 */
export function safeArray<T>(items: T[] | SelectQueryError): T[] {
  if (isSelectQueryError(items)) {
    return [];
  }
  return items || [];
}

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

/**
 * Safely handle invoice properties
 */
export function safeInvoice(invoice: any): {
  id: string;
  payment_status: string;
  paid_amount: number;
  remaining_amount: number;
} {
  if (isSelectQueryError(invoice)) {
    return {
      id: '',
      payment_status: 'pending',
      paid_amount: 0,
      remaining_amount: 0
    };
  }
  return invoice || { id: '', payment_status: 'pending', paid_amount: 0, remaining_amount: 0 };
}

/**
 * Safely handle bank account properties
 */
export function safeBankAccount(account: any): BankAccount {
  if (isSelectQueryError(account)) {
    return {
      id: '',
      name: 'Compte inconnu',
      account_number: '',
      current_balance: 0
    };
  }
  return account || { 
    id: '', 
    name: 'Compte inconnu', 
    account_number: '', 
    current_balance: 0
  };
}

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

/**
 * Cast with type checking to fix Transfer typings
 */
export function castToTransfers(data: any[]): any[] {
  return (data || []).map(item => ({
    ...item,
    source_warehouse: safeWarehouse(item.source_warehouse),
    destination_warehouse: safeWarehouse(item.destination_warehouse),
    source_pos: safePOSLocation(item.source_pos),
    destination_pos: safePOSLocation(item.destination_pos),
    items: safeArray(item.items)
  }));
}

/**
 * Safely fetch from a table that might not exist yet in the database schema 
 * but is used in the application code
 */
export async function safeFetchFromTable<T>(
  tableName: string,
  queryBuilder: (query: any) => any = q => q,
  fallbackData: T[] = [] as T[],
  errorMessage: string = `Erreur lors de la requête à ${tableName}`
): Promise<T[]> {
  return db.query(tableName, queryBuilder, fallbackData);
}

/**
 * Safely get a record by ID from a table that might not exist
 */
export async function safeFetchRecordById<T>(
  tableName: string,
  id: string,
  queryBuilder: (query: any) => any = q => q,
  fallbackData: T | null = null,
  errorMessage: string = `Erreur lors de la requête à ${tableName}`
): Promise<T | null> {
  try {
    // Use the database adapter to handle this query
    const result = await db.query(
      tableName,
      q => queryBuilder(q.select('*').eq('id', id)),
      []
    );
    
    return (Array.isArray(result) && result.length > 0) ? result[0] as T : fallbackData;
  } catch (err) {
    console.error(`Exception querying ${tableName} record:`, err);
    if (process.env.NODE_ENV !== 'production') {
      toast.error(errorMessage);
    }
    return fallbackData;
  }
}
