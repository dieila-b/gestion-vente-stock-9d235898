
import { SelectQueryError } from "@/types/db-adapter";

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
 * Safely handle arrays that could be SelectQueryError
 */
export function safeArray<T>(items: T[] | SelectQueryError): T[] {
  if (isSelectQueryError(items)) {
    return [];
  }
  return items || [];
}
