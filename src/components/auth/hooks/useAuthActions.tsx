
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
    
    // Normaliser l'email
    const normalizedEmail = email.trim().toLowerCase();
    console.log("Fonction login appelée avec:", normalizedEmail);
    setIsSubmitting(true);
    
    try {
      console.log("Tentative de connexion avec Supabase pour:", normalizedEmail);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
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
          console.log("Vérification de l'utilisateur dans internal_users:", data.user.email);
          const { data: internalUser, error: internalError } = await supabase
            .from('internal_users')
            .select('id, email, role, is_active')
            .eq('email', data.user.email.toLowerCase().trim())
            .single();
            
          console.log("Vérification internal_users après login:", internalUser, internalError);
            
          if (internalError) {
            console.error("Erreur lors de la vérification de l'utilisateur interne:", internalError.message);
            toast.error("Erreur lors de la vérification de votre compte");
            await supabase.auth.signOut();
            setIsSubmitting(false);
            return { success: false, error: "Erreur lors de la vérification de votre compte" };
          }
            
          if (!internalUser) {
            console.error("Utilisateur non trouvé dans internal_users");
            toast.error("Vous n'êtes pas autorisé à accéder à cette application");
            await supabase.auth.signOut();
            setIsSubmitting(false);
            return { success: false, error: "Vous n'êtes pas autorisé à accéder à cette application" };
          }
          
          // Vérifier si l'utilisateur est actif
          if (!internalUser.is_active) {
            console.error("Compte utilisateur désactivé");
            toast.error("Votre compte est désactivé. Contactez un administrateur.");
            await supabase.auth.signOut();
            setIsSubmitting(false);
            return { success: false, error: "Votre compte est désactivé. Contactez un administrateur." };
          }
          
          console.log("Utilisateur interne vérifié et actif:", internalUser.email, "Rôle:", internalUser.role);
          setIsAuthenticated(true);
          setIsSubmitting(false);
          toast.success("Connexion réussie");
          return { success: true };
        } catch (err) {
          console.error("Erreur lors de la vérification internal_users:", err);
          await supabase.auth.signOut();
          setIsSubmitting(false);
          return { success: false, error: "Erreur de vérification utilisateur" };
        }
      } else {
        console.error("Aucun utilisateur retourné après connexion réussie");
        setIsSubmitting(false);
        return { success: false, error: "Erreur de connexion: aucun utilisateur trouvé" };
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setIsSubmitting(false);
      return { success: false, error: "Erreur technique lors de la tentative de connexion" };
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
