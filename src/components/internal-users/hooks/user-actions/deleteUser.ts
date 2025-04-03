
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";

export const deleteUser = async (user: InternalUser): Promise<boolean> => {
  try {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.first_name} ${user.last_name}?`)) {
      return false;
    }

    const { error } = await supabase
      .from("internal_users")
      .delete()
      .eq("id", user.id);

    if (error) throw error;

    toast({
      title: "Utilisateur supprimé",
      description: `${user.first_name} ${user.last_name} a été supprimé avec succès`,
    });

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    toast({
      title: "Erreur",
      description: "Impossible de supprimer l'utilisateur",
      variant: "destructive",
    });
    return false;
  }
};
