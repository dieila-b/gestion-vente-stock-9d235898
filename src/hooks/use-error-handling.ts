
import { isSelectQueryError } from "@/utils/supabase-helpers";

/**
 * Safely map through data that might be a SelectQueryError
 */
export function safelyMapData<T, R>(
  data: any,
  mapFn: (item: T) => R,
  defaultValue: R[] = []
): R[] {
  if (!data || isSelectQueryError(data) || !Array.isArray(data)) {
    return defaultValue;
  }
  return data.map(mapFn);
}

/**
 * Safely handle properties of an object that might be a SelectQueryError
 */
export function safelyGetProperty<T>(
  obj: any,
  propName: string,
  defaultValue: T
): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }
  return (obj[propName] !== undefined && obj[propName] !== null) 
    ? obj[propName] as T 
    : defaultValue;
}

/**
 * Safely unwrap an object that might be a SelectQueryError
 */
export function safelyUnwrapObject<T>(
  obj: any,
  defaultObj: T
): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultObj;
  }
  return obj as T;
}

/**
 * Safe property accessor for items that might be SelectQueryErrors
 */
export function safe<T>(
  item: any,
  defaultValue: T
): T {
  if (isSelectQueryError(item)) {
    return defaultValue;
  }
  return (item as T) || defaultValue;
}

/**
 * Type guard for checking if array is not a SelectQueryError
 */
export function isValidArray<T>(arr: any): arr is T[] {
  return Array.isArray(arr) && !isSelectQueryError(arr);
}

/**
 * Safe property access for potentially SelectQueryError objects
 */
export function safeProperty<P extends string, T>(
  obj: any,
  prop: P,
  defaultValue: T
): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }
  const value = obj[prop];
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value as T;
}

/**
 * Safe map operation that handles SelectQueryErrors
 */
export function safeMap<T, R>(
  arr: any,
  mapFn: (item: T) => R
): R[] {
  if (!arr || isSelectQueryError(arr) || !Array.isArray(arr)) {
    return [];
  }
  return arr.map(mapFn);
}

/**
 * Safely access an object cast to a specific type
 */
export function safeCast<T>(obj: any, defaultValue: T): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }
  return obj as T;
}

/**
 * Creates a default fallback object with all required properties
 */
export function createFallback<T extends object>(defaults: T): T {
  return { ...defaults };
}
