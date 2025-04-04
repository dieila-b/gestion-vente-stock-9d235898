
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InternalUser } from "@/types/internal-user";

export const toggleUserStatus = async (user: InternalUser): Promise<boolean> => {
  try {
    // Vérifier les autorisations
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (currentUser) {
      const { data: userData, error: roleCheckError } = await supabase
        .from("internal_users")
        .select("role")
        .eq("id", currentUser.id)
        .single();
        
      if (roleCheckError || !userData || !['admin', 'manager'].includes(userData.role)) {
        toast({
          title: "Permissions insuffisantes",
          description: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
          variant: "destructive",
        });
        return false;
      }
    }

    // Effectuer la mise à jour réelle
    const { error: updateError } = await supabase
      .from("internal_users")
      .update({ is_active: !user.is_active })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error toggling user status:", updateError);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'utilisateur: " + updateError.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Statut modifié",
      description: `${user.first_name} ${user.last_name} est maintenant ${user.is_active ? 'inactif' : 'actif'}`,
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
