
/**
 * Type for SelectQueryError to match what Supabase returns when queries fail
 */
export interface SelectQueryError<T = string> {
  error: true;
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}
