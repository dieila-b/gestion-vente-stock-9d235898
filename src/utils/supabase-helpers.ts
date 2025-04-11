/**
 * Unwraps a potentially nested object from Supabase query responses.
 * Supabase sometimes returns nested objects as arrays with a single element when using joins.
 * 
 * @param obj The potentially nested object or array from a Supabase query
 * @returns The unwrapped object or null if not found
 */
export function unwrapSupabaseObject<T>(obj: T | T[] | null | undefined): T | null {
  if (!obj) return null;
  
  // If it's an array with one or more elements, return the first element
  if (Array.isArray(obj) && obj.length > 0) {
    return obj[0];
  }
  
  // Otherwise return the object itself
  return obj as T;
}

/**
 * Check if an object is a SelectQueryError from Supabase
 */
export function isSelectQueryError(obj: any): boolean {
  return obj && typeof obj === 'object' && 'error' in obj && obj.error === true;
}

/**
 * Safely access a property from an object that might be a SelectQueryError
 */
export function safeGet<T>(obj: any, defaultValue: T): T {
  if (isSelectQueryError(obj)) return defaultValue;
  return obj as T;
}

/**
 * Safely access a property from an object that might be a SelectQueryError
 */
export function safeGetProperty<T>(obj: any, property: string, defaultValue: T): T {
  if (isSelectQueryError(obj) || !obj || typeof obj !== 'object' || !(property in obj)) {
    return defaultValue;
  }
  return obj[property] as T;
}

/**
 * Maps properties from a nested Supabase response to a flattened object.
 * Handles the case where Supabase returns some related objects as arrays.
 * 
 * @param data The response data from Supabase with nested objects
 * @param mappingFn A function that maps the data to the desired format
 * @returns An array of mapped objects
 */
export function mapSupabaseData<T, R>(
  data: T[] | null, 
  mappingFn: (item: T) => R
): R[] {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map(mappingFn);
}

/**
 * Recursive function to transform a nested Supabase response where foreign key relations
 * are returned as arrays into a more usable format with direct object references.
 * 
 * @param obj The object to transform
 * @returns A transformed object with unwrapped nested objects
 */
export function transformSupabaseResponse<T extends Record<string, any>>(obj: T): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Check if it's a SelectQueryError
  if (isSelectQueryError(obj)) {
    return null;
  }
  
  // Create a new object to store the result
  const result: Record<string, any> = {};
  
  // Iterate through all properties of the object
  for (const [key, value] of Object.entries(obj)) {
    // If the value is an array with a single element and contains objects (relation)
    if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'object') {
      // Recursively transform the single element of the array
      result[key] = transformSupabaseResponse(value[0]);
    } 
    // If it's an array with multiple elements
    else if (Array.isArray(value) && value.length > 0) {
      // Check if all items are potentially SelectQueryErrors
      if (isSelectQueryError(value[0])) {
        result[key] = [];
      } else {
        // Transform each element of the array
        result[key] = value.map(item => 
          typeof item === 'object' ? transformSupabaseResponse(item) : item
        );
      }
    } 
    // If it's an object (but not an array or null)
    else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Check if it's a SelectQueryError
      if (isSelectQueryError(value)) {
        result[key] = null;
      } else {
        // Recursively transform the object
        result[key] = transformSupabaseResponse(value);
      }
    } 
    // Otherwise, keep the value as is
    else {
      result[key] = value;
    }
  }
  
  return result as T;
}

/**
 * Helper to safely access a property that might be an array in Supabase response
 * 
 * @param obj The object or array containing the property
 * @param key The property name to access
 * @returns The property value
 */
export function getNestedProperty<T>(obj: any, key: string): T | null {
  if (!obj) return null;
  
  const value = obj[key];
  return unwrapSupabaseObject<T>(value);
}

/**
 * Safely access array methods on a response that might be a SelectQueryError or a valid array
 */
export function safeArrayOperation<T, R>(
  array: any,
  operation: (arr: T[]) => R,
  defaultValue: R
): R {
  if (!array) return defaultValue;
  if (isSelectQueryError(array)) return defaultValue;
  if (!Array.isArray(array)) return defaultValue;
  
  return operation(array as T[]);
}

/**
 * Safely cast a Supabase response to a specific type, handling SelectQueryErrors
 */
export function safeTypeConversion<T>(value: any, defaultValue: T): T {
  if (isSelectQueryError(value)) return defaultValue;
  if (value === null || value === undefined) return defaultValue;
  return value as T;
}
