
import { supabase } from "@/integrations/supabase/client";
import { SupabaseTables } from "@/types/supabase-tables";
import { PostgrestQueryBuilder } from "@supabase/supabase-js";

/**
 * A utility to create a type-safe table query builder for tables not yet in the Database type
 */
export function createTableQuery<T extends keyof SupabaseTables>(
  tableName: T
): PostgrestQueryBuilder<any, any, any> {
  // Use a type assertion to tell TypeScript that this is a valid table
  return supabase.from(tableName.toString());
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
  
  const getDeliveryNoteItems = () => {
    return createTableQuery('delivery_note_items');
  };
  
  const getSupplierReturnItems = () => {
    return createTableQuery('supplier_return_items');
  };
  
  // Add more tables as needed
  
  return {
    posLocations: getPosLocations(),
    geographicZones: getGeographicZones(),
    priceRequests: getPriceRequests(),
    deliveryNoteItems: getDeliveryNoteItems(),
    supplierReturnItems: getSupplierReturnItems(),
    // Add more tables as they're needed
  };
}
