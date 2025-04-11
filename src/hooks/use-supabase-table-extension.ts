
import { supabase } from "@/integrations/supabase/client";
import { SupabaseTables } from "@/types/supabase-tables";

/**
 * A utility to create a type-safe table query builder for tables not yet in the Database type
 */
export function createTableQuery<T extends keyof SupabaseTables>(
  tableName: T
) {
  // Use a typecast to avoid type issues with string-based table names
  return supabase.from(tableName as unknown as string);
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
