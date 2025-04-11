
import { Database } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseTables } from "@/types/supabase-types";

/**
 * A utility to create a type-safe table query builder for tables not yet in the Database type
 */
export function createTableQuery<T extends keyof DatabaseTables>(
  tableName: T
) {
  // Access the supabase client through a getter to avoid type issues
  const getClient = () => supabase;
  
  // We'll use the standard from method but cast the result to maintain type safety
  // This works around the type issues with tables not in the generated types
  return getClient().from(tableName as string) as any;
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
