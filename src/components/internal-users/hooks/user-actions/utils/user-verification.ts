
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SupabaseUser } from "../types";

export const checkIfUserExists = async (email: string): Promise<boolean> => {
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if the user already exists in Auth
    const { data: authData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("Erreur lors de la vérification des utilisateurs existants:", listError);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier si l'utilisateur existe déjà: " + listError.message,
        variant: "destructive",
      });
      return true; // Consider as existing on error to prevent creation
    }
    
    // Validate user data from listUsers
    if (!authData || !Array.isArray(authData.users)) {
      console.error("Données utilisateurs invalides retournées par listUsers");
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les utilisateurs existants",
        variant: "destructive",
      });
      return true; // Consider as existing on error to prevent creation
    }
    
    // Check if a user with this email already exists
    const existingUser = authData.users.find((user: SupabaseUser) => {
      return user && typeof user === 'object' && user.email && 
             user.email.toLowerCase().trim() === normalizedEmail;
    });
    
    if (existingUser) {
      console.error("L'utilisateur existe déjà dans Auth:", normalizedEmail);
      toast({
        title: "Erreur",
        description: "Un utilisateur avec cet email existe déjà",
        variant: "destructive",
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification d'existence:", error);
    return true; // Consider as existing on error to prevent creation
  }
};
