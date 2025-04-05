
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDevelopmentMode = import.meta.env.DEV;

  const login = async (email: string, password: string) => {
    // En mode développement, simuler une connexion réussie instantanée
    if (isDevelopmentMode) {
      console.log("Mode développeur: Connexion automatique");
      return { success: true };
    }
    
    console.log("Fonction login appelée avec:", email);
    setIsSubmitting(true);
    
    try {
      console.log("Tentative de connexion avec Supabase pour:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Résultat signInWithPassword:", data, error);

      if (error) {
        console.error("Erreur d'authentification:", error.message);
        setIsSubmitting(false);
        
        // Message d'erreur plus précis selon le type d'erreur
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, error: "Identifiants incorrects. Vérifiez votre email et mot de passe." };
        } else if (error.message.includes("Email not confirmed")) {
          return { success: false, error: "Compte non vérifié. Veuillez vérifier votre email." };
        } else if (error.message.includes("Invalid email")) {
          return { success: false, error: "Email invalide. Veuillez vérifier votre adresse email." };
        } else if (error.message.includes("Invalid password")) {
          return { success: false, error: "Mot de passe incorrect. Veuillez réessayer." };
        }
        
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log("Utilisateur connecté avec succès:", data.user.email);
        
        // Vérifier si l'utilisateur existe dans la table internal_users
        try {
          const { data: internalUser, error: internalError } = await supabase
            .from('internal_users')
            .select('id, email')
            .eq('email', data.user.email)
            .single();
            
          console.log("Vérification internal_users après login:", internalUser, internalError);
            
          if (internalError || !internalUser) {
            console.error("Utilisateur non trouvé dans internal_users:", internalError?.message);
            toast.error("Vous n'êtes pas autorisé à accéder à cette application");
            // Déconnexion de l'utilisateur
            await supabase.auth.signOut();
            setIsSubmitting(false);
            return { success: false, error: "Vous n'êtes pas autorisé à accéder à cette application" };
          }
          
          console.log("Utilisateur interne vérifié:", internalUser.email);
          setIsAuthenticated(true);
          setIsSubmitting(false);
          return { success: true };
        } catch (err) {
          console.error("Erreur lors de la vérification internal_users:", err);
          await supabase.auth.signOut();
          setIsSubmitting(false);
          return { success: false, error: "Erreur de vérification utilisateur" };
        }
      }
      
      setIsSubmitting(false);
      return { success: false, error: "Erreur inconnue lors de la connexion" };
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setIsSubmitting(false);
      return { success: false, error: "Erreur technique" };
    }
  };
  
  const logout = async () => {
    // En mode développement, simuler une déconnexion instantanée
    if (isDevelopmentMode) {
      console.log("Mode développeur: Déconnexion simulée");
      toast.success("Vous êtes déconnecté");
      return;
    }
    
    console.log("Déconnexion en cours...");
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erreur lors de la déconnexion:", error);
        toast.error("Erreur lors de la déconnexion");
      } else {
        setIsAuthenticated(false);
        toast.success("Vous êtes déconnecté");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setLoading(false);
    }
  };

  return { login, logout, isSubmitting };
}
