
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Supplier } from "@/types/supplier";

export function useSuppliers() {
  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      console.log('🔄 Fetching suppliers from database...');
      
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('name');

        if (error) {
          console.error('❌ Error fetching suppliers:', error);
          throw error;
        }

        console.log('✅ Suppliers loaded successfully:', data?.length || 0, 'suppliers');
        console.log('📋 Suppliers data preview:', data?.slice(0, 3));
        
        // Transform data to ensure compatibility
        const transformedSuppliers = (data || []).map(supplier => ({
          id: supplier.id,
          name: supplier.name || 'Fournisseur sans nom',
          contact: supplier.contact || supplier.name || '',
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
          status: supplier.status || 'pending',
          website: supplier.website || '',
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
          created_at: supplier.created_at,
          updated_at: supplier.updated_at
        })) as Supplier[];

        console.log('🔄 Transformed suppliers:', transformedSuppliers.length);
        return transformedSuppliers;
      } catch (error) {
        console.error('💥 Exception in useSuppliers:', error);
        throw error;
      }
    },
    enabled: true,
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log('📊 useSuppliers hook - Final state:');
  console.log('- Suppliers count:', suppliers?.length || 0);
  console.log('- Loading:', isLoading);
  console.log('- Error:', error?.message);

  return { suppliers, isLoading, error };
}
