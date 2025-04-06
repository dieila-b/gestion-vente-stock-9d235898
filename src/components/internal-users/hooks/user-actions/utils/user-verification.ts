
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { SupabaseUser } from "../types";

export const checkIfUserExists = async (email: string): Promise<boolean> => {
  try {
    // Normalize email first for all checks
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Vérification d'existence pour email:", normalizedEmail);
    
    // En mode développement, vérifier dans localStorage
    if (import.meta.env.DEV) {
      console.log("Mode développement: Vérification d'existence pour email:", normalizedEmail);
      
      try {
        // S'assurer que nous avons des utilisateurs dans le localStorage
        const storedUsers = localStorage.getItem('internalUsers');
        
        if (!storedUsers) {
          // Créer des utilisateurs par défaut si inexistants
          const defaultUsers = [
            {
              id: "dev-1743844624581",
              first_name: "Dieila",
              last_name: "Barry",
              email: "wosyrab@gmail.com",
              phone: "623268781",
              address: "Matam",
              role: "admin",
              is_active: true,
              photo_url: null
            },
            {
              id: "dev-1743853323494",
              first_name: "Dieila",
              last_name: "Barry",
              email: "wosyrab@yahoo.fr",
              phone: "623268781",
              address: "Madina",
              role: "manager",
              is_active: true,
              photo_url: null
            }
          ];
          localStorage.setItem('internalUsers', JSON.stringify(defaultUsers));
          console.log("Utilisateurs démo créés pour la vérification");
          
          // Vérifier si l'email correspond à l'un des utilisateurs par défaut
          const existingUser = defaultUsers.some(user => 
            user.email.toLowerCase().trim() === normalizedEmail
          );
          
          if (existingUser) {
            console.log("Utilisateur existant trouvé dans les utilisateurs par défaut:", normalizedEmail);
            toast({
              title: "Erreur",
              description: "Un utilisateur avec cet email existe déjà",
              variant: "destructive",
            });
            return true;
          }
          
          console.log("Aucun utilisateur existant trouvé dans les utilisateurs par défaut pour:", normalizedEmail);
          return false;
        }
        
        // Vérifier dans les utilisateurs existants
        const users = JSON.parse(storedUsers);
        
        const existingUser = users.some((user: any) => 
          user.email && user.email.toLowerCase().trim() === normalizedEmail
        );
        
        if (existingUser) {
          console.log("Utilisateur existant trouvé dans les données de démonstration:", normalizedEmail);
          toast({
            title: "Erreur",
            description: "Un utilisateur avec cet email existe déjà",
            variant: "destructive",
          });
          return true;
        }
        
        console.log("Aucun utilisateur existant trouvé dans les données de démonstration pour:", normalizedEmail);
        return false;
      } catch (err) {
        console.error("Erreur lors de la vérification dans les données localStorage:", err);
      }
      
      // Par défaut en mode développement, permettre la création
      return false;
    }
    
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
    
    // Vérifier si l'utilisateur existe dans auth.users
    try {
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Erreur lors de la vérification dans auth.users:", authError);
        return true; // Par précaution
      }
      
      if (users && Array.isArray(users)) {
        // Vérifier si un utilisateur avec cet email existe dans auth.users
        const existingUser = users.find((user: SupabaseUser) => 
          user && user.email && user.email.toLowerCase().trim() === normalizedEmail
        );
        
        if (existingUser) {
          console.log("Utilisateur existant trouvé dans auth.users:", existingUser.email);
          toast({
            title: "Erreur",
            description: "Un utilisateur avec cet email existe déjà dans le système d'authentification",
            variant: "destructive",
          });
          return true;
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification dans auth.users:", error);
      return true; // Par précaution en cas d'erreur
    }
    
    console.log("Aucun utilisateur existant trouvé pour:", normalizedEmail);
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification d'existence:", error);
    return true; // Consider as existing on error to prevent creation
  }
};
