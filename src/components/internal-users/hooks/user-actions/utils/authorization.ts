
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const checkUserPermissions = async (requiredRoles: string[] = ['admin', 'manager']): Promise<boolean> => {
  try {
    // Get current user from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Aucun utilisateur connecté");
      return false;
    }
    
    console.log("Vérification des permissions pour l'utilisateur:", user.id, user.email);
    
    // First try to find user by email
    let userDataByEmail = null;
    let userDataById = null;
    
    if (user.email) {
      const { data: emailData, error: emailError } = await supabase
        .from("internal_users")
        .select("role, is_active")
        .eq('email', user.email.toLowerCase())
        .maybeSingle();
      
      if (!emailError && emailData) {
        console.log("Utilisateur trouvé par email:", user.email);
        userDataByEmail = emailData;
      } else {
        console.log("Utilisateur non trouvé par email, erreur:", emailError?.message || "Aucun utilisateur trouvé");
      }
    }
    
    // If not found by email, try by ID
    if (!userDataByEmail) {
      const { data: idData, error: idError } = await supabase
        .from("internal_users")
        .select("role, is_active")
        .eq('id', user.id)
        .maybeSingle();
      
      if (!idError && idData) {
        console.log("Utilisateur trouvé par ID:", user.id);
        userDataById = idData;
      } else {
        console.log("Utilisateur non trouvé par ID, erreur:", idError?.message || "Aucun utilisateur trouvé");
      }
    }
    
    // Use data found by either method
    const userData = userDataByEmail || userDataById;
    
    if (!userData) {
      console.log("Aucun utilisateur interne trouvé pour cet email ou ID");
      toast({
        title: "Permissions insuffisantes",
        description: "Votre compte n'est pas associé à un utilisateur interne.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!userData.is_active) {
      console.log("Le compte utilisateur est désactivé");
      toast({
        title: "Compte désactivé",
        description: "Votre compte est désactivé. Contactez l'administrateur.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!requiredRoles.includes(userData.role)) {
      console.log("Utilisateur sans permissions suffisantes:", userData.role);
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
