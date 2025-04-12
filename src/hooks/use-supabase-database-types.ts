
import { supabase } from "@/integrations/supabase/client";
import { SupabaseTables } from "@/types/supabase-tables";
import { isSelectQueryError } from "@/utils/supabase-helpers";

/**
 * Returns a typed query builder for any table in the database.
 * @param tableName The name of the table to query
 * @returns A typed query builder
 */
export function createTableQuery<T extends keyof SupabaseTables>(
  tableName: T
) {
  return supabase.from(tableName);
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
