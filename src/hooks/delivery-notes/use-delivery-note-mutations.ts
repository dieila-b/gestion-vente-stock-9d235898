
import { useToast } from "@/components/ui/use-toast";
import { db } from "@/utils/db-adapter";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export function useDeliveryNoteMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    try {
      // Get delivery note purchase order ID first
      const deliveryNote = await db.query<{ purchase_order_id: string }>(
        'delivery_notes',
        query => query
          .select('purchase_order_id')
          .eq('id', id)
          .single()
      );

      if (!deliveryNote) {
        throw new Error("Delivery note not found");
      }

      // Soft delete the delivery note
      const updateResult = await db.update(
        'delivery_notes',
        { deleted: true },
        'id',
        id
      );

      if (!updateResult) {
        throw new Error("Failed to delete delivery note");
      }

      // If there's a purchase order, update its status
      if (deliveryNote.purchase_order_id) {
        await db.update(
          'purchase_orders',
          { 
            status: 'pending',
            delivery_note_id: null
          },
          'id',
          deliveryNote.purchase_order_id
        );
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
      // Update each item's quantity_received
      for (const item of items) {
        await db.update(
          'delivery_note_items',
          { quantity_received: item.quantity_received },
          'id',
          item.id
        );
      }

      // Update the delivery note status
      await db.update(
        'delivery_notes',
        { 
          status: 'received',
          warehouse_id: warehouseId,
          updated_at: new Date().toISOString()
        },
        'id',
        noteId
      );

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
