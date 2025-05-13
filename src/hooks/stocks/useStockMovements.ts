
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStockEntries } from "./useStockEntries";
import { useStockExits } from "./useStockExits";
import { StockEntryForm } from "./useStockMovementTypes";

export function useStockMovements(type: 'in' | 'out' = 'in') {
  const { createStockEntry } = useStockEntries();
  const { createStockExit } = useStockExits();

  // Récupération des mouvements de stock
  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['stock-movements', type],
    queryFn: async () => {
      console.log(`Fetching ${type} stock movements`);
      
      const { data, error } = await supabase
        .from('warehouse_stock_movements')
        .select(`
          id,
          quantity,
          unit_price,
          total_value,
          type,
          reason,
          created_at,
          product:product_id(id, name, reference),
          warehouse:warehouse_id(id, name),
          pos_location:pos_location_id(id, name)
        `)
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching ${type} movements:`, error);
        throw error;
      }

      console.log(`Found ${data.length} ${type} movements`);
      return data;
    },
    staleTime: 1000 * 60 // 1 minute
  });

  // Récupération des entrepôts
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name')
        .eq('is_active', true);

      if (error) {
        console.error("Error fetching warehouses:", error);
        throw error;
      }
      
      return data;
    }
  });

  // Récupération des produits
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('catalog')
        .select('id, name, reference, price');

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      return data;
    }
  });

  // Fonction pour créer un mouvement de stock (entrée ou sortie)
  const createStockMovement = async (data: StockEntryForm) => {
    return type === 'in' 
      ? await createStockEntry(data)
      : await createStockExit(data);
  };

  return {
    movements,
    isLoading,
    warehouses,
    products,
    createStockEntry: createStockMovement
  };
}
