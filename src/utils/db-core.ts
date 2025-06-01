
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
  },

  async insert<T>(tableName: string, data: any): Promise<T | null> {
    try {
      console.log(`db.insert: Inserting into ${tableName}:`, data);
      
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
      
      if (error) {
        console.error(`Insert error for ${tableName}:`, error);
        return null;
      }
      
      console.log(`db.insert: Successfully inserted into ${tableName}:`, result);
      return result as T;
    } catch (err) {
      console.error(`Unexpected error inserting into ${tableName}:`, err);
      return null;
    }
  },

  async update<T>(
    tableName: string,
    data: any,
    matchColumn: string,
    matchValue: any
  ): Promise<T | null> {
    try {
      console.log(`db.update: Updating ${tableName} where ${matchColumn} = ${matchValue}:`, data);
      
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq(matchColumn, matchValue)
        .select()
        .single();
      
      if (error) {
        console.error(`Update error for ${tableName}:`, error);
        return null;
      }
      
      console.log(`db.update: Successfully updated ${tableName}:`, result);
      return result as T;
    } catch (err) {
      console.error(`Unexpected error updating ${tableName}:`, err);
      return null;
    }
  },

  async delete(tableName: string, matchColumn: string, matchValue: any): Promise<boolean> {
    try {
      console.log(`db.delete: Deleting from ${tableName} where ${matchColumn} = ${matchValue}`);
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(matchColumn, matchValue);
      
      if (error) {
        console.error(`Delete error for ${tableName}:`, error);
        return false;
      }
      
      console.log(`db.delete: Successfully deleted from ${tableName}`);
      return true;
    } catch (err) {
      console.error(`Unexpected error deleting from ${tableName}:`, err);
      return false;
    }
  }
};
