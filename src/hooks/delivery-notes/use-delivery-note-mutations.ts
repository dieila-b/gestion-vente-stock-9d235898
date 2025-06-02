
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeliveryNoteMutations() {
  const queryClient = useQueryClient();

  const { mutate: deleteDeliveryNote, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      console.log("🗑️ Attempting to delete delivery note:", id);
      
      // Instead of hard-deleting, mark it as deleted
      const { error } = await supabase
        .from('delivery_notes')
        .update({ deleted: true })
        .eq('id', id);
      
      if (error) {
        console.error("❌ Error deleting delivery note:", error);
        throw error;
      }
      
      console.log("✅ Delivery note marked as deleted:", id);
      return id;
    },
    onSuccess: (deletedId) => {
      console.log("✅ Successfully deleted delivery note:", deletedId);
      queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
      toast.success("Bon de livraison supprimé avec succès");
    },
    onError: (error: any) => {
      console.error("❌ Delete error:", error);
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  const handleDelete = async (id: string): Promise<boolean> => {
    console.log("🔄 Starting delete process for:", id);
    
    const confirmed = confirm("Êtes-vous sûr de vouloir supprimer ce bon de livraison ?");
    if (!confirmed) {
      console.log("❌ Deletion cancelled by user");
      return false;
    }

    try {
      console.log("✅ User confirmed deletion, proceeding...");
      deleteDeliveryNote(id);
      return true;
    } catch (error) {
      console.error("❌ Error in handleDelete:", error);
      return false;
    }
  };

  return {
    handleDelete,
    isDeleting
  };
}
