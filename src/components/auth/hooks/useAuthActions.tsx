
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthActions(
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (email: string, password: string) => {
    console.log("Fonction login appelée avec:", email);
    setIsSubmitting(true);
    
    try {
      console.log("Tentative de connexion avec Supabase pour:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Résultat signInWithPassword:", data ? "Succès" : "Échec", error);

      if (error) {
        console.error("Erreur d'authentification:", error.message);
        setIsSubmitting(false);
        
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, error: "Identifiants incorrects. Vérifiez votre email et mot de passe." };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log("Utilisateur connecté avec succès:", data.user.email);
        
        // Vérifier si l'utilisateur est un utilisateur interne et est actif
        try {
          const { data: internalUsers, error: internalError } = await supabase
            .from('internal_users')
            .select('id, email, role, is_active')
            .eq('email', data.user.email)
            .single();
            
          console.log("Vérification internal_users après login:", internalUsers, internalError);
            
          if (internalError) {
            console.error("Erreur lors de la requête internal_users:", internalError.message);
            toast.error("Erreur lors de la vérification de vos droits d'accès.");
            await supabase.auth.signOut();
            setIsSubmitting(false);
            return { success: false, error: "Erreur de vérification utilisateur" };
          }
          
          if (!internalUsers) {
            console.error("Utilisateur non trouvé dans internal_users");
            toast.error("Vous n'êtes pas autorisé à accéder à cette application.");
            await supabase.auth.signOut();
            setIsSubmitting(false);
            return { success: false, error: "Votre compte n'a pas les autorisations nécessaires pour accéder à l'application." };
          }
          
          if (!internalUsers.is_active) {
            console.error("Compte utilisateur désactivé:", internalUsers.email);
            toast.error("Votre compte a été désactivé. Contactez l'administrateur.");
            await supabase.auth.signOut();
            setIsSubmitting(false);
            return { success: false, error: "Votre compte a été désactivé." };
          }
          
          console.log("Utilisateur interne vérifié:", internalUsers.email, "Rôle:", internalUsers.role, "Actif:", internalUsers.is_active);
          
          // Stocker le rôle de l'utilisateur dans le localStorage pour un accès facile
          localStorage.setItem('userRole', internalUsers.role);
          setUserRole(internalUsers.role);
          
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
      return { success: false, error: "Erreur technique lors de la connexion" };
    }
  };
  
  const logout = async () => {
    console.log("Déconnexion en cours...");
    setLoading(true);
    
    // Nettoyer les données utilisateur stockées
    localStorage.removeItem('userRole');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erreur lors de la déconnexion:", error);
        toast.error("Erreur lors de la déconnexion");
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
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
