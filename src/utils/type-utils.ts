
import { SelectQueryError } from "@/types/db-adapter";
import { Supplier } from "@/types/supplier";

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
  if (!supplier || isSelectQueryError(supplier)) {
    return { id: '', name: 'Fournisseur inconnu' } as Supplier;
  }
  return supplier;
}
