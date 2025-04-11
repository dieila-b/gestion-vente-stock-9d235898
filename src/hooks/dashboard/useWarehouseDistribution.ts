
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSelectQueryError } from "@/utils/supabase-helpers";
import { createTableQuery } from "@/hooks/use-supabase-table-extension";

export const useWarehouseDistribution = () => {
  return useQuery({
    queryKey: ['warehouse-distribution'],
    queryFn: async () => {
      // Fetch warehouse stock with related data
      const { data: warehouseStockData, error: warehouseStockError } = await supabase
        .from('warehouse_stock')
        .select(`
          id,
          quantity,
          warehouse_id,
          pos_location_id,
          warehouses!warehouse_id(id, name),
          pos_locations!pos_location_id(id, name)
        `);

      if (warehouseStockError) {
        console.error('Error fetching warehouse distribution:', warehouseStockError);
        throw warehouseStockError;
      }

      // Fetch all warehouses to include even those with no stock
      const { data: allWarehouses, error: warehousesError } = await supabase
        .from('warehouses')
        .select('id, name');

      if (warehousesError) {
        console.error('Error fetching warehouses:', warehousesError);
        throw warehousesError;
      }

      // Fetch all POS locations to include even those with no stock
      const { data: allPosLocations, error: posLocationsError } = await createTableQuery('pos_locations')
        .select('id, name');

      if (posLocationsError) {
        console.error('Error fetching POS locations:', posLocationsError);
        throw posLocationsError;
      }

      // Process warehouse data, handling potential SelectQueryErrors
      const warehouseData = allWarehouses.map(warehouse => {
        const stockItems = warehouseStockData.filter(item => item.warehouse_id === warehouse.id);
        const totalItems = stockItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          id: warehouse.id,
          name: warehouse.name || 'Unnamed Warehouse',
          itemCount: totalItems,
          type: 'warehouse'
        };
      });

      // Process POS location data, handling potential SelectQueryErrors
      const posData = (allPosLocations || []).map((pos: any) => {
        if (!pos || typeof pos !== 'object') {
          return {
            id: 'unknown',
            name: 'Unknown POS',
            itemCount: 0,
            type: 'pos'
          };
        }
        
        const stockItems = warehouseStockData.filter(item => item.pos_location_id === pos.id);
        const totalItems = stockItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          id: pos.id,
          name: pos.name || 'Unnamed POS',
          itemCount: totalItems,
          type: 'pos'
        };
      });

      // Combine data
      return [...warehouseData, ...posData];
    }
  });
};
