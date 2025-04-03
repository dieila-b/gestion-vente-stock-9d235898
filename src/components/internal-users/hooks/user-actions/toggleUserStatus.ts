
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";

export const toggleUserStatus = async (user: InternalUser): Promise<boolean> => {
  try {
    const newStatus = !user.is_active;
    const { error } = await supabase
      .from("internal_users")
      .update({ is_active: newStatus })
      .eq("id", user.id);

    if (error) throw error;

    toast({
      title: "Statut mis à jour",
      description: `L'utilisateur est maintenant ${newStatus ? "actif" : "inactif"}`,
    });

    return true;
  } catch (error) {
    console.error("Error toggling user status:", error);
    toast({
      title: "Erreur",
      description: "Impossible de modifier le statut de l'utilisateur",
      variant: "destructive",
    });
    return false;
  }
};
