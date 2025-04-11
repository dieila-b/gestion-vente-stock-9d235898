
import { isSelectQueryError, safeGetProperty } from "@/utils/supabase-helpers";

/**
 * Hook for safely processing query responses that might contain SelectQueryErrors
 */
export function useSafeQueryProcessor() {
  /**
   * Safely process an array of items that might be a SelectQueryError
   */
  const processSafeArray = <T, R>(
    items: any,
    mapFn: (item: T) => R
  ): R[] => {
    if (!items) return [];
    if (isSelectQueryError(items)) return [];
    if (!Array.isArray(items)) return [];
    
    return items.map(mapFn);
  };
  
  /**
   * Safely get a property from an object that might be a SelectQueryError
   */
  const getSafeProperty = <T>(
    obj: any,
    propName: string,
    defaultValue: T
  ): T => {
    return safeGetProperty(obj, propName, defaultValue);
  };
  
  /**
   * Safely cast an array that might be a SelectQueryError to a different type
   */
  const castSafeArray = <T>(
    items: any
  ): T[] => {
    if (!items) return [];
    if (isSelectQueryError(items)) return [];
    if (!Array.isArray(items)) return [];
    
    return items as T[];
  };
  
  /**
   * Safely convert a query result to a formatted result
   */
  const formatQueryResult = <T>(
    result: any,
    formatter: (data: any) => T,
    defaultValue: T
  ): T => {
    if (!result) return defaultValue;
    if (isSelectQueryError(result)) return defaultValue;
    
    return formatter(result);
  };
  
  return {
    processSafeArray,
    getSafeProperty,
    castSafeArray,
    formatQueryResult,
  };
}
