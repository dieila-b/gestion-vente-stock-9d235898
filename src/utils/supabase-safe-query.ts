
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Safely query the supabase database and handle errors
 * @param tableName The name of the table to query
 * @param queryBuilder Function that builds the query
 * @returns Promise resolving to the query result or null
 */
export async function safeQueryTable<T>(
  tableName: string, 
  queryBuilder: (query: any) => any, 
  errorMessage: string = "Erreur lors de la requête"
): Promise<T[] | null> {
  try {
    // Access the table via index access to avoid TypeScript errors with dynamic table names
    const query = supabase.from(tableName as any);
    const { data, error } = await queryBuilder(query);
    
    if (error) {
      console.error(`Error querying ${tableName}:`, error);
      toast.error(errorMessage);
      return null;
    }
    
    return data as T[];
  } catch (err) {
    console.error(`Exception querying ${tableName}:`, err);
    toast.error(errorMessage);
    return null;
  }
}

/**
 * Safely query a specific record from the supabase database
 */
export async function safeQueryRecord<T>(
  tableName: string,
  id: string,
  queryBuilder: (query: any) => any = q => q,
  errorMessage: string = "Erreur lors de la requête"
): Promise<T | null> {
  try {
    // Access the table via index access to avoid TypeScript errors
    const baseQuery = supabase.from(tableName as any).select('*').eq('id', id);
    const { data, error } = await queryBuilder(baseQuery);
    
    if (error) {
      console.error(`Error querying ${tableName} record:`, error);
      toast.error(errorMessage);
      return null;
    }
    
    return (Array.isArray(data) ? data[0] : data) as T;
  } catch (err) {
    console.error(`Exception querying ${tableName} record:`, err);
    toast.error(errorMessage);
    return null;
  }
}

/**
 * Safely insert a record into the supabase database
 */
export async function safeInsertRecord<T>(
  tableName: string,
  record: any,
  errorMessage: string = "Erreur lors de l'insertion"
): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .insert(record)
      .select()
      .single();
    
    if (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      toast.error(errorMessage);
      return null;
    }
    
    return data as T;
  } catch (err) {
    console.error(`Exception inserting into ${tableName}:`, err);
    toast.error(errorMessage);
    return null;
  }
}

/**
 * Safely update a record in the supabase database
 */
export async function safeUpdateRecord<T>(
  tableName: string,
  id: string,
  updates: any,
  errorMessage: string = "Erreur lors de la mise à jour"
): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${tableName}:`, error);
      toast.error(errorMessage);
      return null;
    }
    
    return data as T;
  } catch (err) {
    console.error(`Exception updating ${tableName}:`, err);
    toast.error(errorMessage);
    return null;
  }
}

/**
 * Safely delete a record from the supabase database
 */
export async function safeDeleteRecord(
  tableName: string,
  id: string,
  errorMessage: string = "Erreur lors de la suppression"
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName as any)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      toast.error(errorMessage);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error(`Exception deleting from ${tableName}:`, err);
    toast.error(errorMessage);
    return false;
  }
}
