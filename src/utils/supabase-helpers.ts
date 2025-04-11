/**
 * Utility functions for handling Supabase responses, errors, and data transformation
 */

// Type for SelectQueryError
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
 * Safely unwrap an object from a Supabase response
 * Handles the case where the response might be a SelectQueryError
 */
export function unwrapSupabaseObject<T>(obj: any): T | null {
  // If it's a SelectQueryError or null/undefined, return null
  if (!obj || isSelectQueryError(obj)) {
    return null;
  }

  // If it's an array with one element (common in Supabase joins)
  if (Array.isArray(obj) && obj.length === 1) {
    return obj[0] as T;
  }

  // Otherwise return the object itself
  return obj as T;
}

/**
 * Safely get a property from an object that might be a SelectQueryError
 */
export function safeGetProperty<T>(obj: any, prop: string, defaultValue: T): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }

  // Handle array case (common in Supabase joins)
  if (Array.isArray(obj) && obj.length === 1) {
    const item = obj[0];
    return (item && item[prop] !== undefined && item[prop] !== null) 
      ? item[prop] 
      : defaultValue;
  }

  return (obj[prop] !== undefined && obj[prop] !== null) ? obj[prop] : defaultValue;
}

/**
 * Safely map over an array that might be a SelectQueryError
 */
export function safeMap<T, R>(
  array: any,
  mapFn: (item: T, index: number) => R,
  defaultValue: R[] = []
): R[] {
  if (!array || isSelectQueryError(array)) {
    return defaultValue;
  }

  if (!Array.isArray(array)) {
    return defaultValue;
  }

  return array.map(mapFn);
}

/**
 * Safely iterate over an array that might be a SelectQueryError
 */
export function safeForEach<T>(
  array: any,
  forEachFn: (item: T, index: number) => void
): void {
  if (!array || isSelectQueryError(array) || !Array.isArray(array)) {
    return;
  }

  array.forEach(forEachFn);
}

/**
 * Safely get a default object when the original might be a SelectQueryError
 */
export function safeGetObject<T extends object>(obj: any, defaultObj: T): T {
  if (isSelectQueryError(obj) || !obj) return defaultObj;
  if (typeof obj !== 'object') return defaultObj;
  
  return { ...defaultObj, ...obj } as T;
}

/**
 * Safely get a nested property from an object that might be a SelectQueryError
 */
export function safeGetNestedProperty<T>(
  obj: any,
  path: string[],
  defaultValue: T
): T {
  if (!obj || isSelectQueryError(obj)) {
    return defaultValue;
  }

  let current = obj;
  for (const key of path) {
    if (!current || typeof current !== 'object' || isSelectQueryError(current)) {
      return defaultValue;
    }
    current = current[key];
  }

  return (current !== undefined && current !== null) ? current as T : defaultValue;
}

/**
 * Safely cast any value to a specific type, providing a default if it's a SelectQueryError
 */
export function safeCast<T>(value: any, defaultValue: T): T {
  if (isSelectQueryError(value) || value === undefined || value === null) {
    return defaultValue;
  }
  return value as T;
}

/**
 * Safely handle arrays that might be SelectQueryErrors or undefined
 */
export function safeArray<T>(array: any, defaultValue: T[] = []): T[] {
  if (!array || isSelectQueryError(array)) {
    return defaultValue;
  }
  if (!Array.isArray(array)) {
    return defaultValue;
  }
  return array as T[];
}

/**
 * Transform a Supabase response to flatten nested objects
 */
export function transformSupabaseResponse<T extends Record<string, any>>(response: T): T {
  if (!response || typeof response !== 'object' || isSelectQueryError(response)) {
    return response;
  }

  const result: Record<string, any> = {};

  Object.entries(response).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length === 1) {
      result[key] = value[0];
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = transformSupabaseResponse(value);
    } else {
      result[key] = value;
    }
  });

  return result as T;
}

/**
 * Creates a type-safe data object by filtering out SelectQueryError instances
 */
export function createSafeObject<T extends Record<string, any>>(
  data: any,
  defaultValues: Partial<T> = {}
): T {
  if (!data || isSelectQueryError(data)) {
    return defaultValues as T;
  }

  const result: Record<string, any> = { ...defaultValues };

  Object.entries(data).forEach(([key, value]) => {
    if (isSelectQueryError(value)) {
      // If the value is a SelectQueryError, use the default if provided
      if (key in defaultValues) {
        result[key] = defaultValues[key];
      }
    } else if (Array.isArray(value)) {
      // If the value is an array, filter out any SelectQueryError instances
      result[key] = value.filter(item => !isSelectQueryError(item));
    } else {
      // Otherwise use the value from the data
      result[key] = value;
    }
  });

  return result as T;
}
