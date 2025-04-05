
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreateUserData } from "../types";

export const createAuthUser = async (data: CreateUserData): Promise<string | null> => {
  try {
    // Normalize the email
    const normalizedEmail = data.email.toLowerCase().trim();
    
    console.log("Création du compte Auth pour:", normalizedEmail);
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
