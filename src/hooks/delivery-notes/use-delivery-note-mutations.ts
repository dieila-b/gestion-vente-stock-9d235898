
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function useDeliveryNoteMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    try {
      const { data: deliveryNote, error: fetchError } = await supabase
        .from('delivery_notes')
        .select('purchase_order_id')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error: deleteError } = await supabase
        .from('delivery_notes')
        .update({ deleted: true })
        .eq('id', id);

      if (deleteError) throw deleteError;

      if (deliveryNote?.purchase_order_id) {
        const { error: updateError } = await supabase
          .from('purchase_orders')
          .update({ 
            status: 'pending',
            delivery_note_id: null
          })
          .eq('id', deliveryNote.purchase_order_id);

        if (updateError) throw updateError;
      }

      toast({
        title: "Bon de livraison supprimé",
        description: "Le bon de livraison a été supprimé avec succès et le bon de commande a été réactivé"
      });

      await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    } catch (error) {
      console.error("Error deleting delivery note:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive"
      });
    }
  };

  const handleApprove = async (noteId: string, warehouseId: string, items: Array<{ id: string; quantity_received: number }>) => {
    try {
      for (const item of items) {
        const { error: itemError } = await supabase
          .from('delivery_note_items')
          .update({ quantity_received: item.quantity_received })
          .eq('id', item.id);

        if (itemError) throw itemError;
      }

      const { error: noteError } = await supabase
        .from('delivery_notes')
        .update({ 
          status: 'received',
          warehouse_id: warehouseId,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      if (noteError) throw noteError;

      toast({
        title: "Bon de livraison approuvé",
        description: "Le bon de livraison a été approuvé avec succès"
      });

      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
    } catch (error) {
      console.error("Error in handleApprove:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'approbation",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (id: string) => {
    try {
      navigate(`/delivery-notes/edit/${id}`);
    } catch (error) {
      console.error("Error navigating to edit page:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la page d'édition",
        variant: "destructive"
      });
    }
  };

  return {
    handleDelete,
    handleApprove,
    handleEdit
  };
}
