
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStockEntries } from "./useStockEntries";
import { useStockExits } from "./useStockExits";
import { StockEntryForm, StockMovement } from "./useStockMovementTypes";
import { toast } from "sonner";
import { safeProduct, safeWarehouse } from "@/utils/supabase-safe-query";

export function useStockMovements(type: 'in' | 'out' = 'in') {
  const queryClient = useQueryClient();
  const { createStockEntry } = useStockEntries();
  const { createStockExit } = useStockExits();

  // Récupération des mouvements de stock
  const { data: movementsData = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-movements', type],
    queryFn: async () => {
      console.log(`Fetching ${type} stock movements`);
      
      try {
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
            product:product_id!warehouse_stock_movements_product_id_fkey (
              id,
              name,
              reference
            ),
            warehouse:warehouse_id!warehouse_stock_movements_warehouse_id_fkey (
              id,
              name
            )
          `)
          .eq('type', type)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Error fetching ${type} movements:`, error);
          throw error;
        }

        console.log(`Found ${data.length} ${type} movements`);
        
        // Conversion explicite avec gestion sécurisée des données
        const typedMovements: StockMovement[] = data.map(item => {
          const product = safeProduct(item.product);
          const warehouse = safeWarehouse(item.warehouse);
          
          return {
            id: item.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_value: item.total_value,
            type: item.type === 'in' ? 'in' : 'out' as 'in' | 'out',
            reason: item.reason,
            created_at: item.created_at,
            product: {
              id: product.id,
              name: product.name,
              reference: product.reference
            },
            warehouse: warehouse,
            pos_location: null
          };
        });
        
        return typedMovements;
      } catch (error) {
        console.error(`Error in stock movements query:`, error);
        toast.error("Erreur de chargement", {
          description: "Impossible de charger les mouvements de stock."
        });
        return [] as StockMovement[];
      }
    },
    staleTime: 1000 * 30, // 30 secondes (diminué pour une actualisation plus fréquente)
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Récupération des entrepôts
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('warehouses')
          .select('id, name')
          .eq('is_active', true);

        if (error) {
          console.error("Error fetching warehouses:", error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        toast.error("Erreur", {
          description: "Impossible de charger la liste des entrepôts."
        });
        return [];
      }
    }
  });

  // Récupération des points de vente
  const { data: posLocations = [] } = useQuery({
    queryKey: ['pos-locations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('pos_locations')
          .select('id, name')
          .eq('is_active', true);

        if (error) {
          console.error("Error fetching POS locations:", error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching POS locations:", error);
        toast.error("Erreur", {
          description: "Impossible de charger la liste des points de vente."
        });
        return [];
      }
    }
  });

  // Récupération des produits
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('catalog')
          .select('id, name, reference, price')
          .order('name');

        if (error) {
          console.error("Error fetching products:", error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Erreur", {
          description: "Impossible de charger la liste des produits."
        });
        return [];
      }
    }
  });

  // Fonction pour créer un mouvement de stock (entrée ou sortie)
  const createStockMovement = async (data: StockEntryForm): Promise<boolean> => {
    console.log(`Creating stock ${type} with data:`, data);
    
    let success = false;
    
    try {
      if (type === 'in') {
        success = await createStockEntry(data);
      } else {
        success = await createStockExit(data);
      }
      
      if (success) {
        // Force refresh data
        console.log("Stock movement created successfully, refreshing data...");
        await refreshData();
        return true;
      } else {
        console.error("Stock movement creation returned false");
        return false;
      }
    } catch (error) {
      console.error(`Error creating stock ${type}:`, error);
      toast.error("Erreur", {
        description: `Impossible de créer le mouvement de stock: ${error instanceof Error ? error.message : String(error)}`
      });
      return false;
    }
  };
  
  const refreshData = async () => {
    console.log("Refreshing stock movement data...");
    try {
      // Invalidate all relevant queries
      await queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      await queryClient.invalidateQueries({ queryKey: ['warehouse-stock'] });
      await queryClient.invalidateQueries({ queryKey: ['warehouse-stock-statistics'] });
      await queryClient.invalidateQueries({ queryKey: ['catalog'] });
      await queryClient.invalidateQueries({ queryKey: ['stock-stats'] });
      
      // Refetch immediately after invalidating
      await refetch();
      
      toast.success("Données actualisées", {
        description: "Les mouvements de stock ont été rechargés."
      });
      return true;
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Erreur d'actualisation", {
        description: "Impossible de recharger les données."
      });
      return false;
    }
  };

  return {
    movements: movementsData,
    isLoading,
    warehouses,
    posLocations,
    products,
    createStockEntry: createStockMovement,
    refetch: refreshData
  };
}
