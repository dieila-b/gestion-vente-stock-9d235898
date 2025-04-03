
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (email: string, password: string) => {
    console.log("Fonction login appelée avec:", email);
    setIsSubmitting(true);
    
    // En développement, simplement connecter l'utilisateur
    if (process.env.NODE_ENV === 'development') {
      console.log("Mode développement: Connexion automatique pour:", email);
      setIsAuthenticated(true);
      setIsSubmitting(false);
      return { success: true };
    }

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
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log("Utilisateur connecté avec succès:", data.user.email);
        
        // Vérifier si l'utilisateur existe dans la table internal_users
        try {
          const { data: internalUsers, error: internalError } = await supabase
            .from('internal_users')
            .select('id, email')
            .eq('email', data.user.email);
            
          console.log("Vérification internal_users après login:", internalUsers, internalError);
            
          if (internalError) {
            console.error("Erreur lors de la requête internal_users:", internalError.message);
            toast.error("Erreur lors de la vérification de vos droits d'accès.");
            await supabase.auth.signOut();
            setIsSubmitting(false);
            return { success: false, error: "Erreur de vérification utilisateur" };
          }
          
          if (!internalUsers || internalUsers.length === 0) {
            console.error("Utilisateur non trouvé dans internal_users");
            toast.error("Vous n'êtes pas autorisé à accéder à cette application.");
            await supabase.auth.signOut();
            setIsSubmitting(false);
            return { success: false, error: "Utilisateur non autorisé" };
          }
          
          console.log("Utilisateur interne vérifié:", internalUsers[0].email);
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
    console.log("Déconnexion en cours...");
    setLoading(true);
    // En mode développement, juste mettre à jour l'état
    if (process.env.NODE_ENV === 'development') {
      setIsAuthenticated(false);
      setLoading(false);
      toast.success("Vous êtes déconnecté");
      return;
    }

    // En production, se déconnecter de Supabase
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
