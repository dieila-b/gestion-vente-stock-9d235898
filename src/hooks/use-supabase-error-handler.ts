
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { isSelectQueryError } from "@/utils/supabase-helpers";

/**
 * A hook for handling Supabase query errors in a consistent way
 */
export function useSupabaseErrorHandler() {
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  /**
   * Safely gets a property from an object that might be a SelectQueryError
   */
  const getSafe = useCallback((obj: any, property: string, defaultValue: any) => {
    if (!obj || isSelectQueryError(obj)) return defaultValue;
    return obj[property] ?? defaultValue;
  }, []);

  /**
   * Safely maps an array that might be a SelectQueryError
   */
  const safeMap = useCallback(<T, R>(array: any, mapFn: (item: T) => R, defaultValue: R[] = []): R[] => {
    if (!array || isSelectQueryError(array)) return defaultValue;
    if (!Array.isArray(array)) return defaultValue;
    
    return array.map(mapFn);
  }, []);

  /**
   * Safely spread an object that might be a SelectQueryError
   */
  const safeSpread = useCallback(<T extends object>(obj: any, defaultObj: T): T => {
    if (!obj || isSelectQueryError(obj)) return defaultObj;
    if (typeof obj !== 'object') return defaultObj;
    
    return { ...defaultObj, ...obj };
  }, []);

  /**
   * Logs a Supabase error and shows a toast
   */
  const handleError = useCallback((error: any, key: string, message: string = "Une erreur est survenue") => {
    console.error(`Supabase error (${key}):`, error);
    toast.error(message);
    setErrors(prev => ({ ...prev, [key]: true }));
    return null;
  }, []);

  /**
   * Handles a condition where a required property is a SelectQueryError
   */
  const handleErrorCondition = useCallback((condition: boolean, key: string, message: string = "Données invalides") => {
    if (condition) {
      toast.error(message);
      setErrors(prev => ({ ...prev, [key]: true }));
      return true;
    }
    return false;
  }, []);

  return {
    errors,
    getSafe,
    safeMap,
    safeSpread,
    handleError,
    handleErrorCondition,
    isError: (key: string) => errors[key] === true,
    clearError: (key: string) => setErrors(prev => ({ ...prev, [key]: false })),
  };
}
