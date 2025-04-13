
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useStockLocations() {
  return useQuery({
    queryKey: ['stock-locations'],
    queryFn: async () => {
      // Fetch warehouse data
      const { data: warehouseData, error: warehouseError } = await supabase
        .from('warehouse_stock')
        .select(`
          quantity,
          warehouse_id,
          warehouse:warehouses!warehouse_stock_warehouse_id_fkey(name)
        `)
        .not('warehouse_id', 'is', null);

      if (warehouseError) {
        console.error('Error fetching warehouse data:', warehouseError);
        throw warehouseError;
      }

      // Fetch POS data
      const { data: posData, error: posError } = await supabase
        .from('warehouse_stock')
        .select(`
          quantity,
          pos_location_id,
          pos_location:pos_locations(name)
        `)
        .not('pos_location_id', 'is', null);

      if (posError) {
        console.error('Error fetching POS data:', posError);
        throw posError;
      }

      // Process warehouse data
      const warehouseMap = new Map();
      warehouseData.forEach(item => {
        const warehouseName = item.warehouse?.name || 'Entrepôt inconnu';
        const quantity = item.quantity || 0;
        
        if (warehouseMap.has(warehouseName)) {
          warehouseMap.set(warehouseName, warehouseMap.get(warehouseName) + quantity);
        } else {
          warehouseMap.set(warehouseName, quantity);
        }
      });

      // Process POS data
      const posMap = new Map();
      posData.forEach(item => {
        const posName = item.pos_location?.name || 'PDV inconnu';
        const quantity = item.quantity || 0;
        
        if (posMap.has(posName)) {
          posMap.set(posName, posMap.get(posName) + quantity);
        } else {
          posMap.set(posName, quantity);
        }
      });

      // Convert to array format for charts
      const warehouseResult = Array.from(warehouseMap.entries()).map(([name, value]) => ({
        name,
        value,
        type: 'warehouse' as const
      }));

      const posResult = Array.from(posMap.entries()).map(([name, value]) => ({
        name,
        value,
        type: 'pos' as const
      }));

      return [...warehouseResult, ...posResult];
    }
  });
}
