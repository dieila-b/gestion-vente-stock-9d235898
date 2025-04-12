
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SortColumn, SortDirection } from "./useSorting";
import { safeFetchFromTable, safeProduct } from "@/utils/supabase-safe-query";

export function useInvoiceData(
  sortColumn: SortColumn, 
  sortDirection: SortDirection, 
  showUnpaidOnly: boolean
) {
  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['preorder-invoices', sortColumn, sortDirection, showUnpaidOnly],
    queryFn: async () => {
      // Get preorders with sorting and filtering
      let preorders = await safeFetchFromTable(
        'preorders',
        (query) => {
          let q = query.select(`
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
            q = q.in('status', ['pending', 'partial']);
          }

          if (sortColumn === 'client') {
            q = q.order('client(company_name)', { ascending: sortDirection === 'asc' });
          } else {
            q = q.order(sortColumn, { ascending: sortDirection === 'asc' });
          }

          return q;
        },
        [],
        "Erreur lors de la récupération des précommandes"
      );
      
      // Enrich the preorders with product data
      const enrichedData = await Promise.all((preorders || []).map(async (preorder) => {
        const productIds = (preorder.items || []).map((item: any) => item.product_id);
        
        if (productIds.length === 0) {
          return {
            ...preorder,
            items: []
          };
        }
        
        // Safely query product information
        const products = await safeFetchFromTable(
          'catalog',
          (query) => query.select('id, name, image')
            .in('id', productIds),
          [],
          "Erreur lors de la récupération des produits"
        );
        
        const enrichedItems = (preorder.items || []).map((item: any) => {
          const product = products.find((p: any) => p.id === item.product_id);
          return {
            ...item,
            product: product || { id: item.product_id, name: 'Produit inconnu' }
          };
        });
        
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
