
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, Product } from '@/types/pos';
import { getSafeProduct } from '@/utils/error-handlers';
import { isSelectQueryError } from '@/utils/supabase-helpers';

export function usePOSProducts(posLocationId: string) {
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['pos-products', posLocationId],
    enabled: !!posLocationId && posLocationId !== '_all',
    queryFn: async () => {
      if (!posLocationId || posLocationId === '_all') {
        return [];
      }

      const { data, error } = await supabase
        .from('warehouse_stock')
        .select(`
          *,
          product:catalog(*),
          pos_location:pos_locations(*)
        `)
        .eq('pos_location_id', posLocationId)
        .gt('quantity', 0);

      if (error) throw error;
      return data || [];
    }
  });

  // Format products for use in the POS system
  const formattedProducts: CartItem[] = products.map(item => {
    // Use safe product accessor to handle SelectQueryError
    const product = item.product;
    
    // If product is a SelectQueryError, use default values
    const safeProduct = isSelectQueryError(product) 
      ? { 
          id: item.product_id || "unknown", 
          name: "Unknown Product", 
          reference: "", 
          category: "", 
          image_url: "" 
        }
      : product;
    
    return {
      id: item.product_id,
      name: safeProduct.name,
      quantity: 1, // Default quantity for cart
      price: item.unit_price, // Use unit_price from warehouse_stock
      stock: item.quantity,
      category: safeProduct.category,
      reference: safeProduct.reference,
      image_url: safeProduct.image_url,
    };
  });

  return {
    products: formattedProducts,
    isLoading,
    error
  };
}
