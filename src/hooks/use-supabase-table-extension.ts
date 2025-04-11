
import { Database, DatabaseTables } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { PostgrestQueryBuilder } from "@supabase/supabase-js";

/**
 * A utility to create a type-safe table query builder for tables not yet in the Database type
 */
export function createTableQuery<T extends string>(
  tableName: T
): PostgrestQueryBuilder<Database, any, any> {
  // Access the supabase client through a getter to avoid type issues
  const getClient = () => supabase;
  
  // Use the from method with the table name, and cast the result to bypass type restrictions
  return getClient().from(tableName) as PostgrestQueryBuilder<Database, any, any>;
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
  
  const getPriceRequests = () => {
    return createTableQuery('price_requests');
  };
  
  // Add more tables as needed
  
  return {
    posLocations: getPosLocations(),
    geographicZones: getGeographicZones(),
    priceRequests: getPriceRequests(),
    // Add more tables as they're needed
  };
}
