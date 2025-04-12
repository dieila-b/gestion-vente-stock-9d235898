
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
  // Use type assertion to work around type issues
  return supabase.from(tableName as string);
}

/**
 * A hook to access tables that are not yet in the Database type
 */
export function useExtendedTables() {
  const getPosLocations = () => {
    // Use type assertion to work around type issues
    return supabase.from('pos_locations' as string);
  };
  
  const getGeographicZones = () => {
    // Use type assertion to work around type issues
    return supabase.from('geographic_zones' as string);
  };
  
  const getPriceRequests = () => {
    // Use type assertion to work around type issues
    return supabase.from('price_requests' as string);
  };
  
  const getDeliveryNoteItems = () => {
    // Use type assertion to work around type issues
    return supabase.from('delivery_note_items' as string);
  };
  
  const getSupplierReturnItems = () => {
    // Use type assertion to work around type issues
    return supabase.from('supplier_return_items' as string);
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
