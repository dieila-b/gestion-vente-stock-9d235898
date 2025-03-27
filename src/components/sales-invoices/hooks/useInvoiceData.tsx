
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
      let query = supabase
        .from('orders')
        .select(`
          *,
          client:clients(
            id, 
            company_name, 
            email, 
            phone, 
            address, 
            client_code,
            contact_name,
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
            product:products(
              id,
              name,
              image
            )
          )
        `);

      if (showUnpaidOnly) {
        query = query.in('payment_status', ['pending', 'partial']);
      }

      if (sortColumn === 'client') {
        query = query.order('client(company_name)', { ascending: sortDirection === 'asc' });
      } else if (sortColumn === 'id') {
        query = query.order('id', { ascending: sortDirection === 'asc' });
      } else {
        query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      }
      
      return data;
    }
  });

  return {
    invoices,
    isLoading,
    refetch,
    showUnpaidOnly
  };
}
