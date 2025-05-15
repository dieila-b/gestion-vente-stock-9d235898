
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useStockStats = () => {
  const queryClient = useQueryClient();
  
  // Fetch catalog for stock information with enabled refetching
  const { data: catalog } = useQuery({
    queryKey: ['stock-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('*');
      
      if (error) {
        console.error('Error fetching catalog:', error);
        throw error;
      }
      
      console.log('Fetched catalog data for stock statistics:', data?.length || 0, 'products');
      return data || [];
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60, // 1 minute
  });

  // Calculate stock statistics
  const calculateStockStats = () => {
    if (!catalog) return {
      totalStock: 0,
      totalStockPurchaseValue: 0,
      totalStockSaleValue: 0,
      globalStockMargin: 0,
      marginPercentage: 0
    };

    // Only count items with valid stock and prices
    const validProducts = catalog.filter(product => {
      return (
        product !== null && 
        typeof product === 'object' && 
        typeof product.stock === 'number' && 
        product.stock >= 0 &&
        typeof product.price === 'number' &&
        typeof product.purchase_price === 'number'
      );
    });

    console.log('Valid products for calculations:', validProducts);

    const totalStock = validProducts.reduce((sum, product) => {
      return sum + (product.stock || 0);
    }, 0);

    const totalStockPurchaseValue = validProducts.reduce((sum, product) => {
      const stock = product.stock || 0;
      const purchasePrice = product.purchase_price || 0;
      return sum + (stock * purchasePrice);
    }, 0);

    const totalStockSaleValue = validProducts.reduce((sum, product) => {
      const stock = product.stock || 0;
      const salePrice = product.price || 0;
      return sum + (stock * salePrice);
    }, 0);

    // Calculate margin
    const globalStockMargin = totalStockSaleValue - totalStockPurchaseValue;

    // Calculate percentage only if purchase value is positive
    const marginPercentage = totalStockPurchaseValue > 0 
      ? (globalStockMargin / totalStockPurchaseValue) * 100 
      : 0;

    console.log('Stock statistics:', {
      totalStock,
      totalStockPurchaseValue,
      totalStockSaleValue,
      globalStockMargin,
      marginPercentage
    });

    return {
      totalStock,
      totalStockPurchaseValue,
      totalStockSaleValue,
      globalStockMargin,
      marginPercentage
    };
  };

  return {
    catalog,
    ...calculateStockStats(),
    refetch: () => queryClient.invalidateQueries({ queryKey: ['stock-stats'] })
  };
};
