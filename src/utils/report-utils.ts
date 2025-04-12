
import { isSelectQueryError } from "./type-utils";

/**
 * Safely access nested properties when dealing with possibly null or SelectQueryError objects
 */
export function safeAccess<T>(obj: any, defaultValue: T): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }
  return obj as T;
}

/**
 * Safely map over an array that might be a SelectQueryError
 */
export function safeMap<T, R>(arr: any, mapFn: (item: T, index: number) => R, defaultValue: R[] = []): R[] {
  if (!arr || isSelectQueryError(arr) || !Array.isArray(arr)) {
    return defaultValue;
  }
  return arr.map(mapFn);
}

/**
 * Safely get property from an object that might be a SelectQueryError
 */
export function safeGet<T>(obj: any, property: string, defaultValue: T): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }
  return obj[property] !== undefined ? obj[property] : defaultValue;
}
