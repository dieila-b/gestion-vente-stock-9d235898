
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
        
      if (roleCheckError || !userData || userData.role !== 'admin') {
        toast({
          title: "Permissions insuffisantes",
          description: "Seuls les administrateurs peuvent supprimer des utilisateurs.",
          variant: "destructive",
        });
        return false;
      }
    }

    // Suppression en base de données
    const { error } = await supabase
      .from("internal_users")
      .delete()
      .eq("id", user.id);

    if (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur: " + error.message,
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
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    toast({
      title: "Erreur",
      description: "Impossible de supprimer l'utilisateur",
      variant: "destructive",
    });
    return false;
  }
};
