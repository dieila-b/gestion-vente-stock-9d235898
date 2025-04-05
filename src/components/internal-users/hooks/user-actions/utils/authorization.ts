
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const checkUserPermissions = async (requiredRoles: string[] = ['admin', 'manager']): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    const { data: userData, error: roleCheckError } = await supabase
      .from("internal_users")
      .select("role")
      .eq('id', user.id)
      .single();
      
    if (roleCheckError || !userData || !requiredRoles.includes(userData.role)) {
      toast({
        title: "Permissions insuffisantes",
        description: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    return false;
  }
};
