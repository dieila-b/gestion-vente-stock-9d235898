
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { PurchaseInvoice } from "@/types/PurchaseInvoice";

export function usePurchaseInvoices() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query to fetch purchase invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['purchase-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_invoices')
        .select(`
          *,
          supplier:suppliers(*),
          purchase_order:purchase_orders(*),
          delivery_note:delivery_notes(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

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
    handleView,
    handleDelete
  };
}
