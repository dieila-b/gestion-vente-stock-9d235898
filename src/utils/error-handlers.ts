
import { isSelectQueryError } from "@/utils/supabase-helpers";

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
 * Type guard to check if a value is not undefined or null
 * @param value The value to check
 * @returns Whether the value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
