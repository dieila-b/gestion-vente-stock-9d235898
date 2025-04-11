
import { unwrapSupabaseObject } from "@/utils/supabase-helpers";

/**
 * A hook that provides functions for formatting Supabase responses.
 * Helps handle nested objects and arrays that Supabase returns.
 */
export function useSupabaseFormatter() {
  /**
   * Safely accesses a nested property from a potentially nested Supabase response.
   * Handles cases where the property might be an array or a direct object.
   */
  function getNestedProperty<T>(obj: any, key: string): T | null {
    if (!obj) return null;
    
    const value = obj[key];
    return unwrapSupabaseObject<T>(value);
  }

  /**
   * Safely gets a property value from an object that might be nested as an array.
   * This is useful for accessing properties from joined tables in Supabase responses.
   */
  function getPropertyValue<T>(obj: any, key: string, nestedKey?: string): T | null {
    const unwrappedObj = unwrapSupabaseObject(obj);
    if (!unwrappedObj) return null;
    
    if (nestedKey && typeof unwrappedObj === 'object') {
      const nestedObj = unwrapSupabaseObject(unwrappedObj[key]);
      return nestedObj ? (nestedObj[nestedKey] as T) : null;
    }
    
    return unwrappedObj[key] as T;
  }
  
  return {
    getNestedProperty,
    getPropertyValue,
    unwrapSupabaseObject
  };
}
