
import { useQuery } from "@tanstack/react-query";
import { Supplier } from "@/types/supplier";
import { db } from "@/utils/db-adapter";
import { toast } from "sonner";

export function useSuppliers() {
  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      try {
        console.log('Fetching suppliers...');
        
        // Use our safe db-adapter to fetch suppliers
        const data = await db.query(
          'suppliers',
          query => query.select('*').order('name', { ascending: true })
        );
        
        console.log('Raw suppliers data:', data);
        
        // Make sure we have a valid array of suppliers
        if (Array.isArray(data)) {
          const formattedSuppliers = data.map(supplier => ({
            id: supplier.id || '',
            name: supplier.name || 'Fournisseur sans nom',
            contact: supplier.contact || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            website: supplier.website || '',
            created_at: supplier.created_at || new Date().toISOString(),
            // Add any other fields from the supplier type
            contact_person: supplier.contact_person || '',
            status: supplier.status || 'pending',
            country: supplier.country || '',
            city: supplier.city || '',
            postal_box: supplier.postal_box || '',
            landline: supplier.landline || '',
            verified: supplier.verified || false,
            rating: supplier.rating || 0,
            performance_score: supplier.performance_score || 0,
            quality_score: supplier.quality_score || 0,
            delivery_score: supplier.delivery_score || 0,
            products_count: supplier.products_count || 0,
            orders_count: supplier.orders_count || 0,
            pending_orders: supplier.pending_orders || 0,
            total_revenue: supplier.total_revenue || 0,
          })) as Supplier[];
          
          console.log('Formatted suppliers:', formattedSuppliers);
          return formattedSuppliers;
        }
        
        console.log('No suppliers data or invalid format');
        return [] as Supplier[];
      } catch (error) {
        console.error("Error in suppliers hook:", error);
        toast.error("Erreur lors du chargement des fournisseurs");
        return [] as Supplier[];
      }
    }
  });

  console.log('useSuppliers result:', { suppliers, isLoading, error });
  
  return { suppliers, isLoading, error };
}
