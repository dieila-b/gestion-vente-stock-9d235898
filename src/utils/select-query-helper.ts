
import type { PostgrestError } from "@supabase/supabase-js";

// Define a type to represent the special error object returned by Supabase
// when a foreign key reference fails in a select query
export interface SelectQueryError {
  code: string;
  details: string;
  hint: string;
  message: string;
}

/**
 * Check if the value is a SelectQueryError from Supabase
 */
export function isSelectQueryError(value: any): value is SelectQueryError {
  if (!value || typeof value !== 'object') return false;
  
  // Check for error properties that indicate a select query error object
  return (
    ('code' in value || 'message' in value || 'details' in value) &&
    (typeof value.code === 'string' || typeof value.message === 'string')
  );
}

/**
 * Type guard to check if a value is a PostgrestError
 */
export function isPostgrestError(value: any): value is PostgrestError {
  return (
    value !== null && 
    typeof value === 'object' && 
    'code' in value && 
    'message' in value &&
    'details' in value &&
    'hint' in value
  );
}
