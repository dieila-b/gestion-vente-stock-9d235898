
import { toast } from "sonner";
import { db } from "../db-core";

/**
 * Safely fetch from a table with improved error handling
 * @param tableName The table to query
 * @param queryBuilder Function to build the query
 * @param fallbackData Data to return if the query fails
 * @param errorMessage Optional custom error message
 */
export async function safeFetchFromTable<T>(
  tableName: string,
  queryBuilder: (query: any) => any = q => q,
  fallbackData: T[] = [] as T[],
  errorMessage?: string
): Promise<T[]> {
  try {
    // Use the db adapter which already handles errors internally
    return await db.query(tableName, queryBuilder, fallbackData);
  } catch (err) {
    // This is a fallback for unexpected errors not caught by db.query
    console.error(`Unexpected error in safeFetchFromTable (${tableName}):`, err);
    
    // Only show toast in non-production environments to avoid flooding users with errors
    if (process.env.NODE_ENV !== 'production' && errorMessage) {
      toast.error(errorMessage);
    }
    
    return fallbackData;
  }
}

/**
 * Safely get a record by ID with improved error handling and type safety
 * @param tableName The table to query
 * @param id The ID to look up
 * @param queryBuilder Optional function to customize the query
 * @param fallbackData Data to return if the query fails
 * @param errorMessage Optional custom error message
 */
export async function safeFetchRecordById<T>(
  tableName: string,
  id: string,
  queryBuilder: (query: any) => any = q => q,
  fallbackData: T | null = null,
  errorMessage?: string
): Promise<T | null> {
  if (!id) {
    console.warn(`Attempted to fetch record with empty ID from ${tableName}`);
    return fallbackData;
  }

  try {
    // Create a query that selects by ID and applies any additional filters
    const baseQuery = (q: any) => q.select('*').eq('id', id);
    const fullQuery = (q: any) => queryBuilder(baseQuery(q));
    
    // Use the database adapter to handle this query
    const result = await db.query(tableName, fullQuery, []);
    
    // Return the first result or fallback
    return (Array.isArray(result) && result.length > 0) 
      ? result[0] as T 
      : fallbackData;
  } catch (err) {
    console.error(`Exception querying ${tableName} record by ID:`, err);
    
    // Only show toast in non-production environments
    if (process.env.NODE_ENV !== 'production' && errorMessage) {
      toast.error(errorMessage);
    }
    
    return fallbackData;
  }
}

/**
 * Safely fetch records with a specific condition
 * @param tableName The table to query
 * @param column The column to filter on
 * @param value The value to match
 * @param fallbackData Data to return if the query fails
 */
export async function safeFetchRecordsByField<T>(
  tableName: string,
  column: string,
  value: any,
  fallbackData: T[] = [] as T[]
): Promise<T[]> {
  try {
    return await db.query(
      tableName,
      q => q.select('*').eq(column, value),
      fallbackData
    );
  } catch (err) {
    console.error(`Error fetching records from ${tableName} where ${column} = ${value}:`, err);
    return fallbackData;
  }
}

/**
 * Safely count records in a table
 * @param tableName The table to query
 * @param queryBuilder Function to build the query
 */
export async function safeCountRecords(
  tableName: string,
  queryBuilder: (query: any) => any = q => q
): Promise<number> {
  try {
    const result = await db.query(
      tableName,
      q => queryBuilder(q.select('count', { count: 'exact' })),
      [{ count: 0 }]
    );
    
    return result[0]?.count || 0;
  } catch (err) {
    console.error(`Error counting records in ${tableName}:`, err);
    return 0;
  }
}
