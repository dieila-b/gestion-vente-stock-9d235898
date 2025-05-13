
import { Supplier } from "@/types/supplier";

/**
 * Type for SelectQueryError to match what Supabase returns when queries fail
 */
export interface SelectQueryError<T = string> {
  error: true;
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Type guard to check if an object is a Supabase SelectQueryError
 */
export function isSelectQueryError(obj: any): obj is SelectQueryError {
  return obj && typeof obj === 'object' && 'error' in obj && obj.error === true;
}

/**
 * Safely get a value from an object that might be null or undefined
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K, fallback: T[K]): T[K] {
  if (!obj) return fallback;
  return obj[key] !== undefined ? obj[key] : fallback;
}

/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Safely get supplier information, handling SelectQueryError
 */
export function safeSupplier(supplier: Supplier | SelectQueryError | null | undefined): Supplier {
  if (!supplier) {
    return { id: '', name: 'Fournisseur inconnu', phone: '', email: '' } as Supplier;
  }
  
  if (isSelectQueryError(supplier)) {
    return { id: '', name: 'Erreur fournisseur', phone: '', email: '' } as Supplier;
  }
  
  // Ensure required properties are present
  return {
    id: supplier.id || '',
    name: supplier.name || 'Fournisseur sans nom',
    phone: supplier.phone || '',
    email: supplier.email || ''
  } as Supplier;
}
