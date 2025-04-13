
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { toast } from "sonner";

export function useDeleteUser(user: User, onClose: (open: boolean) => void) {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('internal_users')
        .delete()
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Refresh internal users data
      await queryClient.invalidateQueries({ queryKey: ['internal-users'] });
      
      // Success message
      toast.success("Utilisateur supprimé avec succès");
      onClose(false);
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast.error(`Erreur: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    handleDelete
  };
}
