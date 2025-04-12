
import { useQuery } from "@tanstack/react-query";
import { Supplier } from "@/types/supplier";
import { db } from "@/utils/db-adapter";
import { toast } from "sonner";

export function useSuppliers() {
  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      try {
        // Use our safe db-adapter
        const data = await db.query<Supplier[]>(
          'suppliers',
          query => query.select('*').order('name', { ascending: true })
        );
        
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast.error("Erreur lors du chargement des fournisseurs");
        return [] as Supplier[];
      }
    }
  });

  return { suppliers, isLoading, error };
}
