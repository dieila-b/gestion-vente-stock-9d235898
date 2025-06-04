
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SortColumn, SortDirection } from "./useInvoiceSorting";

export function useInvoiceData(sortColumn: SortColumn, sortDirection: SortDirection) {
  const [searchParams] = useSearchParams();
  const showUnpaidOnly = searchParams.get('filter') === 'unpaid';

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['sales-invoices', sortColumn, sortDirection, showUnpaidOnly],
    queryFn: async () => {
      console.log("Fetching sales invoices...");
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          client:clients(
            id, 
            company_name, 
            contact_name,
            email, 
            phone, 
            address, 
            client_code,
            mobile_1,
            mobile_2,
            whatsapp
          ),
          items:order_items(
            id,
            quantity,
            price,
            total,
            discount,
            delivered_quantity,
            delivery_status,
            product:products!order_items_product_id_fkey(
              id,
              name,
              image_url
            )
          )
        `);

      if (showUnpaidOnly) {
        query = query.in('payment_status', ['pending', 'partial']);
      }

      // Apply sorting
      if (sortColumn === 'client') {
        query = query.order('client(company_name)', { ascending: sortDirection === 'asc' });
      } else if (sortColumn === 'id') {
        query = query.order('id', { ascending: sortDirection === 'asc' });
      } else {
        query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching sales invoices:', error);
        // Try alternative query if the foreign key doesn't work
        const fallbackQuery = supabase
          .from('orders')
          .select(`
            *,
            client:clients(
              id, 
              company_name, 
              contact_name,
              email, 
              phone, 
              address, 
              client_code,
              mobile_1,
              mobile_2,
              whatsapp
            ),
            items:order_items(
              id,
              quantity,
              price,
              total,
              discount,
              delivered_quantity,
              product_id
            )
          `);

        if (showUnpaidOnly) {
          fallbackQuery.in('payment_status', ['pending', 'partial']);
        }

        if (sortColumn === 'client') {
          fallbackQuery.order('client(company_name)', { ascending: sortDirection === 'asc' });
        } else if (sortColumn === 'id') {
          fallbackQuery.order('id', { ascending: sortDirection === 'asc' });
        } else {
          fallbackQuery.order(sortColumn, { ascending: sortDirection === 'asc' });
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        
        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          throw fallbackError;
        }

        // Enrich with product data manually
        if (fallbackData) {
          const enrichedData = await Promise.all(
            fallbackData.map(async (order) => {
              if (order.items && order.items.length > 0) {
                const productIds = order.items.map((item: any) => item.product_id).filter(Boolean);
                
                if (productIds.length > 0) {
                  const { data: products } = await supabase
                    .from('catalog')
                    .select('id, name, image_url')
                    .in('id', productIds);

                  const enrichedItems = order.items.map((item: any) => ({
                    ...item,
                    product: products?.find((p: any) => p.id === item.product_id) || {
                      id: item.product_id,
                      name: `Produit #${item.product_id}`,
                      image_url: null
                    }
                  }));

                  return {
                    ...order,
                    items: enrichedItems
                  };
                }
              }
              
              return order;
            })
          );
          
          console.log("Enriched sales invoices data:", enrichedData);
          return enrichedData;
        }
        
        return [];
      }
      
      console.log("Sales invoices data:", data);
      return data || [];
    }
  });

  return {
    invoices,
    isLoading,
    refetch,
    showUnpaidOnly
  };
}
