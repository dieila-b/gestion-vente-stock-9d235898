
import { useQuery } from "@tanstack/react-query";
import { Supplier } from "@/types/supplier";
import { db } from "@/utils/db-adapter";
import { toast } from "sonner";

export function useSuppliers() {
  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      try {
        // Check if the suppliers table exists
        let data;
        try {
          // Use our safe db-adapter instead of direct supabase query
          data = await db.query(
            'suppliers',
            query => query.select('*').order('name', { ascending: true })
          );
        } catch (err) {
          console.error("Error fetching suppliers:", err);
          // Return empty array if table doesn't exist
          return [] as Supplier[];
        }
        
        // Make sure we have a valid array of suppliers
        if (Array.isArray(data)) {
          return data.map(supplier => ({
            id: supplier.id || '',
            name: supplier.name || 'Unknown Supplier',
            contact: supplier.contact || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            website: supplier.website || '',
            created_at: supplier.created_at || new Date().toISOString(),
            // Add any other fields you need here
          })) as Supplier[];
        }
        
        return [] as Supplier[];
      } catch (error) {
        console.error("Error in suppliers hook:", error);
        toast.error("Erreur lors du chargement des fournisseurs");
        return [] as Supplier[];
      }
    }
  });

  return { suppliers, isLoading, error };
}
