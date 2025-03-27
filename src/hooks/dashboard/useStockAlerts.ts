
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StockAlert = {
  id: string;
  name: string;
  stock: number;
  min_stock_level?: number;
  category?: string;
  price: number;
  alert_type: 'out_of_stock' | 'low_stock';
  location?: string;
  location_type?: 'warehouse' | 'pos';
};

export const useStockAlerts = () => {
  return useQuery({
    queryKey: ['stock-alerts'],
    queryFn: async () => {
      // Fetch global stock alerts from catalog
      const { data: catalogData, error: catalogError } = await supabase
        .from('catalog')
        .select('*');

      if (catalogError) {
        console.error('Error fetching catalog items:', catalogError);
        throw catalogError;
      }

      // Define a default minimum stock level if not specified
      const DEFAULT_MIN_STOCK = 5;

      // Fetch warehouse and POS stock data with proper relations
      // Use explicit column names for the relationship to avoid ambiguity
      const { data: warehouseStockData, error: warehouseStockError } = await supabase
        .from('warehouse_stock')
        .select(`
          id,
          product_id,
          quantity,
          warehouse_id,
          pos_location_id,
          warehouses!warehouse_id(id, name),
          pos_locations!pos_location_id(id, name),
          catalog!product_id(id, name, category, price)
        `);

      if (warehouseStockError) {
        console.error('Error fetching warehouse stock:', warehouseStockError);
        throw warehouseStockError;
      }

      // Format catalog alerts
      const catalogAlerts: StockAlert[] = catalogData
        .filter(item => item.stock === 0 || (item.stock > 0 && item.stock < DEFAULT_MIN_STOCK))
        .map(item => ({
          id: item.id,
          name: item.name,
          stock: item.stock,
          category: item.category,
          price: item.price,
          min_stock_level: DEFAULT_MIN_STOCK,
          alert_type: item.stock === 0 ? 'out_of_stock' : 'low_stock',
          location: 'Stock Global',
          location_type: 'warehouse'
        }));

      // Format warehouse and POS stock alerts
      const warehouseAlerts: StockAlert[] = warehouseStockData
        .filter(item => {
          // Default to minimum stock level of 5 if not specified
          const minLevel = DEFAULT_MIN_STOCK;
          return item.quantity === 0 || (item.quantity > 0 && item.quantity < minLevel);
        })
        .map(item => {
          const locationType = item.warehouse_id ? 'warehouse' : 'pos';
          const locationName = item.warehouse_id 
            ? (item.warehouses?.name || 'Dépôt inconnu')
            : (item.pos_locations?.name || 'PDV inconnu');
          
          return {
            id: `${item.product_id}-${item.id}`,
            name: item.catalog?.name || 'Produit inconnu',
            stock: item.quantity,
            category: item.catalog?.category,
            price: item.catalog?.price || 0,
            min_stock_level: DEFAULT_MIN_STOCK,
            alert_type: item.quantity === 0 ? 'out_of_stock' : 'low_stock',
            location: locationName,
            location_type: locationType
          };
        });

      // Combine and return all alerts
      const allAlerts = [...catalogAlerts, ...warehouseAlerts];
      console.log(`Found ${allAlerts.length} stock alerts across all locations`);
      
      return allAlerts;
    }
  });
};
