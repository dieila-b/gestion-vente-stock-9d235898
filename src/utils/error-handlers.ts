
import { isSelectQueryError } from "@/utils/supabase-helpers";
import { DEFAULT_CATEGORY, DEFAULT_CLIENT, DEFAULT_PRODUCT, DEFAULT_SUPPLIER, DEFAULT_WAREHOUSE, DEFAULT_POS_LOCATION } from "@/types/supabase-extensions";

/**
 * Safely handle SelectQueryError by providing a default value
 * @param value The value that might be a SelectQueryError
 * @param defaultValue The default value to return if value is a SelectQueryError
 * @returns The original value or the default value if it's a SelectQueryError
 */
export function safelyUnwrapOrDefault<T>(value: any, defaultValue: T): T {
  if (isSelectQueryError(value)) {
    return defaultValue;
  }
  return value || defaultValue;
}

/**
 * Safely handle a property from an object that might contain SelectQueryErrors
 * @param obj The object that might have SelectQueryError properties
 * @param propName The property name to access
 * @param defaultValue The default value to return if the property is a SelectQueryError
 * @returns The property value or the default value
 */
export function safelyGetProperty<T>(obj: any, propName: string, defaultValue: T): T {
  if (!obj) return defaultValue;
  
  const propValue = obj[propName];
  return safelyUnwrapOrDefault(propValue, defaultValue);
}

/**
 * Safely handle array operations on values that might be SelectQueryErrors
 * @param value The value that might be a SelectQueryError or array
 * @param operation The operation to apply if value is a valid array
 * @param defaultValue The default value to return if value is a SelectQueryError
 * @returns The result of the operation or the default value
 */
export function safelyHandleArray<T, R>(
  value: any,
  operation: (arr: T[]) => R,
  defaultValue: R
): R {
  if (isSelectQueryError(value) || !Array.isArray(value)) {
    return defaultValue;
  }
  return operation(value as T[]);
}

/**
 * Creates an empty array if the value is a SelectQueryError or undefined
 */
export function safelyGetArray<T>(value: any): T[] {
  if (isSelectQueryError(value) || !Array.isArray(value)) {
    return [];
  }
  return value as T[];
}

/**
 * Type guard to check if a value is not undefined or null
 * @param value The value to check
 * @returns Whether the value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Get a safe Category object from a potentially erroneous response
 */
export function getSafeCategory(category: any) {
  return safelyUnwrapOrDefault(category, DEFAULT_CATEGORY);
}

/**
 * Get a safe Client object from a potentially erroneous response
 */
export function getSafeClient(client: any) {
  return safelyUnwrapOrDefault(client, DEFAULT_CLIENT);
}

/**
 * Get a safe Supplier object from a potentially erroneous response
 */
export function getSafeSupplier(supplier: any) {
  return safelyUnwrapOrDefault(supplier, DEFAULT_SUPPLIER);
}

/**
 * Get a safe Product object from a potentially erroneous response
 */
export function getSafeProduct(product: any) {
  return safelyUnwrapOrDefault(product, DEFAULT_PRODUCT);
}

/**
 * Get a safe Warehouse object from a potentially erroneous response
 */
export function getSafeWarehouse(warehouse: any) {
  return safelyUnwrapOrDefault(warehouse, DEFAULT_WAREHOUSE);
}

/**
 * Get a safe POSLocation object from a potentially erroneous response
 */
export function getSafePOSLocation(location: any) {
  return safelyUnwrapOrDefault(location, DEFAULT_POS_LOCATION);
}

/**
 * Map an array safely, handling cases where it might be a SelectQueryError
 */
export function safeMap<T, R>(items: any, mapFn: (item: T) => R): R[] {
  return safelyHandleArray(items, (arr) => arr.map(mapFn), []);
}

/**
 * Safely get a numeric value, or return a default if it's invalid
 */
export function getSafeNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  return defaultValue;
}

/**
 * Safely get a string value, or return a default if it's invalid
 */
export function getSafeString(value: unknown, defaultValue: string = ""): string {
  if (typeof value === 'string') {
    return value;
  }
  return defaultValue;
}
