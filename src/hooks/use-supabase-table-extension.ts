
import { Database } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseTables } from "@/types/supabase-types";
import { SafePostgrestQueryBuilder } from "@/types/supabase-extensions";

/**
 * A utility to create a type-safe table query builder for tables not yet in the Database type
 */
export function createTableQuery<T extends string>(
  tableName: T
) {
  // Access the supabase client through a getter to avoid type issues
  const getClient = () => supabase;
  
  // We need to use a more flexible type assertion here
  return getClient().from(tableName) as unknown as SafePostgrestQueryBuilder<any>;
}

/**
 * A hook to access tables that are not yet in the Database type
 */
export function useExtendedTables() {
  const getPosLocations = () => {
    return createTableQuery('pos_locations');
  };
  
  const getGeographicZones = () => {
    return createTableQuery('geographic_zones');
  };
  
  // Add more tables as needed
  
  return {
    posLocations: getPosLocations(),
    geographicZones: getGeographicZones(),
    // Add more tables as they're needed
  };
}
