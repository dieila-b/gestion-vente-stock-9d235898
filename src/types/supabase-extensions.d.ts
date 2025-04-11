
import { PostgrestQueryBuilder } from "@supabase/supabase-js";

/**
 * This file extends the Supabase type definitions with custom types for error handling
 */

/**
 * A type representing a Supabase SelectQueryError
 * This is returned when a join between tables fails because of a relation issue
 */
export interface SelectQueryError<T = string> {
  error: true;
  message: T;
}

/**
 * Type guard to check if a value is a SelectQueryError
 */
export function isSelectQueryError(obj: any): obj is SelectQueryError {
  return obj && typeof obj === 'object' && 'error' in obj && obj.error === true;
}

/**
 * A utility type that allows a field to be either its expected type, a SelectQueryError, or null/undefined
 */
export type MaybeQueryError<T> = T | SelectQueryError | null | undefined;

/**
 * A utility type for optional fields that might be query errors
 */
export type OptionalQueryError<T> = T | SelectQueryError | null | undefined;

/**
 * A utility type for handling arrays that might be query errors
 */
export type ArrayOrQueryError<T> = T[] | SelectQueryError | null | undefined;

/**
 * Type representing a safe table row that handles potential query errors
 */
export type SafeRow<T> = {
  [K in keyof T]: T[K] extends object 
    ? MaybeQueryError<T[K]> 
    : T[K] extends Array<infer U> 
      ? ArrayOrQueryError<U> 
      : T[K];
};

/**
 * Custom type for PostgrestQueryBuilder with explicit typing
 */
export type SafePostgrestQueryBuilder<T> = PostgrestQueryBuilder<any, any, T>;

/**
 * Default fallback object for Category
 */
export const DEFAULT_CATEGORY = {
  id: "unknown",
  name: "Unknown Category",
  type: "unknown"
};

/**
 * Default fallback object for Client
 */
export const DEFAULT_CLIENT = {
  company_name: "Unknown Company",
  contact_name: "Unknown Contact",
  id: "unknown"
};

/**
 * Default fallback object for Supplier
 */
export const DEFAULT_SUPPLIER = {
  name: "Unknown Supplier",
  phone: "",
  email: ""
};

/**
 * Default fallback object for Warehouse
 */
export const DEFAULT_WAREHOUSE = {
  name: "Unknown Warehouse",
  id: "unknown"
};

/**
 * Default fallback object for POSLocation
 */
export const DEFAULT_POS_LOCATION = {
  name: "Unknown Location",
  id: "unknown"
};

/**
 * Default fallback object for Product
 */
export const DEFAULT_PRODUCT = {
  name: "Unknown Product",
  reference: "",
  category: "Unknown",
  id: "unknown"
};
