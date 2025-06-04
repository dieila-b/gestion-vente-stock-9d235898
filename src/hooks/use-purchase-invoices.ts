
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { PurchaseInvoice } from "@/types/PurchaseInvoice";

export function usePurchaseInvoices() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query to fetch purchase invoices with improved error handling
  const { data: invoices = [], isLoading, error, refetch } = useQuery({
    queryKey: ['purchase-invoices'],
    queryFn: async () => {
      console.log("Fetching purchase invoices...");
      
      try {
        const { data, error } = await supabase
          .from('purchase_invoices')
          .select(`
            *,
            supplier:suppliers!purchase_invoices_supplier_id_fkey(
              id,
              name,
              phone,
              email
            ),
            purchase_order:purchase_orders!purchase_invoices_purchase_order_id_fkey(
              id,
              order_number
            ),
            delivery_note:delivery_notes!purchase_invoices_delivery_note_id_fkey(
              id,
              delivery_number
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching purchase invoices:', error);
          
          // Fallback query with simpler structure
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('purchase_invoices')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (fallbackError) {
            console.error('Fallback query also failed:', fallbackError);
            throw fallbackError;
          }
          
          if (fallbackData) {
            // Enrich with related data manually
            const enrichedData = await Promise.all(
              fallbackData.map(async (invoice) => {
                let supplier = null;
                let purchase_order = null;
                let delivery_note = null;
                
                // Fetch supplier data
                if (invoice.supplier_id) {
                  const { data: supplierData } = await supabase
                    .from('suppliers')
                    .select('id, name, phone, email')
                    .eq('id', invoice.supplier_id)
                    .single();
                  
                  supplier = supplierData;
                }
                
                // Fetch purchase order data
                if (invoice.purchase_order_id) {
                  const { data: orderData } = await supabase
                    .from('purchase_orders')
                    .select('id, order_number')
                    .eq('id', invoice.purchase_order_id)
                    .single();
                  
                  purchase_order = orderData;
                }
                
                // Fetch delivery note data
                if (invoice.delivery_note_id) {
                  const { data: deliveryData } = await supabase
                    .from('delivery_notes')
                    .select('id, delivery_number')
                    .eq('id', invoice.delivery_note_id)
                    .single();
                  
                  delivery_note = deliveryData;
                }
                
                return {
                  ...invoice,
                  supplier,
                  purchase_order,
                  delivery_note
                };
              })
            );
            
            console.log("Enriched purchase invoices data:", enrichedData);
            return enrichedData;
          }
          
          return [];
        }
        
        console.log("Purchase invoices data:", data);
        return data || [];
      } catch (error) {
        console.error('Error in purchase invoices query:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Log errors if they occur
  if (error) {
    console.error('Purchase invoices query error:', error);
  }

  // Handle view
  const handleView = (id: string) => {
    navigate(`/purchase-invoices/${id}`);
  };

  // Handle delete
  const { mutate: deleteInvoice } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('purchase_invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-invoices'] });
      toast.success("Facture supprimée");
    },
    onError: (error: any) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette facture?")) {
      deleteInvoice(id);
    }
  };

  return {
    invoices,
    isLoading,
    error,
    refetch,
    handleView,
    handleDelete
  };
}
