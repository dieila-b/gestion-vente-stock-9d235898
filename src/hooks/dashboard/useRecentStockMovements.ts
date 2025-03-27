
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StockMovement {
  id: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  product: {
    id: string;
    name: string;
    reference: string;
  };
  created_at: string;
  warehouse: {
    id: string;
    name: string;
  } | null;
  pos_location: {
    id: string;
    name: string;
  } | null;
  created_by: {
    id: string;
    name: string;
  } | null;
}

export function useRecentStockMovements() {
  return useQuery({
    queryKey: ['recent-stock-movements'],
    queryFn: async (): Promise<StockMovement[]> => {
      // Since we're having issues with relationships, let's fetch the data separately
      const { data: movementsData, error: movementsError } = await supabase
        .from('warehouse_stock_movements')
        .select(`
          id,
          type,
          quantity,
          reason,
          created_at,
          product_id,
          warehouse_id
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (movementsError) {
        console.error('Error fetching recent stock movements:', movementsError);
        throw movementsError;
      }

      // Fetch the necessary related data separately
      const productIds = movementsData.filter(item => item.product_id).map(item => item.product_id);
      const warehouseIds = movementsData.filter(item => item.warehouse_id).map(item => item.warehouse_id);

      // Get products data
      const { data: productsData, error: productsError } = await supabase
        .from('catalog')
        .select('id, name, reference')
        .in('id', productIds);
      
      if (productsError) {
        console.error('Error fetching products:', productsError);
        // We'll continue and provide default values if needed
      }

      // Get warehouses data
      const { data: warehousesData, error: warehousesError } = await supabase
        .from('warehouses')
        .select('id, name')
        .in('id', warehouseIds);
      
      if (warehousesError) {
        console.error('Error fetching warehouses:', warehousesError);
        // We'll continue and provide default values if needed
      }

      // Create a mapping of products and warehouses for easier lookup
      const productsMap = new Map();
      (productsData || []).forEach(product => {
        productsMap.set(product.id, product);
      });

      const warehousesMap = new Map();
      (warehousesData || []).forEach(warehouse => {
        warehousesMap.set(warehouse.id, warehouse);
      });

      // Default product object for null cases
      const defaultProduct = { id: '', name: 'Produit inconnu', reference: '' };
      
      // Map movements to the expected format with related data
      return (movementsData || []).map(item => {
        // Get the product from our map or use default
        const product = productsMap.get(item.product_id) || defaultProduct;
        
        // Get the warehouse from our map
        const warehouse = warehousesMap.get(item.warehouse_id) || null;
        
        // Create the stock movement object
        const result: StockMovement = {
          id: item.id,
          type: (item.type === 'in' ? 'in' : 'out') as 'in' | 'out',
          quantity: item.quantity,
          reason: item.reason || '',
          created_at: item.created_at,
          
          // Initialize with product data
          product: {
            id: product.id || defaultProduct.id,
            name: product.name || defaultProduct.name,
            reference: product.reference || defaultProduct.reference
          },
          
          // Initialize other nullable fields
          warehouse: warehouse ? {
            id: warehouse.id,
            name: warehouse.name
          } : null,
          pos_location: null, // We'll implement this if needed
          created_by: null     // We'll implement this if needed
        };
        
        return result;
      });
    }
  });
}
