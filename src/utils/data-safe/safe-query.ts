
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { db } from "../db-core";

/**
 * Safely fetch from a table that might not exist yet in the database schema 
 * but is used in the application code
 */
export async function safeFetchFromTable<T>(
  tableName: string,
  queryBuilder: (query: any) => any = q => q,
  fallbackData: T[] = [] as T[],
  errorMessage: string = `Erreur lors de la requête à ${tableName}`
): Promise<T[]> {
  return db.query(tableName, queryBuilder, fallbackData);
}

/**
 * Safely get a record by ID from a table that might not exist
 */
export async function safeFetchRecordById<T>(
  tableName: string,
  id: string,
  queryBuilder: (query: any) => any = q => q,
  fallbackData: T | null = null,
  errorMessage: string = `Erreur lors de la requête à ${tableName}`
): Promise<T | null> {
  try {
    // Use the database adapter to handle this query
    const result = await db.query(
      tableName,
      q => queryBuilder(q.select('*').eq('id', id)),
      []
    );
    
    return (Array.isArray(result) && result.length > 0) ? result[0] as T : fallbackData;
  } catch (err) {
    console.error(`Exception querying ${tableName} record:`, err);
    if (process.env.NODE_ENV !== 'production') {
      toast.error(errorMessage);
    }
    return fallbackData;
  }
}
