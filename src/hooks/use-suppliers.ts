
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Supplier } from "@/types/supplier";

export function useSuppliers() {
  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      console.log('🔄 Fetching suppliers...');
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching suppliers:', error);
        throw error;
      }

      console.log('✅ Suppliers loaded:', data?.length || 0);
        
      if (!data || data.length === 0) {
        console.log('⚠️ No suppliers found');
        return [];
      }
        
      const transformedSuppliers = data.map(supplier => ({
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
        rating: Number(supplier.rating) || 0,
        performance_score: Number(supplier.performance_score) || 0,
        quality_score: Number(supplier.quality_score) || 0,
        delivery_score: Number(supplier.delivery_score) || 0,
        products_count: Number(supplier.products_count) || 0,
        orders_count: Number(supplier.orders_count) || 0,
        pending_orders: Number(supplier.pending_orders) || 0,
        total_revenue: Number(supplier.total_revenue) || 0,
        created_at: supplier.created_at,
        updated_at: supplier.updated_at
      })) as Supplier[];

      console.log('✅ Suppliers transformed:', transformedSuppliers.length);
      return transformedSuppliers;
    },
    enabled: true,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return { suppliers, isLoading, error };
}
