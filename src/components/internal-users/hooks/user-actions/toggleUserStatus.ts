
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InternalUser } from "@/types/internal-user";

// Clé pour stocker les utilisateurs dans le localStorage en mode développement
const DEV_USERS_STORAGE_KEY = "internalUsers";

export const toggleUserStatus = async (user: InternalUser): Promise<boolean> => {
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
          
        if (roleCheckError || !userData || !['admin', 'manager'].includes(userData.role)) {
          toast({
            title: "Permissions insuffisantes",
            description: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
            variant: "destructive",
          });
          return false;
        }
      }
    }

    // En mode développement, simuler la mise à jour et mettre à jour le localStorage
    if (isDevelopmentMode) {
      const storedUsers = localStorage.getItem(DEV_USERS_STORAGE_KEY);
      
      if (storedUsers) {
        const users = JSON.parse(storedUsers) as InternalUser[];
        const updatedUsers = users.map(u => 
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        );
        
        localStorage.setItem(DEV_USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      }
      
      toast({
        title: "Statut modifié (mode développeur)",
        description: `Statut de l'utilisateur ${user.first_name} ${user.last_name} mis à jour`,
      });
      
      return true;
    }

    // Mise à jour en base de données pour la production
    const { error } = await supabase
      .from("internal_users")
      .update({ is_active: !user.is_active })
      .eq("id", user.id);

    if (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'utilisateur: " + error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Statut modifié",
      description: `Statut de l'utilisateur ${user.first_name} ${user.last_name} mis à jour`,
    });
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la modification du statut:", error);
    toast({
      title: "Erreur",
      description: "Impossible de modifier le statut de l'utilisateur",
      variant: "destructive",
    });
    return false;
  }
};
