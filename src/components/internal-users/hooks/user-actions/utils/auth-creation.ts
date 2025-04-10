
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreateUserData, SupabaseUser } from "../types";

export const createAuthUser = async (data: CreateUserData): Promise<string | null> => {
  try {
    // Normalize the email
    const normalizedEmail = data.email.toLowerCase().trim();
    
    console.log("Création du compte Auth pour:", normalizedEmail);
    
    // Vérifier si un utilisateur Auth existe déjà avec cet email
    try {
      // Get all users and filter the results manually since filter param isn't supported in the type
      const { data: authUsersData, error: searchError } = await supabase.auth.admin.listUsers();
      
      if (!searchError && authUsersData) {
        // Find user with matching email
        const existingUser = authUsersData.users.find((user: SupabaseUser) => {
          // Make sure to check if email exists before comparing
          return user.email && user.email.toLowerCase().trim() === normalizedEmail;
        });
        
        if (existingUser) {
          console.log("Utilisateur Auth existant trouvé:", existingUser.email);
          // Utilisateur Auth existant, mais pas encore dans internal_users
          return existingUser.id;
        }
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
          // Get all users and filter manually
          const { data: authUsersData, error: searchError } = await supabase.auth.admin.listUsers();
          
          if (!searchError && authUsersData) {
            // Find user with matching email
            const existingUser = authUsersData.users.find((user: SupabaseUser) => {
              // Make sure to check if email exists before comparing
              return user.email && user.email.toLowerCase().trim() === normalizedEmail;
            });
            
            if (existingUser) {
              console.log("Utilisateur Auth déjà existant récupéré:", existingUser.email);
              return existingUser.id;
            }
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
