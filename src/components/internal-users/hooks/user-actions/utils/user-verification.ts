
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
    
    // Vérifier d'abord si l'utilisateur existe dans auth.users
    try {
      // Get all users and filter manually since 'search' is no longer supported
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (!error && data?.users && data.users.length > 0) {
        // Filtrer manuellement les utilisateurs par email
        const existingUser = data.users.find((user: any) => 
          user && user.email && user.email.toLowerCase().trim() === normalizedEmail
        );
        
        if (existingUser) {
          console.log("Utilisateur existant trouvé dans auth.users:", existingUser.email);
          
          // Vérifier si cet utilisateur existe aussi dans internal_users
          const { data: internalUser, error: internalUserError } = await supabase
            .from('internal_users')
            .select('id')
            .eq('id', existingUser.id)
            .maybeSingle();
            
          if (!internalUserError && !internalUser) {
            console.log("Utilisateur existe dans auth mais pas dans internal_users, création autorisée");
            return false;
          }
          
          toast({
            title: "Erreur",
            description: "Un utilisateur avec cet email existe déjà dans le système d'authentification",
            variant: "destructive",
          });
          return true;
        }
      }
    } catch (error) {
      console.log("Erreur ou permission insuffisante pour vérifier auth.users, on continue avec internal_users:", error);
    }
    
    // Méthode plus fiable pour vérifier l'existence d'un utilisateur dans internal_users
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
    
    console.log("Aucun utilisateur existant trouvé pour:", normalizedEmail);
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification d'existence:", error);
    return false; // Permettre la création en cas d'erreur
  }
};
