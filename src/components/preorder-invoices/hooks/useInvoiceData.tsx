
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SortColumn, SortDirection } from "./useSorting";
import { safeMap, isSelectQueryError } from "@/utils/supabase-helpers";

export function useInvoiceData(
  sortColumn: SortColumn, 
  sortDirection: SortDirection, 
  showUnpaidOnly: boolean
) {
  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['preorder-invoices', sortColumn, sortDirection, showUnpaidOnly],
    queryFn: async () => {
      let query = supabase
        .from('preorders')
        .select(`
          *,
          client:clients(company_name),
          items:preorder_items(
            id,
            quantity,
            unit_price,
            total_price,
            discount,
            product_id
          )
        `);

      if (showUnpaidOnly) {
        query = query.in('status', ['pending', 'partial']);
      }

      if (sortColumn === 'client') {
        query = query.order('client(company_name)', { ascending: sortDirection === 'asc' });
      } else {
        query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching preorder invoices:', error);
        throw error;
      }

      const enrichedData = await Promise.all(data.map(async (preorder) => {
        // Handle the case where items might be a SelectQueryError
        const items = !isSelectQueryError(preorder.items) ? preorder.items : [];
        const productIds = safeMap(items, (item: any) => item.product_id, []);
        
        if (productIds.length === 0) {
          return {
            ...preorder,
            items: []
          };
        }
        
        const { data: products, error: productsError } = await supabase
          .from('catalog')
          .select('id, name, image')
          .in('id', productIds);
          
        if (productsError) {
          console.error('Error fetching products:', productsError);
          return preorder;
        }
        
        // Handle the case where items might be a SelectQueryError
        const enrichedItems = safeMap(items, (item: any) => {
          const product = products?.find((p: any) => p.id === item.product_id);
          return {
            ...item,
            product: product || { id: item.product_id, name: 'Produit inconnu' }
          };
        }, []);
        
        return {
          ...preorder,
          items: enrichedItems
        };
      }));
      
      return enrichedData;
    }
  });

  return {
    invoices,
    isLoading,
    refetch
  };
}
