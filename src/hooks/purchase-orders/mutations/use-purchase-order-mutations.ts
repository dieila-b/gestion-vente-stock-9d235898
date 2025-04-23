
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PurchaseOrder } from "@/types/purchase-order";

export function usePurchaseOrderMutations() {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Approving purchase order:", id);
      
      try {
        // Mettre à jour le statut du bon de commande
        const { error } = await supabase
          .from('purchase_orders')
          .update({ status: 'approved' })
          .eq('id', id);
        
        if (error) {
          console.error("Error updating purchase order status:", error);
          throw error;
        }
        
        console.log("Purchase order status updated successfully");
        
        return id;
      } catch (error: any) {
        console.error("Error in approve mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande approuvé");
    },
    onError: (error: Error) => {
      console.error('Approval error:', error);
      toast.error(`Erreur lors de l'approbation: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm("Êtes-vous sûr de vouloir supprimer ce bon de commande?")) {
        return false;
      }
      
      console.log("Deleting purchase order:", id);
      try {
        const { error } = await supabase
          .from('purchase_orders')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error("Error deleting purchase order:", error);
          throw error;
        }
        
        console.log("Purchase order deleted successfully");
        return true;
      } catch (error: any) {
        console.error("Error in delete mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande supprimé");
    },
    onError: (error: Error) => {
      console.error('Delete error:', error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  const createMutation = useMutation({
    mutationFn: async (orderData: Partial<PurchaseOrder>) => {
      console.log("Creating purchase order:", orderData);
      try {
        const { data, error } = await supabase
          .from('purchase_orders')
          .insert(orderData)
          .select()
          .single();
        
        if (error) {
          console.error("Error creating purchase order:", error);
          throw error;
        }
        
        console.log("Purchase order created successfully:", data);
        return data;
      } catch (error: any) {
        console.error("Error in create mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Bon de commande créé avec succès");
    },
    onError: (error: Error) => {
      console.error('Create error:', error);
      toast.error(`Erreur lors de la création: ${error.message}`);
    }
  });

  // Create wrapper functions with correct signature type
  const handleApprove = (id: string) => approveMutation.mutate(id);
  const handleDelete = (id: string) => deleteMutation.mutate(id);
  const handleCreate = (orderData: Partial<PurchaseOrder>) => createMutation.mutate(orderData);

  return {
    handleApprove,
    handleDelete,
    handleCreate
  };
}
