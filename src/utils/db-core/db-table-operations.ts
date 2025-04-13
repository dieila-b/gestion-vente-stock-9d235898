
import { supabase } from "@/integrations/supabase/client";
import { handleDbError, createErrorProxy } from "./db-error-handler";

/**
 * Creates a query builder for any table, handling type mismatches gracefully
 * 
 * @param tableName The name of the table to query
 * @returns A query builder for the specified table
 */
export function tableQuery(tableName: string) {
  try {
    // Use type assertion to bypass TypeScript's type checking
    // @ts-ignore - We're intentionally bypassing type checking here
    return supabase.from(tableName);
  } catch (error) {
    console.error(`Error accessing table ${tableName}:`, error);
    // Return a mock object that logs errors but doesn't throw
    return {
      select: () => createErrorProxy(`Table ${tableName} doesn't exist`),
      insert: () => createErrorProxy(`Table ${tableName} doesn't exist`),
      update: () => createErrorProxy(`Table ${tableName} doesn't exist`),
      delete: () => createErrorProxy(`Table ${tableName} doesn't exist`),
      upsert: () => createErrorProxy(`Table ${tableName} doesn't exist`),
      rpc: () => createErrorProxy(`RPC function doesn't exist`),
    };
  }
}

/**
 * Executes a query safely, handling errors and returning fallback data if needed
 * 
 * @param tableName The name of the table to query
 * @param queryFn Function that builds the query
 * @param fallbackData Data to return in case of error
 * @returns The query result or fallback data
 */
export async function query<T = any>(
  tableName: string,
  queryFn: (queryBuilder: any) => any,
  fallbackData: T[] = [] as unknown as T[]
): Promise<T[]> {
  try {
    const queryBuilder = tableQuery(tableName);
    const { data, error, count } = await queryFn(queryBuilder);
    
    if (error) {
      handleDbError('query', tableName, error);
      return fallbackData;
    }
    
    // Handle the special case where the query is a count query
    if (count !== undefined && (data === null || data.length === 0)) {
      return { count } as unknown as T[];
    }
    
    return data || fallbackData;
  } catch (err) {
    handleDbError('query', tableName, err);
    return fallbackData;
  }
}

/**
 * Executes an insert operation safely on any table
 * 
 * @param tableName The name of the table to insert into
 * @param data The data to insert
 * @returns The insert result or null in case of error
 */
export async function insert<T = any>(
  tableName: string, 
  data: any
): Promise<T | null> {
  try {
    const { data: result, error } = await tableQuery(tableName).insert(data).select();
    
    if (error) {
      handleDbError('insert', tableName, error);
      return null;
    }
    
    // Handle both array and single object responses
    if (Array.isArray(result) && result.length > 0) {
      return result[0] as unknown as T;
    }
    
    return result as unknown as T || null;
  } catch (err) {
    handleDbError('insert', tableName, err);
    return null;
  }
}

/**
 * Executes an update operation safely on any table
 * 
 * @param tableName The name of the table to update
 * @param data The data to update
 * @param matchColumn The column to match for the update
 * @param matchValue The value to match for the update
 * @returns The update result or null in case of error
 */
export async function update<T = any>(
  tableName: string, 
  data: any, 
  matchColumn: string, 
  matchValue: any
): Promise<T | null> {
  try {
    const { data: result, error } = await tableQuery(tableName)
      .update(data)
      .eq(matchColumn, matchValue)
      .select();
    
    if (error) {
      handleDbError('update', tableName, error);
      return null;
    }
    
    // Handle both array and single object responses
    if (Array.isArray(result) && result.length > 0) {
      return result[0] as unknown as T;
    }
    
    return result as unknown as T || null;
  } catch (err) {
    handleDbError('update', tableName, err);
    return null;
  }
}

/**
 * Executes a delete operation safely on any table
 * 
 * @param tableName The name of the table to delete from
 * @param matchColumn The column to match for the delete
 * @param matchValue The value to match for the delete
 * @returns True if successful, false otherwise
 */
export async function deleteRecord(
  tableName: string, 
  matchColumn: string, 
  matchValue: any
): Promise<boolean> {
  try {
    const { error } = await tableQuery(tableName)
      .delete()
      .eq(matchColumn, matchValue);
    
    if (error) {
      handleDbError('delete', tableName, error);
      return false;
    }
    
    return true;
  } catch (err) {
    handleDbError('delete', tableName, err);
    return false;
  }
}
