
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
              email: "dielabarry@outlook.com", // Ajout de cet utilisateur par défaut
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
    const { data, error } = await supabase
      .from('internal_users')
      .select('email')
      .ilike('email', normalizedEmail)  // Utilisation de ilike pour la recherche insensible à la casse
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
    
    if (data && data.length > 0) {
      console.log("Utilisateur existant trouvé dans internal_users:", data[0].email);
      toast({
        title: "Erreur",
        description: "Un utilisateur avec cet email existe déjà",
        variant: "destructive",
      });
      return true;
    }
    
    // Vérifier dans les utilisateurs d'authentification Supabase
    try {
      // Get all users and filter manually
      const { data: authUsersData, error: authError } = await supabase.auth.admin.listUsers();
      
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
