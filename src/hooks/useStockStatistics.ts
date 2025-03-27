
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StockStatistics {
  stats: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  };
  criticalProducts: any[];
}

export const useStockStatistics = () => {
  return useQuery({
    queryKey: ['stock-stats'],
    queryFn: async () => {
      console.log("Fetching stock statistics...");
      
      // Récupérer tous les stocks (dépôts et points de vente)
      const { data: warehouseStock, error: warehouseError } = await supabase
        .from('warehouse_stock')
        .select(`
          id,
          quantity,
          unit_price,
          warehouse:warehouses!fk_warehouse_stock_warehouse (
            id,
            name
          ),
          pos:pos_locations!warehouse_stock_pos_location_id_fkey (
            id,
            name
          ),
          product:catalog(
            id,
            name,
            category,
            reference
          )
        `);

      if (warehouseError) {
        console.error("Error fetching warehouse stock:", warehouseError);
        throw warehouseError;
      }

      // Calculer les statistiques
      let inStock = 0;
      let lowStock = 0;
      let outOfStock = 0;
      let criticalProducts = [];

      // Définir les seuils
      const CRITICAL_STOCK_THRESHOLD = 100; // Nouveau seuil pour les produits critiques

      // Regrouper les produits par ID pour avoir le stock total
      const productStocks = warehouseStock.reduce((acc, item) => {
        const productId = item.product?.id;
        if (productId) {
          if (!acc[productId]) {
            acc[productId] = {
              id: productId,
              product: item.product,
              totalQuantity: 0,
              unit_price: item.unit_price,
              locations: []
            };
          }
          acc[productId].totalQuantity += item.quantity;
          acc[productId].locations.push({
            name: item.warehouse?.name || item.pos?.name,
            quantity: item.quantity,
            type: item.warehouse ? 'depot' : 'pos'
          });
        }
        return acc;
      }, {});

      // Analyser chaque produit
      Object.values(productStocks).forEach((item: any) => {
        const quantity = item.totalQuantity;
        
        if (quantity === 0) {
          outOfStock++;
          criticalProducts.push({ 
            ...item, 
            status: 'out_of_stock',
            totalValue: quantity * (item.unit_price || 0)
          });
        } else if (quantity < CRITICAL_STOCK_THRESHOLD) {
          lowStock++;
          criticalProducts.push({ 
            ...item, 
            status: 'low_stock',
            totalValue: quantity * (item.unit_price || 0)
          });
        } else {
          inStock++;
        }
      });

      // Trier les produits critiques par quantité
      criticalProducts.sort((a, b) => a.totalQuantity - b.totalQuantity);

      console.log("Stock statistics calculated:", { 
        inStock, 
        lowStock, 
        outOfStock, 
        criticalProducts,
        totalProducts: Object.keys(productStocks).length 
      });

      return {
        stats: {
          inStock,
          lowStock,
          outOfStock
        },
        criticalProducts
      };
    },
    refetchInterval: 30000 // Rafraîchir toutes les 30 secondes
  });
};

