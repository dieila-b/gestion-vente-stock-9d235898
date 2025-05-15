
import type { PostgrestError } from "@supabase/supabase-js";
import { SelectQueryError, isSelectQueryError } from "./select-query-helper";

// Re-export the isSelectQueryError function
export { isSelectQueryError } from "./select-query-helper";

export function safeProduct(product: any) {
  // Guard against product being undefined or null
  if (!product) {
    return { 
      id: '',
      name: 'Produit inconnu',
      reference: '',
      category: '',
      price: 0
    };
  }
  
  // Check if product is an error object from Supabase
  if (isSelectQueryError(product)) {
    return { 
      id: '',
      name: 'Erreur de chargement',
      reference: '',
      category: '',
      price: 0
    };
  }
  
  // Return the product if it's valid
  return product;
}

export function safePOSLocation(location: any) {
  if (!location) {
    return { 
      id: '',
      name: 'Emplacement inconnu'
    };
  }
  
  if (isSelectQueryError(location)) {
    return { 
      id: '',
      name: 'Erreur de chargement'
    };
  }
  
  return location;
}

// Add the missing utility functions
export function safeSupplier(supplier: any) {
  if (!supplier || isSelectQueryError(supplier)) {
    return {
      id: '',
      name: 'Fournisseur inconnu',
      email: '',
      phone: ''
    };
  }
  return supplier;
}

export function safeWarehouse(warehouse: any) {
  if (!warehouse || isSelectQueryError(warehouse)) {
    return {
      id: '',
      name: 'Entrepôt inconnu'
    };
  }
  return warehouse;
}

export function safeInvoice(invoice: any) {
  if (!invoice || isSelectQueryError(invoice)) {
    return {
      id: '',
      invoice_number: 'Inconnu',
      client_id: '',
      total_amount: 0,
      paid_amount: 0,
      remaining_amount: 0,
      payment_status: 'pending'
    };
  }
  return invoice;
}

export function safeGet(obj: any, key: string, defaultValue: any = null) {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }
  return obj[key] ?? defaultValue;
}

export function castToTransfers(data: any[]) {
  if (!Array.isArray(data)) return [];
  
  return data.map(item => ({
    ...item,
    source_warehouse: safeWarehouse(item.source_warehouse),
    destination_warehouse: safeWarehouse(item.destination_warehouse),
    source_pos: safePOSLocation(item.source_pos),
    destination_pos: safePOSLocation(item.destination_pos),
    items: Array.isArray(item.items) ? item.items : []
  }));
}

// Safe query functions from data-safe/safe-query.ts
export async function safeFetchFromTable(
  tableName: string,
  queryBuilder: (query: any) => any = q => q,
  fallbackData: any[] = [],
  errorMessage?: string
): Promise<any[]> {
  try {
    // Import the db utility dynamically to avoid circular dependencies
    const { db } = await import('../utils/db-core');
    return await db.query(tableName, queryBuilder, fallbackData);
  } catch (err) {
    console.error(`Unexpected error in safeFetchFromTable (${tableName}):`, err);
    return fallbackData;
  }
}

export async function safeFetchRecordById(
  tableName: string,
  id: string,
  queryBuilder: (query: any) => any = q => q,
  fallbackData: any = null,
  errorMessage?: string
): Promise<any> {
  if (!id) {
    console.warn(`Attempted to fetch record with empty ID from ${tableName}`);
    return fallbackData;
  }

  try {
    // Import the db utility dynamically to avoid circular dependencies
    const { db } = await import('../utils/db-core');
    
    // Create a query that selects by ID and applies any additional filters
    const baseQuery = (q: any) => q.select('*').eq('id', id);
    const fullQuery = (q: any) => queryBuilder(baseQuery(q));
    
    // Use the database adapter to handle this query
    const result = await db.query(tableName, fullQuery, []);
    
    // Return the first result or fallback
    return (Array.isArray(result) && result.length > 0) 
      ? result[0]
      : fallbackData;
  } catch (err) {
    console.error(`Exception querying ${tableName} record by ID:`, err);
    return fallbackData;
  }
}
