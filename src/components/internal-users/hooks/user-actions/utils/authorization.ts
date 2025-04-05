
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const checkUserPermissions = async (requiredRoles: string[] = ['admin', 'manager']): Promise<boolean> => {
  try {
    // En mode développement, toujours autoriser
    if (import.meta.env.DEV) {
      console.log("Mode développement: Autorisation automatique accordée");
      return true;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Aucun utilisateur connecté");
      return false;
    }
    
    console.log("Vérification des permissions pour l'utilisateur:", user.id);
    
    const { data: userData, error: roleCheckError } = await supabase
      .from("internal_users")
      .select("role")
      .eq('id', user.id)
      .single();
      
    if (roleCheckError) {
      console.error("Erreur lors de la vérification du rôle:", roleCheckError);
      toast({
        title: "Permissions insuffisantes",
        description: "Impossible de vérifier votre rôle. Contactez l'administrateur.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!userData || !requiredRoles.includes(userData.role)) {
      console.log("Utilisateur sans permissions suffisantes:", userData?.role);
      toast({
        title: "Permissions insuffisantes",
        description: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
        variant: "destructive",
      });
      return false;
    }
    
    console.log("Utilisateur autorisé avec le rôle:", userData.role);
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    return false;
  }
};
