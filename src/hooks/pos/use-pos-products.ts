
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Ensure the product data includes price
type WarehouseStockWithProduct = {
  created_at: string;
  id: string;
  pos_location_id: string;
  product_id: string;
  quantity: number;
  total_value: number;
  unit_price: number;
  updated_at: string;
  warehouse_id: string;
  product: {
    category: string;
    created_at: string;
    description: string;
    id: string;
    image_url: string;
    name: string;
    price: number; // Make sure this exists
    purchase_price: number;
    reference: string;
    stock: number;
    updated_at: string;
  };
  pos_location: any;
};

export function usePOSProducts(locationId: string | undefined) {
  return useQuery({
    queryKey: ['pos-products', locationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouse_stock')
        .select(`
          *,
          product:product_id(*),
          pos_location:pos_location_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching POS products:', error);
        toast.error("Erreur lors du chargement des produits");
        throw error;
      }

      // Filter for the location if provided
      const items = locationId && locationId !== "_all" 
        ? data.filter((item: WarehouseStockWithProduct) => item.pos_location_id === locationId)
        : data;

      // Map products with price from product data or unit_price as fallback
      return items.map((item: WarehouseStockWithProduct) => ({
        ...item,
        // Ensure product has price or use unit_price as fallback
        product: {
          ...item.product,
          price: item.product?.price || item.unit_price || 0
        }
      }));
    }
  });
}
