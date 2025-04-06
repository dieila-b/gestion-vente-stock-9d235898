
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SupabaseUser } from "../types";

export const checkIfUserExists = async (email: string): Promise<boolean> => {
  try {
    // En mode développement, vérifier dans localStorage
    if (import.meta.env.DEV) {
      console.log("Mode développement: Vérification d'existence pour email:", email);
      
      try {
        const storedUsers = localStorage.getItem('internalUsers');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const normalizedEmail = email.toLowerCase().trim();
          
          const existingUser = users.some((user: any) => 
            user.email && user.email.toLowerCase().trim() === normalizedEmail
          );
          
          if (existingUser) {
            console.log("Utilisateur existant trouvé dans les données de démonstration:", email);
            toast({
              title: "Erreur",
              description: "Un utilisateur avec cet email existe déjà",
              variant: "destructive",
            });
            return true;
          }
          
          console.log("Aucun utilisateur existant trouvé dans les données de démonstration pour:", email);
          return false;
        }
      } catch (err) {
        console.error("Erreur lors de la vérification dans les données localStorage:", err);
      }
      
      // Par défaut en mode développement, permettre la création
      return false;
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Vérification d'existence pour email:", normalizedEmail);
    
    // Méthode plus fiable pour vérifier l'existence d'un utilisateur
    const { data, error } = await supabase
      .from('internal_users')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle();
    
    if (error) {
      console.error("Erreur lors de la vérification dans internal_users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier si l'utilisateur existe déjà: " + error.message,
        variant: "destructive",
      });
      return true; // Consider as existing on error to prevent creation
    }
    
    if (data) {
      console.log("Utilisateur existant trouvé dans internal_users:", data.email);
      toast({
        title: "Erreur",
        description: "Un utilisateur avec cet email existe déjà",
        variant: "destructive",
      });
      return true;
    }
    
    // Si aucune correspondance dans la table internal_users, vérifiez aussi auth.users
    // C'est important pour éviter les conflits entre auth et base de données
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error("Erreur lors de la vérification dans auth.users:", authError);
      return true; // Par précaution
    }
    
    if (authData && Array.isArray(authData.users)) {
      // Vérifier si un utilisateur avec cet email existe dans auth.users
      const existingUser = authData.users.find((user: SupabaseUser) => 
        user && user.email && user.email.toLowerCase().trim() === normalizedEmail
      );
      
      if (existingUser) {
        console.log("Utilisateur existant trouvé dans auth.users:", existingUser.email);
        return true;
      }
    }
    
    console.log("Aucun utilisateur existant trouvé pour:", normalizedEmail);
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification d'existence:", error);
    return true; // Consider as existing on error to prevent creation
  }
};
