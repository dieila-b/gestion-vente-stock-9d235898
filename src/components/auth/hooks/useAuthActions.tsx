
import { useState } from "react";
import { handleDevModeLogin } from "./utils/devModeAuth";
import { handleProdModeLogin } from "./utils/prodModeAuth";
import { handleLogout } from "./utils/logoutHandler";
import { useDevMode } from "./useDevMode";
import { useTestingMode } from "./useTestingMode";
import { toast } from "sonner";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isDevelopmentMode } = useDevMode();
  const { testingMode } = useTestingMode();
  
  const login = async (email: string, password: string) => {
    console.log("Tentative de connexion avec email:", email);
    
    try {
      setIsSubmitting(true);
      
      // Validation de base des champs
      if (!email || !email.trim()) {
        toast.error("Veuillez saisir votre email");
        return { success: false, error: "Veuillez saisir votre email" };
      }
      
      if (!password) {
        toast.error("Veuillez saisir votre mot de passe");
        return { success: false, error: "Veuillez saisir votre mot de passe" };
      }
      
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
      console.log("Mode production: Tentative de connexion standard pour", email);
      const result = await handleProdModeLogin(email, password);
      
      if (result.success) {
        console.log("Connexion réussie pour", email);
        setIsAuthenticated(true);
      } else {
        console.error("Échec de connexion pour", email, ":", result.error);
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
