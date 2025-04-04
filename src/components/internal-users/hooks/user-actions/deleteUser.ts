
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InternalUser } from "@/types/internal-user";

export const deleteUser = async (user: InternalUser): Promise<boolean> => {
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

    // Effectuer la suppression réelle
    const { error: deleteError } = await supabase
      .from("internal_users")
      .delete()
      .eq("id", user.id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur: " + deleteError.message,
        variant: "destructive",
      });
      return false;
    }

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
