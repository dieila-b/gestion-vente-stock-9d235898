
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InternalUser } from "@/types/internal-user";

export const toggleUserStatus = async (user: InternalUser): Promise<boolean> => {
  try {
    // En mode développement, simuler la bascule de statut
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode: Simulating user status toggle");
      
      // Récupérer les utilisateurs stockés
      const storageKey = "internal_users_dev_data";
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        try {
          const storedUsers = JSON.parse(storedData);
          // Mettre à jour le statut de l'utilisateur
          const updatedUsers = storedUsers.map((u: InternalUser) => {
            if (u.id === user.id) {
              return { ...u, is_active: !u.is_active };
            }
            return u;
          });
          // Mettre à jour le localStorage
          localStorage.setItem(storageKey, JSON.stringify(updatedUsers));
        } catch (error) {
          console.error("Erreur lors de la manipulation des données localStorage:", error);
        }
      }
      
      toast({
        title: "Statut modifié",
        description: `${user.first_name} ${user.last_name} est maintenant ${user.is_active ? 'inactif' : 'actif'}`,
      });
      
      return true;
    }

    // En production, vérifier les autorisations
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

    // En production, effectuer la mise à jour réelle
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
