
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
    
    // Get current user from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Aucun utilisateur connecté");
      return false;
    }
    
    console.log("Vérification des permissions pour l'utilisateur:", user.id, user.email);
    
    // First try to find user by email
    let userDataByEmail = null;
    let userDataById = null;
    
    if (user.email) {
      const { data: emailData, error: emailError } = await supabase
        .from("internal_users")
        .select("role, is_active")
        .eq('email', user.email.toLowerCase())
        .maybeSingle();
      
      if (!emailError && emailData) {
        console.log("Utilisateur trouvé par email:", user.email);
        userDataByEmail = emailData;
      } else {
        console.log("Utilisateur non trouvé par email, erreur:", emailError?.message || "Aucun utilisateur trouvé");
      }
    }
    
    // If not found by email, try by ID
    if (!userDataByEmail) {
      const { data: idData, error: idError } = await supabase
        .from("internal_users")
        .select("role, is_active")
        .eq('id', user.id)
        .maybeSingle();
      
      if (!idError && idData) {
        console.log("Utilisateur trouvé par ID:", user.id);
        userDataById = idData;
      } else {
        console.log("Utilisateur non trouvé par ID, erreur:", idError?.message || "Aucun utilisateur trouvé");
      }
    }
    
    // Use data found by either method
    const userData = userDataByEmail || userDataById;
    
    if (!userData) {
      console.log("Aucun utilisateur interne trouvé pour cet email ou ID");
      toast({
        title: "Permissions insuffisantes",
        description: "Votre compte n'est pas associé à un utilisateur interne.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!userData.is_active) {
      console.log("Le compte utilisateur est désactivé");
      toast({
        title: "Compte désactivé",
        description: "Votre compte est désactivé. Contactez l'administrateur.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!requiredRoles.includes(userData.role)) {
      console.log("Utilisateur sans permissions suffisantes:", userData.role);
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
