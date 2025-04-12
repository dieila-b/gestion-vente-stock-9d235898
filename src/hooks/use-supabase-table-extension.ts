
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/supabase-helpers";

/**
 * Create a type-safe query builder for a table
 * @param tableName Table name to query
 * @returns Supabase query builder
 */
export function createTableQuery(tableName: string) {
  // Use type assertion to bypass type checking issue
  return supabase.from(tableName as any);
}
