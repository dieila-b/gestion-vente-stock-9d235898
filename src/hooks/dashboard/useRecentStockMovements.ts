
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-adapter";

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
      try {
        // Fetch the main stock movements data first
        const movementsData = await db.query<any[]>(
          'warehouse_stock_movements',
          query => query
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
            .limit(20)
        );
        
        if (!Array.isArray(movementsData) || movementsData.length === 0) {
          return [];
        }

        // Extract IDs for related entities
        const productIds = movementsData
          .filter(item => item && item.product_id)
          .map(item => item.product_id);
          
        const warehouseIds = movementsData
          .filter(item => item && item.warehouse_id)
          .map(item => item.warehouse_id);

        // Get products data
        const productsData = await db.query<any[]>(
          'catalog',
          query => query
            .select('id, name, reference')
            .in('id', productIds)
        );
        
        // Get warehouses data
        const warehousesData = await db.query<any[]>(
          'warehouses',
          query => query
            .select('id, name')
            .in('id', warehouseIds)
        );
        
        // Create maps for faster lookups
        const productsMap = new Map();
        (productsData || []).forEach((product: any) => {
          if (product && product.id) {
            productsMap.set(product.id, product);
          }
        });

        const warehousesMap = new Map();
        (warehousesData || []).forEach((warehouse: any) => {
          if (warehouse && warehouse.id) {
            warehousesMap.set(warehouse.id, warehouse);
          }
        });

        // Default product object for null cases
        const defaultProduct = { id: '', name: 'Produit inconnu', reference: '' };
        
        // Map movements to the expected format with related data
        return movementsData.map(item => {
          if (!item) return null;
          
          // Get the product from our map or use default
          const product = (item.product_id && productsMap.get(item.product_id)) || defaultProduct;
          
          // Get the warehouse from our map
          const warehouse = item.warehouse_id ? warehousesMap.get(item.warehouse_id) || null : null;
          
          // Create the stock movement object
          const result: StockMovement = {
            id: item.id || '',
            type: (item.type === 'in' ? 'in' : 'out') as 'in' | 'out',
            quantity: item.quantity || 0,
            reason: item.reason || '',
            created_at: item.created_at || new Date().toISOString(),
            
            // Initialize with product data
            product: {
              id: product.id || defaultProduct.id,
              name: product.name || defaultProduct.name,
              reference: product.reference || defaultProduct.reference
            },
            
            // Initialize other nullable fields
            warehouse: warehouse ? {
              id: warehouse.id || '',
              name: warehouse.name || 'Unknown Warehouse'
            } : null,
            pos_location: null,
            created_by: null
          };
          
          return result;
        }).filter(Boolean) as StockMovement[];
      } catch (error) {
        console.error('Error fetching recent stock movements:', error);
        return [];
      }
    }
  });
}
