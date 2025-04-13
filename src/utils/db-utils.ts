import { db } from "./db-core";
import { safeGet } from "./supabase-safe-query";

// A utility function to check if a table exists in the database
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    // Query the information_schema via our safe db adapter
    const result = await db.query(
      'pg_tables',
      query => query.select('tablename')
        .eq('schemaname', 'public')
        .eq('tablename', tableName)
    );
    
    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// A utility to create a table if it doesn't exist
export async function ensureTableExists(
  tableName: string,
  createTableSQL: string,
  notifyUser: boolean = false
): Promise<boolean> {
  const exists = await checkTableExists(tableName);
  
  if (!exists) {
    try {
      // We would use the raw SQL executor here, but that's only available in the Supabase dashboard or migrations
      console.warn(`Table ${tableName} doesn't exist. It should be created with SQL: ${createTableSQL}`);
      
      if (notifyUser) {
        // Notify the user that they should run a SQL migration to create the table
        console.warn(`Please create the ${tableName} table in your database.`);
      }
      
      return false;
    } catch (error) {
      console.error(`Error creating table ${tableName}:`, error);
      return false;
    }
  }
  
  return true;
}

// A utility to create a mock query result similar to what Supabase would return
export function createMockQueryResult<T>(data: T[]): { data: T[], error: null } {
  return {
    data,
    error: null
  };
}

// A utility to handle queries to tables that might not exist yet
export async function safeTableQuery<T>(
  tableName: string,
  queryBuilder: (query: any) => any,
  fallbackData: T[] = []
): Promise<{ data: T[], error: null | any }> {
  const exists = await checkTableExists(tableName);
  
  if (!exists) {
    console.warn(`Table ${tableName} doesn't exist. Returning fallback data.`);
    return createMockQueryResult(fallbackData);
  }
  
  try {
    // Use our db adapter instead of direct supabase calls
    const result = await db.query(tableName, queryBuilder, fallbackData);
    return {
      data: result,
      error: null
    };
  } catch (error) {
    console.error(`Error querying ${tableName}:`, error);
    return {
      data: fallbackData,
      error
    };
  }
}

// Get safe table data with type conversions
export async function getSafeTableData<T>(
  tableName: string,
  queryBuilder: (query: any) => any = q => q.select('*'),
  fallbackData: T[] = [],
  processor: (item: any) => T = item => item as T
): Promise<T[]> {
  const { data, error } = await safeTableQuery(tableName, queryBuilder, fallbackData);
  
  if (error) {
    console.error(`Error getting data from ${tableName}:`, error);
    return fallbackData;
  }
  
  return Array.isArray(data) ? data.map(processor) : fallbackData;
}
