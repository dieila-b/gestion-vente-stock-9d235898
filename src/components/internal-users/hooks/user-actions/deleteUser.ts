
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InternalUser } from "@/types/internal-user";

// Clé pour stocker les utilisateurs dans le localStorage en mode développement
const DEV_USERS_STORAGE_KEY = "dev_internal_users";

export const deleteUser = async (user: InternalUser): Promise<boolean> => {
  try {
    const isDevelopmentMode = import.meta.env.DEV;
    
    // Si nous sommes en production, vérifier les autorisations
    if (!isDevelopmentMode) {
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
    }

    // En mode développement, simuler la suppression et mettre à jour le localStorage
    if (isDevelopmentMode) {
      const storedUsers = localStorage.getItem(DEV_USERS_STORAGE_KEY);
      
      if (storedUsers) {
        const users = JSON.parse(storedUsers) as InternalUser[];
        const updatedUsers = users.filter(u => u.id !== user.id);
        
        localStorage.setItem(DEV_USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      }
      
      toast({
        title: "Utilisateur supprimé (mode développeur)",
        description: `${user.first_name} ${user.last_name} a été supprimé avec succès`,
      });
      
      return true;
    }

    // Suppression en base de données pour la production
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
