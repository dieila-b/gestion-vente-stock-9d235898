/**
 * Unwraps a potentially nested object from Supabase query responses.
 * Supabase sometimes returns nested objects as arrays with a single element when using joins.
 * 
 * @param obj The potentially nested object or array from a Supabase query
 * @returns The unwrapped object or null if not found
 */
export function unwrapSupabaseObject<T>(obj: T | T[] | null | undefined): T | null {
  if (!obj) return null;
  
  // If it's an array with one item, return that item
  if (Array.isArray(obj) && obj.length > 0) {
    return obj[0];
  }
  
  // Otherwise return the object itself
  return obj as T;
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
