
import { useState } from "react";
import { handleDevModeLogin } from "./utils/devModeAuth";
import { handleProdModeLogin } from "./utils/prodModeAuth";
import { handleLogout } from "./utils/logoutHandler";
import { useDevMode } from "./useDevMode";
import { useTestingMode } from "./useTestingMode";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isDevelopmentMode } = useDevMode();
  const { testingMode } = useTestingMode();
  
  // Fonction pour vérifier manuellement si un utilisateur existe dans internal_users
  const checkInternalUserExists = async (email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Vérification manuelle d'existence pour:", normalizedEmail);
    
    try {
      // Essayer d'abord avec une correspondance exacte
      const { data: exactUsers, error: exactError } = await supabase
        .from("internal_users")
        .select("id, email, is_active")
        .eq("email", normalizedEmail)
        .limit(1);
        
      if (exactError) {
        console.error("Erreur lors de la vérification exacte:", exactError.message);
        return { exists: false, isActive: false, error: exactError.message };
      }
      
      if (exactUsers && exactUsers.length > 0) {
        const user = exactUsers[0];
        console.log("Utilisateur trouvé avec correspondance exacte:", user);
        return { exists: true, isActive: user.is_active, user };
      }
      
      // Si aucun résultat exact, essayer avec ilike
      console.log("Aucun résultat exact, essai avec ilike pour:", normalizedEmail);
      const { data: fuzzyUsers, error: fuzzyError } = await supabase
        .from("internal_users")
        .select("id, email, is_active")
        .ilike("email", normalizedEmail)
        .limit(1);
        
      if (fuzzyError) {
        console.error("Erreur lors de la vérification avec ilike:", fuzzyError.message);
        return { exists: false, isActive: false, error: fuzzyError.message };
      }
      
      if (fuzzyUsers && fuzzyUsers.length > 0) {
        const user = fuzzyUsers[0];
        console.log("Utilisateur trouvé avec ilike:", user);
        return { exists: true, isActive: user.is_active, user };
      }
      
      console.log("Aucun utilisateur trouvé pour:", normalizedEmail);
      return { exists: false, isActive: false };
      
    } catch (error: any) {
      console.error("Erreur lors de la vérification manuelle:", error);
      return { exists: false, isActive: false, error: error.message };
    }
  };
  
  const login = async (email: string, password: string) => {
    console.log("Tentative de connexion avec email:", email);
    
    try {
      setIsSubmitting(true);
      
      // Validation de base des champs
      if (!email || !email.trim()) {
        toast.error("Veuillez saisir votre email");
        setIsSubmitting(false);
        return { success: false, error: "Veuillez saisir votre email" };
      }
      
      if (!password) {
        toast.error("Veuillez saisir votre mot de passe");
        setIsSubmitting(false);
        return { success: false, error: "Veuillez saisir votre mot de passe" };
      }
      
      const normalizedEmail = email.toLowerCase().trim();
      
      // Vérifier d'abord si l'utilisateur existe dans internal_users
      console.log("Vérification d'existence dans internal_users pour:", normalizedEmail);
      const userCheck = await checkInternalUserExists(normalizedEmail);
      
      if (!userCheck.exists) {
        console.error("Utilisateur non trouvé dans internal_users:", normalizedEmail);
        toast.error("Cet email n'est pas associé à un compte utilisateur interne");
        setIsSubmitting(false);
        return { success: false, error: "Cet email n'est pas associé à un compte utilisateur interne" };
      }
      
      if (!userCheck.isActive) {
        console.error("Utilisateur désactivé:", normalizedEmail);
        toast.error("Ce compte a été désactivé");
        setIsSubmitting(false);
        return { success: false, error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur." };
      }
      
      console.log("Utilisateur valide dans internal_users:", userCheck.user);
      
      // En mode développement ou testing, auto-authentification
      if (isDevelopmentMode || testingMode) {
        console.log(isDevelopmentMode 
          ? "Mode développement: Auto-authentification sans vérification des identifiants" 
          : "Mode test: Auto-authentification sans vérification des identifiants");
        
        // En mode développement, vérifier quand même que l'email correspond à un utilisateur valide
        if (isDevelopmentMode) {
          const devResult = await handleDevModeLogin(email);
          if (!devResult.success) {
            setIsSubmitting(false);
            return devResult;
          }
        }
        
        setIsAuthenticated(true);
        toast.success(`Connexion réussie (${isDevelopmentMode ? "Mode développement" : "Mode test"})`);
        setIsSubmitting(false);
        return { success: true };
      }
      
      // En mode production, utiliser le flux d'authentification normal
      console.log("Mode production: Tentative de connexion standard pour", normalizedEmail);
      const result = await handleProdModeLogin(normalizedEmail, password);
      
      if (result.success) {
        console.log("Connexion réussie pour", normalizedEmail);
        setIsAuthenticated(true);
      } else {
        console.error("Échec de connexion pour", normalizedEmail, ":", result.error);
      }
      
      setIsSubmitting(false);
      return result;
    } catch (error: any) {
      console.error("Erreur inattendue lors de la connexion:", error);
      toast.error("Une erreur inattendue s'est produite");
      setIsSubmitting(false);
      return { success: false, error: error?.message || "Erreur inconnue" };
    }
  };
  
  const logout = async () => {
    try {
      setIsSubmitting(true);
      
      // En mode développement ou testing, simplement mettre l'état d'authentification à false
      if (isDevelopmentMode || testingMode) {
        console.log(isDevelopmentMode 
          ? "Mode développement: Déconnexion simple sans appels serveur" 
          : "Mode test: Déconnexion simple sans appels serveur");
        setIsAuthenticated(false);
        toast.success("Déconnexion réussie");
        setIsSubmitting(false);
        return;
      }
      
      // En mode production, utiliser le flux de déconnexion normal
      await handleLogout(isDevelopmentMode);
      setIsAuthenticated(false);
      toast.success("Déconnexion réussie");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
      setIsSubmitting(false);
    }
  };

  return { login, logout, isSubmitting };
}
