
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const checkUserPermissions = async (requiredRoles: string[] = ['admin', 'manager']): Promise<boolean> => {
  try {
    // En mode développement, toujours autoriser
    if (import.meta.env.DEV) {
      console.log("Mode développement: Autorisation automatique accordée");
      
      // En développement, essayons de récupérer les utilisateurs du localStorage
      try {
        const storedUsers = localStorage.getItem('internalUsers');
        if (storedUsers) {
          console.log("Données utilisateurs récupérées du localStorage:", storedUsers);
          
          // Simuler une vérification des rôles en utilisant le premier utilisateur qui a un rôle requis
          const users = JSON.parse(storedUsers);
          const eligibleUser = users.find((user: any) => requiredRoles.includes(user.role));
          
          if (eligibleUser) {
            console.log("Utilisateur avec rôle approprié trouvé dans les données de démonstration:", eligibleUser.role);
          } else {
            console.log("Aucun utilisateur avec le rôle requis trouvé dans les données de démonstration.");
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
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données localStorage:", err);
      }
      
      return true;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Aucun utilisateur connecté");
      return false;
    }
    
    console.log("Vérification des permissions pour l'utilisateur:", user.id);
    
    // Vérifier dans la table internal_users par email
    const { data: userDataByEmail, error: roleCheckError } = await supabase
      .from("internal_users")
      .select("role, is_active")
      .eq('email', user.email)
      .single();
      
    if (roleCheckError) {
      console.error("Erreur lors de la vérification du rôle par email:", roleCheckError);
      
      // Essayer de vérifier par ID au cas où
      const { data: userDataById, error: roleCheckErrorById } = await supabase
        .from("internal_users")
        .select("role, is_active")
        .eq('id', user.id)
        .single();
        
      if (roleCheckErrorById || !userDataById) {
        console.error("Erreur lors de la vérification du rôle par ID:", roleCheckErrorById);
        toast({
          title: "Permissions insuffisantes",
          description: "Impossible de vérifier votre rôle. Contactez l'administrateur.",
          variant: "destructive",
        });
        return false;
      }
      
      // Utiliser les données trouvées par ID
      if (userDataById) {
        // Vérifier les permissions avec les données de l'utilisateur trouvé par ID
        if (!userDataById.is_active) {
          console.log("Le compte utilisateur est désactivé");
          toast({
            title: "Compte désactivé",
            description: "Votre compte est désactivé. Contactez l'administrateur.",
            variant: "destructive",
          });
          return false;
        }
        
        if (!requiredRoles.includes(userDataById.role)) {
          console.log("Utilisateur sans permissions suffisantes:", userDataById.role);
          toast({
            title: "Permissions insuffisantes",
            description: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
            variant: "destructive",
          });
          return false;
        }
        
        console.log("Utilisateur autorisé avec le rôle:", userDataById.role);
        return true;
      }
    }
    
    // Utiliser les données trouvées par email si disponibles
    if (!userDataByEmail) {
      console.log("Aucun utilisateur interne trouvé pour cet email ou ID");
      toast({
        title: "Permissions insuffisantes",
        description: "Votre compte n'est pas associé à un utilisateur interne.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!userDataByEmail.is_active) {
      console.log("Le compte utilisateur est désactivé");
      toast({
        title: "Compte désactivé",
        description: "Votre compte est désactivé. Contactez l'administrateur.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!requiredRoles.includes(userDataByEmail.role)) {
      console.log("Utilisateur sans permissions suffisantes:", userDataByEmail.role);
      toast({
        title: "Permissions insuffisantes",
        description: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
        variant: "destructive",
      });
      return false;
    }
    
    console.log("Utilisateur autorisé avec le rôle:", userDataByEmail.role);
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    return false;
  }
};
