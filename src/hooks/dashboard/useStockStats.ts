
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useStockStats() {
  console.log("useStockStats: Démarrage de la récupération");

  const { data: catalog = [] } = useQuery({
    queryKey: ['stock-catalog'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('catalog')
          .select('*');
        
        if (error) {
          console.error("Erreur stock catalog:", error);
          return [];
        }
        
        return data || [];
      } catch (err) {
        console.error("Erreur dans catalog:", err);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  // Calculs basés sur le catalogue
  const totalStock = catalog.reduce((sum, product) => sum + (product.stock || 0), 0);
  const totalStockPurchaseValue = catalog.reduce((sum, product) => 
    sum + ((product.stock || 0) * (product.purchase_price || 0)), 0);
  const totalStockSaleValue = catalog.reduce((sum, product) => 
    sum + ((product.stock || 0) * (product.price || 0)), 0);
  const globalStockMargin = totalStockSaleValue - totalStockPurchaseValue;
  const marginPercentage = totalStockPurchaseValue > 0 
    ? (globalStockMargin / totalStockPurchaseValue) * 100 
    : 0;

  console.log("useStockStats: Calculs terminés", {
    catalogLength: catalog.length,
    totalStock,
    totalStockPurchaseValue,
    totalStockSaleValue,
    globalStockMargin,
    marginPercentage
  });

  return {
    catalog,
    totalStock,
    totalStockPurchaseValue,
    totalStockSaleValue,
    globalStockMargin,
    marginPercentage
  };
}
