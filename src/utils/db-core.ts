
import { supabase } from "@/integrations/supabase/client";

/**
 * Core database utility with robust error handling
 */
export const db = {
  async query<T>(
    tableName: string,
    queryBuilder: (q: any) => any = q => q.select('*'),
    fallback: T[] = [] as T[]
  ): Promise<T[]> {
    try {
      console.log(`db.query: Querying table ${tableName}`);
      
      const queryResult = queryBuilder(supabase.from(tableName));
      const { data, error } = await queryResult;
      
      if (error) {
        console.error(`Database error for ${tableName}:`, error);
        return fallback;
      }
      
      console.log(`db.query: Successfully retrieved ${data?.length || 0} records from ${tableName}`);
      return data || fallback;
    } catch (err) {
      console.error(`Unexpected error querying ${tableName}:`, err);
      return fallback;
    }
  },

  async queryFirst<T>(
    tableName: string,
    queryBuilder: (q: any) => any,
    fallback: T | null = null
  ): Promise<T | null> {
    try {
      const queryResult = queryBuilder(supabase.from(tableName));
      const { data, error } = await queryResult.maybeSingle();
      
      if (error) {
        console.error(`Database error for single ${tableName}:`, error);
        return fallback;
      }
      
      return data || fallback;
    } catch (err) {
      console.error(`Unexpected error querying single ${tableName}:`, err);
      return fallback;
    }
  },

  async count(tableName: string, queryBuilder: (q: any) => any = q => q): Promise<number> {
    try {
      const queryResult = queryBuilder(supabase.from(tableName).select('*', { count: 'exact', head: true }));
      const { count, error } = await queryResult;
      
      if (error) {
        console.error(`Count error for ${tableName}:`, error);
        return 0;
      }
      
      return count || 0;
    } catch (err) {
      console.error(`Unexpected error counting ${tableName}:`, err);
      return 0;
    }
  }
};
