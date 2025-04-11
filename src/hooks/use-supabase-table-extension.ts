
import { Database } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { PostgrestQueryBuilder } from "@supabase/supabase-js";
import { DatabaseTables } from "@/types/supabase-types";

/**
 * A utility to create a type-safe table query builder for tables not yet in the Database type
 */
export function createTableQuery<T extends keyof DatabaseTables>(
  tableName: T
): PostgrestQueryBuilder<any, any, DatabaseTables[T]> {
  // Access the supabase client through a getter to avoid type issues
  const getClient = () => supabase;
  
  // This cast tells TypeScript to trust us about the table type
  return getClient().from(tableName) as unknown as PostgrestQueryBuilder<
    any, any, DatabaseTables[T]
  >;
}

/**
 * A hook to access tables that are not yet in the Database type
 */
export function useExtendedTables() {
  const getPosLocations = () => createTableQuery('pos_locations');
  const getGeographicZones = () => createTableQuery('geographic_zones');
  
  // Add more tables as needed
  
  return {
    posLocations: getPosLocations(),
    geographicZones: getGeographicZones(),
    // Add more tables as they're needed
  };
}
