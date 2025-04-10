
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const checkUserPermissions = async (requiredRoles: string[] = ['admin', 'manager']): Promise<boolean> => {
  try {
    // En mode développement, toujours autoriser
    if (import.meta.env.DEV) {
      console.log("Mode développement: Autorisation automatique accordée");
      
      // En développement, essayons de récupérer l'utilisateur actuel
      try {
        const currentUser = localStorage.getItem('currentUser');
        
        if (currentUser) {
          const user = JSON.parse(currentUser);
          console.log("Utilisateur actuel trouvé dans localStorage:", user);
          
          // Vérifier si l'utilisateur a un rôle approprié
          if (user.role && requiredRoles.includes(user.role)) {
            console.log("Utilisateur avec rôle approprié:", user.role);
            return true;
          }
          
          console.log("Utilisateur sans rôle approprié:", user.role);
          return false;
        }
        
        // Si aucun utilisateur actuel, vérifier dans les utilisateurs démo
        const storedUsers = localStorage.getItem('internalUsers');
        if (storedUsers) {
          console.log("Données utilisateurs récupérées du localStorage:", storedUsers);
          
          // Simuler une vérification des rôles en utilisant le premier utilisateur qui a un rôle requis
          const users = JSON.parse(storedUsers);
          const eligibleUser = users.find((user: any) => requiredRoles.includes(user.role));
          
          if (eligibleUser) {
            console.log("Utilisateur avec rôle approprié trouvé dans les données de démonstration:", eligibleUser.role);
            
            // Définir cet utilisateur comme utilisateur actuel
            localStorage.setItem('currentUser', JSON.stringify(eligibleUser));
            return true;
          } else {
            console.log("Aucun utilisateur avec le rôle requis trouvé dans les données de démonstration.");
            return false;
          }
        } else {
          console.log("Aucune donnée utilisateur trouvée dans localStorage");
          // Si aucun utilisateur n'existe, créons-en par défaut
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
          console.log("Données utilisateurs par défaut créées pour le mode développement");
          
          // Définir le premier utilisateur comme utilisateur actuel
          localStorage.setItem('currentUser', JSON.stringify(defaultUsers[0]));
          return true;
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données localStorage:", err);
      }
      
      return true;
    }
    
    // En production, vérifier l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Aucun utilisateur connecté");
      return false;
    }
    
    console.log("Vérification des permissions pour l'utilisateur:", user.id);
    
    // Vérifier si l'utilisateur existe dans internal_users et a le rôle approprié
    const { data: userData, error: roleCheckError } = await supabase
      .from("internal_users")
      .select("role, is_active")
      .eq('id', user.id)
      .single();
      
    if (roleCheckError) {
      console.error("Erreur lors de la vérification du rôle:", roleCheckError);
      toast({
        title: "Permissions insuffisantes",
        description: "Impossible de vérifier votre rôle. Contactez l'administrateur.",
        variant: "destructive",
      });
      return false;
    }
    
    // Vérifier si l'utilisateur est actif
    if (!userData || !userData.is_active) {
      console.log("Utilisateur inactif:", user.id);
      toast({
        title: "Compte désactivé",
        description: "Votre compte a été désactivé. Contactez l'administrateur.",
        variant: "destructive",
      });
      return false;
    }
    
    // Vérifier si l'utilisateur a un des rôles requis
    if (!userData || !requiredRoles.includes(userData.role)) {
      console.log("Utilisateur sans permissions suffisantes:", userData?.role);
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
