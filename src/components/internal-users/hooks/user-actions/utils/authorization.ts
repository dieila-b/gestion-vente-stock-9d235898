
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Vérifie si l'utilisateur actuel a les permissions nécessaires
export const checkUserPermissions = async (allowedRoles: string[]): Promise<boolean> => {
  try {
    // Obtenir l'utilisateur authentifié actuel
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Erreur d'authentification:", authError);
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      });
      return false;
    }

    // Vérifier si l'utilisateur est dans la table internal_users
    const { data: userData, error: userError } = await supabase
      .from("internal_users")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (userError || !userData) {
      console.error("Erreur lors de la vérification des permissions:", userError);
      toast({
        title: "Permissions insuffisantes",
        description: "Vous n'avez pas les droits nécessaires pour effectuer cette action",
        variant: "destructive",
      });
      return false;
    }
    
    // Vérifier si le rôle de l'utilisateur est dans les rôles autorisés
    if (!allowedRoles.includes(userData.role)) {
      console.error("Rôle non autorisé:", userData.role, "Rôles autorisés:", allowedRoles);
      toast({
        title: "Permissions insuffisantes",
        description: "Vous n'avez pas les droits nécessaires pour effectuer cette action",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de la vérification des permissions",
      variant: "destructive",
    });
    return false;
  }
};
