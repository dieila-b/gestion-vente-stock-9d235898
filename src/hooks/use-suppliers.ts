
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Supplier } from "@/types/supplier";
import { useCatalogAuth } from "@/hooks/use-catalog-auth";
import { toast } from "sonner";

export const useSuppliers = () => {
  const { isAuthenticated } = useCatalogAuth();

  const { data: suppliers, isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('name');
        
        if (error) {
          toast.error("Erreur lors du chargement des fournisseurs");
          throw error;
        }
        return data as Supplier[];
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        throw error;
      }
    },
    // Ne pas dépendre de isAuthenticated pour exécuter la requête
    // car nous simulons l'authentification pour l'instant
    enabled: true
  });

  return { suppliers, isLoading, error };
};
