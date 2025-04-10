
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreateUserData } from "../types";

export const createAuthUser = async (data: CreateUserData): Promise<string | null> => {
  try {
    // Normalize the email
    const normalizedEmail = data.email.toLowerCase().trim();
    
    console.log("Création du compte Auth pour:", normalizedEmail);
    
    // Vérifier si un utilisateur Auth existe déjà avec cet email
    try {
      const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserByEmail(normalizedEmail);
      
      if (!checkError && existingUser) {
        console.log("Utilisateur Auth existant trouvé:", existingUser.user.email);
        // Utilisateur Auth existant, mais pas encore dans internal_users
        return existingUser.user.id;
      }
    } catch (error) {
      console.log("Vérification utilisateur Auth existant impossible (permissions):", error);
    }
    
    // Création d'un nouvel utilisateur Auth
    const { data: newAuthData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: data.password,
      email_confirm: true,
      user_metadata: { 
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role
      }
    });
    
    if (authError) {
      console.error("Erreur lors de la création de l'utilisateur Auth:", authError);
      
      // Si l'erreur est que l'utilisateur existe déjà, essayons de le récupérer
      if (authError.message.includes("already exists")) {
        try {
          const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserByEmail(normalizedEmail);
          
          if (!checkError && existingUser) {
            console.log("Utilisateur Auth déjà existant récupéré:", existingUser.user.email);
            return existingUser.user.id;
          }
        } catch (error) {
          console.log("Récupération utilisateur Auth existant impossible (permissions):", error);
        }
      }
      
      toast({
        title: "Erreur",
        description: "Impossible de créer l'utilisateur: " + authError.message,
        variant: "destructive",
      });
      return null;
    }
    
    if (!newAuthData.user) {
      console.error("Échec de création du compte Auth");
      toast({
        title: "Erreur",
        description: "Échec de création du compte utilisateur",
        variant: "destructive",
      });
      return null;
    }
    
    console.log("Utilisateur Auth créé avec succès:", newAuthData.user.id);
    return newAuthData.user.id;
  } catch (error) {
    console.error("Erreur lors de la création du compte Auth:", error);
    return null;
  }
};
