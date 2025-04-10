
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
              email: "dielabarry@outlook.com",
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
            },
            {
              id: "dev-1743853323495",
              first_name: "Dieila",
              last_name: "Barry",
              email: "wosyrab@gmail.com",
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
    
    // Méthode plus fiable pour vérifier l'existence d'un utilisateur dans internal_users
    console.log("Vérification dans la base de données pour:", normalizedEmail);
    const { data, error } = await supabase
      .from('internal_users')
      .select('id, email, is_active')
      .eq('email', normalizedEmail)
      .limit(1);
    
    if (error) {
      console.error("Erreur lors de la vérification dans internal_users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier si l'utilisateur existe déjà: " + error.message,
        variant: "destructive",
      });
      return true; // Consider as existing on error to prevent creation
    }
    
    console.log("Résultat de la vérification internalUsers (eq):", data);
    
    if (data && data.length > 0) {
      console.log("Utilisateur existant trouvé dans internal_users:", data[0].email, "Active:", data[0].is_active);
      toast({
        title: "Erreur",
        description: "Un utilisateur avec cet email existe déjà",
        variant: "destructive",
      });
      return true;
    }
    
    // Vérifier avec ilike si aucun résultat exact
    const { data: fuzzyData, error: fuzzyError } = await supabase
      .from('internal_users')
      .select('id, email, is_active')
      .ilike('email', normalizedEmail)
      .limit(1);
      
    if (fuzzyError) {
      console.error("Erreur lors de la vérification flexible dans internal_users:", fuzzyError);
    } else if (fuzzyData && fuzzyData.length > 0) {
      console.log("Utilisateur existant trouvé dans internal_users (ilike):", fuzzyData[0].email, "Active:", fuzzyData[0].is_active);
      toast({
        title: "Erreur",
        description: "Un utilisateur avec cet email existe déjà",
        variant: "destructive",
      });
      return true;
    }
    
    // Vérifier dans les utilisateurs d'authentification Supabase
    try {
      console.log("Vérification dans Supabase Auth pour:", normalizedEmail);
      // Get all users and filter manually
      const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Erreur lors de la vérification dans auth:", authError);
      }
      
      if (!authError && authUsersData) {
        // Find user with matching email
        const existingUser = authUsersData.users.find((user: SupabaseUser) => {
          // Make sure to check if email exists before comparing
          return user.email && user.email.toLowerCase().trim() === normalizedEmail;
        });
        
        if (existingUser) {
          console.log("Utilisateur existant trouvé dans auth:", existingUser.email);
          toast({
            title: "Erreur",
            description: "Un utilisateur avec cet email existe déjà dans le système d'authentification",
            variant: "destructive",
          });
          return true;
        }
      }
    } catch (error) {
      console.log("Note: La vérification dans auth.users nécessite des permissions admin");
    }
    
    console.log("Aucun utilisateur existant trouvé pour:", normalizedEmail);
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification d'existence:", error);
    return false; // Permettre la création en cas d'erreur
  }
};
