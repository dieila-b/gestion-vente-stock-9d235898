
import { isSelectQueryError } from "@/utils/supabase-helpers";

/**
 * Utility to safely access properties on potentially errored data
 * @param data The data that might be a SelectQueryError
 * @param defaultValue Default value to return if data is an error
 */
export function safelyGetData<T>(data: any, defaultValue: T): T {
  if (isSelectQueryError(data)) {
    return defaultValue;
  }
  return data || defaultValue;
}

/**
 * Safely map over data that might be a SelectQueryError
 * @param data The data that might be a SelectQueryError
 * @param mapFn Map function to apply if data is valid
 * @param defaultValue Default value to return if data is an error
 */
export function safelyMapData<T, R>(
  data: any,
  mapFn: (item: T) => R,
  defaultValue: R[] = []
): R[] {
  if (isSelectQueryError(data) || !Array.isArray(data)) {
    return defaultValue;
  }
  return data.map(mapFn);
}

/**
 * Cast potentially errored data to a type, with fallback
 * @param data Data to cast
 * @param defaultObj Default object to use if data is an error
 */
export function castOrDefault<T>(data: any, defaultObj: T): T {
  if (isSelectQueryError(data)) {
    return defaultObj;
  }
  return data as T || defaultObj;
}

/**
 * Convert an object with potential SelectQueryErrors to a safe object
 * @param obj Object with potential SelectQueryErrors
 * @param defaultValues Default values for different keys
 */
export function safeObject<T extends Record<string, any>>(
  obj: any, 
  defaultValues: Partial<T>
): T {
  if (!obj || typeof obj !== 'object') {
    return defaultValues as T;
  }
  
  const result = { ...defaultValues } as T;
  
  for (const key in obj) {
    if (isSelectQueryError(obj[key])) {
      result[key] = defaultValues[key as keyof T] as any;
    } else {
      result[key] = obj[key];
    }
  }
  
  return result;
}
