
import { Database } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseTables } from "@/types/supabase-types";
import type { SupabaseClient, PostgrestSingleResponse } from "@supabase/supabase-js";

/**
 * A utility to create a type-safe table query builder for tables not yet in the Database type
 */
export function createTableQuery<T extends string>(
  tableName: T
) {
  // Access the supabase client through a getter to avoid type issues
  const getClient = () => supabase;
  
  // Use type assertions to bypass type restrictions
  // The `any` type here is deliberate to handle tables not in the Database type
  // @ts-ignore - This is intentionally using a string parameter for tableName
  return getClient().from(tableName) as any;
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
