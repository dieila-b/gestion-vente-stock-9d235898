
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * A universal database adapter to safely access any table in Supabase,
 * even if it's not yet added to the TypeScript definitions.
 */
export class DatabaseAdapter {
  /**
   * Creates a query builder for any table, handling type mismatches gracefully
   * 
   * @param tableName The name of the table to query
   * @returns A query builder for the specified table
   */
  static table(tableName: string) {
    try {
      // Use type assertion to bypass TypeScript's type checking
      return supabase.from(tableName as any);
    } catch (error) {
      console.error(`Error accessing table ${tableName}:`, error);
      // Return a mock object that logs errors but doesn't throw
      return {
        select: () => this.createErrorProxy(`Table ${tableName} doesn't exist`),
        insert: () => this.createErrorProxy(`Table ${tableName} doesn't exist`),
        update: () => this.createErrorProxy(`Table ${tableName} doesn't exist`),
        delete: () => this.createErrorProxy(`Table ${tableName} doesn't exist`),
        upsert: () => this.createErrorProxy(`Table ${tableName} doesn't exist`),
      };
    }
  }

  /**
   * Creates a proxy object that logs errors and returns mock data
   */
  private static createErrorProxy(errorMessage: string) {
    const handler = {
      get: (target: any, prop: string) => {
        if (typeof target[prop] === 'function') {
          return (...args: any[]) => {
            console.error(errorMessage);
            toast.error(errorMessage);
            return Promise.resolve({ data: [], error: { message: errorMessage } });
          };
        }
        return this.createErrorProxy(`${errorMessage} (${prop})`);
      }
    };

    return new Proxy({}, handler);
  }

  /**
   * Executes a query safely, handling errors and returning fallback data if needed
   * 
   * @param tableName The name of the table to query
   * @param queryFn Function that builds the query
   * @param fallbackData Data to return in case of error
   * @returns The query result or fallback data
   */
  static async query<T>(
    tableName: string,
    queryFn: (queryBuilder: any) => any,
    fallbackData: T = [] as unknown as T
  ): Promise<T> {
    try {
      const queryBuilder = this.table(tableName);
      const { data, error } = await queryFn(queryBuilder);
      
      if (error) {
        console.error(`Error querying ${tableName}:`, error);
        toast.error(`Erreur lors de la requête à ${tableName}`);
        return fallbackData;
      }
      
      return data as T;
    } catch (err) {
      console.error(`Exception querying ${tableName}:`, err);
      toast.error(`Erreur lors de la requête à ${tableName}`);
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
  static async insert<T>(
    tableName: string, 
    data: any
  ): Promise<T | null> {
    try {
      const { data: result, error } = await this.table(tableName).insert(data).select();
      
      if (error) {
        console.error(`Error inserting into ${tableName}:`, error);
        toast.error(`Erreur lors de l'insertion dans ${tableName}`);
        return null;
      }
      
      return result as T;
    } catch (err) {
      console.error(`Exception inserting into ${tableName}:`, err);
      toast.error(`Erreur lors de l'insertion dans ${tableName}`);
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
  static async update<T>(
    tableName: string, 
    data: any, 
    matchColumn: string, 
    matchValue: any
  ): Promise<T | null> {
    try {
      const { data: result, error } = await this.table(tableName)
        .update(data)
        .eq(matchColumn, matchValue)
        .select();
      
      if (error) {
        console.error(`Error updating ${tableName}:`, error);
        toast.error(`Erreur lors de la mise à jour dans ${tableName}`);
        return null;
      }
      
      return result as T;
    } catch (err) {
      console.error(`Exception updating ${tableName}:`, err);
      toast.error(`Erreur lors de la mise à jour dans ${tableName}`);
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
  static async delete(
    tableName: string, 
    matchColumn: string, 
    matchValue: any
  ): Promise<boolean> {
    try {
      const { error } = await this.table(tableName)
        .delete()
        .eq(matchColumn, matchValue);
      
      if (error) {
        console.error(`Error deleting from ${tableName}:`, error);
        toast.error(`Erreur lors de la suppression dans ${tableName}`);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error(`Exception deleting from ${tableName}:`, err);
      toast.error(`Erreur lors de la suppression dans ${tableName}`);
      return false;
    }
  }
}

// Export convenient shorthand functions
export const db = {
  table: DatabaseAdapter.table,
  query: DatabaseAdapter.query,
  insert: DatabaseAdapter.insert,
  update: DatabaseAdapter.update,
  delete: DatabaseAdapter.delete
};
