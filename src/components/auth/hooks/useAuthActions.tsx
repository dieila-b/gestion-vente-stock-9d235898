
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDevelopmentMode = import.meta.env.DEV;

  const login = async (email: string, password: string) => {
    console.log("Login attempt with email:", email);
    
    if (isDevelopmentMode) {
      console.log("Development mode: Automatic login success");
      
      try {
        // Normaliser l'email pour trouver une correspondance dans localStorage
        const normalizedEmail = email.toLowerCase().trim();
        console.log("Checking development user with normalized email:", normalizedEmail);
        
        // Vérifier si l'utilisateur existe dans nos données de démo
        const storedUsers = localStorage.getItem('internalUsers');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          console.log("Development users found:", users.length);
          
          const user = users.find((u: any) => 
            u.email && u.email.toLowerCase().trim() === normalizedEmail
          );
          
          if (!user) {
            console.log("User not found in development mode:", normalizedEmail);
            return {
              success: false,
              error: "Cet email n'est pas associé à un compte utilisateur interne"
            };
          }
          
          if (!user.is_active) {
            console.log("User account is inactive in development mode:", normalizedEmail);
            return {
              success: false,
              error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur."
            };
          }
          
          console.log("User found in development mode:", user);
          setIsAuthenticated(true);
          toast.success("Connexion réussie en mode développement");
          return { success: true };
        } else {
          console.log("No users found in localStorage");
          // Créer des utilisateurs par défaut
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
          
          // Vérifier à nouveau avec les utilisateurs nouvellement créés
          const user = defaultUsers.find((u) => 
            u.email.toLowerCase().trim() === normalizedEmail
          );
          
          if (!user) {
            console.log("User not found in default users:", normalizedEmail);
            return {
              success: false,
              error: "Cet email n'est pas associé à un compte utilisateur interne"
            };
          }
          
          console.log("User found in default users:", user);
          setIsAuthenticated(true);
          toast.success("Connexion réussie en mode développement");
          return { success: true };
        }
      } catch (err) {
        console.error("Error checking development users:", err);
      }
      
      // Si nous arrivons ici, quelque chose s'est mal passé lors de la vérification
      return {
        success: false,
        error: "Erreur lors de la vérification des identifiants"
      };
    }

    try {
      setIsSubmitting(true);
      
      // Normaliser l'email
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Login request with normalized email:", normalizedEmail);
      
      // Vérifier d'abord si l'utilisateur existe dans la table internal_users
      console.log("Checking if user exists in internal_users table");
      const { data: internalUser, error: internalUserError } = await supabase
        .from("internal_users")
        .select("id, email, role, is_active")
        .eq("email", normalizedEmail)
        .maybeSingle();
        
      console.log("Internal user check result:", internalUser, internalUserError);
      
      if (internalUserError) {
        console.error("Error checking internal_users:", internalUserError.message);
        return { 
          success: false, 
          error: "Erreur lors de la vérification du compte: " + internalUserError.message
        };
      }
      
      if (!internalUser) {
        console.error("User not found in internal_users table");
        return { 
          success: false, 
          error: "Cet email n'est pas associé à un compte utilisateur interne" 
        };
      }
      
      // Vérifier si l'utilisateur est actif
      if (!internalUser.is_active) {
        console.error("User account is inactive:", internalUser.email);
        return {
          success: false,
          error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur."
        };
      }
      
      // Si l'utilisateur existe, tentative d'authentification avec Supabase
      console.log("User exists and is active, attempting authentication with Supabase");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      console.log("Auth result:", data ? "Success" : "Failed", error);

      if (error) {
        console.error("Authentication error:", error);
        
        // Si l'utilisateur existe mais l'authentification a échoué, c'est probablement un problème de mot de passe
        if (error.message.includes("Invalid login credentials")) {
          return { 
            success: false, 
            error: "Mot de passe incorrect" 
          };
        }
        
        // Erreur générique pour d'autres problèmes
        return { 
          success: false, 
          error: error.message || "Une erreur est survenue lors de la connexion" 
        };
      }

      // Authentification réussie
      console.log("Authentication successful, user is now logged in");
      setIsAuthenticated(true);
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: "Une erreur est survenue lors de la connexion: " + (error.message || "Erreur inconnue")
      };
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const logout = async () => {
    if (isDevelopmentMode) {
      console.log("Development mode: Simulated logout");
      setIsAuthenticated(false);
      toast.success("Vous êtes déconnecté");
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error("Erreur lors de la déconnexion");
        return;
      }
      
      setIsAuthenticated(false);
      toast.success("Vous êtes déconnecté");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Une erreur est survenue lors de la déconnexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { login, logout, isSubmitting };
}
