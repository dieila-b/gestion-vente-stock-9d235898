
import { isSelectQueryError } from './supabase-helpers';

/**
 * Safely unwrap a supplier object that might be a SelectQueryError
 * @param supplier The supplier object or error
 * @returns A safe supplier object
 */
export function safeSupplier(supplier: any) {
  if (isSelectQueryError(supplier)) {
    return {
      id: "unknown",
      name: "Unknown Supplier",
      phone: "",
      email: "",
      // Add other default fields as needed
    };
  }
  return supplier;
}

/**
 * Safely cast an object to a specific type with default values
 * @param obj The object to cast
 * @param defaultValue Default values to use if obj is an error
 * @returns The object cast to the desired type
 */
export function safeCast<T>(obj: any, defaultValue: T): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }
  return obj as T;
}

/**
 * Safely access a property that might be a SelectQueryError
 * @param obj The object to access
 * @param key The property key
 * @param defaultValue The default value to use if obj[key] is an error
 * @returns The property value or default
 */
export function safeProperty<T>(obj: any, key: string, defaultValue: T): T {
  if (!obj || isSelectQueryError(obj) || !obj[key] || isSelectQueryError(obj[key])) {
    return defaultValue;
  }
  return obj[key] as T;
}

/**
 * Safely map an array that might be a SelectQueryError
 * @param array The array to map
 * @param mapFn The mapping function
 * @returns The mapped array or empty array if input is an error
 */
export function safeMap<T, R>(array: any, mapFn: (item: T) => R): R[] {
  if (!array || isSelectQueryError(array) || !Array.isArray(array)) {
    return [];
  }
  return array.map(mapFn);
}

/**
 * Safely get a default object if the input is a SelectQueryError
 * @param obj The input object
 * @param defaultObj The default object
 * @returns The input object or default
 */
export function safeObject<T>(obj: any, defaultObj: T): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultObj;
  }
  return obj as T;
}
