
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseOrder } from "@/types/purchase-order";

export function usePurchaseOrderMutations() {
  const queryClient = useQueryClient();

  const handleApprove = useMutation({
    mutationFn: async (id: string) => {
      console.log("Approving purchase order:", id);
      
      const { error } = await supabase
        .from('purchase_orders')
        .update({ status: 'approved' })
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande approuvé");
    },
    onError: (error: Error) => {
      console.error('Approval error:', error);
      toast.error("Erreur lors de l'approbation");
    }
  });

  const handleDelete = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm("Êtes-vous sûr de vouloir supprimer ce bon de commande?")) {
        return false;
      }
      
      console.log("Deleting purchase order:", id);
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande supprimé");
    },
    onError: (error: Error) => {
      console.error('Delete error:', error);
      toast.error("Erreur lors de la suppression");
    }
  });

  const handleCreate = useMutation({
    mutationFn: async (orderData: Partial<PurchaseOrder>) => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .insert(orderData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande créé avec succès");
    },
    onError: (error: Error) => {
      console.error('Create error:', error);
      toast.error("Erreur lors de la création");
    }
  });

  return {
    handleApprove,
    handleDelete,
    handleCreate
  };
}
