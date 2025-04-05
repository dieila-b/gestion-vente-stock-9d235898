
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const isDevelopmentMode = import.meta.env.DEV;

  useEffect(() => {
    // En mode développement, considérer l'utilisateur comme authentifié automatiquement
    if (isDevelopmentMode) {
      console.log("Mode développeur: Authentification complètement désactivée");
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // En production, vérifier la session Supabase au chargement
    const checkSession = async () => {
      try {
        console.log("Vérification de la session Supabase...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la vérification de session:", error);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        console.log("Résultat getSession:", data);
        
        if (!data.session) {
          console.log("Aucune session active trouvée");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        const userEmail = data.session.user.email;
        if (!userEmail) {
          console.error("Email utilisateur manquant dans la session");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        console.log("Session active trouvée pour:", userEmail);
        
        // Vérifier si l'utilisateur existe dans la table internal_users
        try {
          const normalizedEmail = userEmail.toLowerCase().trim();
          console.log("Recherche utilisateur interne avec email:", normalizedEmail);
          
          const { data: internalUser, error: internalError } = await supabase
            .from('internal_users')
            .select('id, email, role, is_active')
            .eq('email', normalizedEmail)
            .single();
          
          console.log("Recherche utilisateur interne - résultat:", internalUser, internalError);
          
          if (internalError) {
            console.error("Erreur lors de la recherche utilisateur:", internalError.message);
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          if (!internalUser) {
            console.error("Utilisateur non trouvé dans internal_users");
            toast.error("Votre compte n'est pas autorisé à accéder à cette application");
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          // Vérifier si le compte est actif
          if (!internalUser.is_active) {
            console.error("Compte utilisateur désactivé");
            toast.error("Votre compte est désactivé. Contactez un administrateur.");
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          console.log("Utilisateur interne validé:", internalUser.email, "Rôle:", internalUser.role);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Erreur lors de la vérification internal_users:", err);
          toast.error("Erreur de vérification de votre compte. Veuillez vous reconnecter.");
          await supabase.auth.signOut();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    // Vérification de session uniquement en production
    setLoading(true);
    checkSession();

    // S'abonner aux changements d'authentification uniquement en production
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Événement d'authentification:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            const userEmail = session.user.email;
            if (!userEmail) {
              console.error("Email utilisateur manquant dans la session");
              setIsAuthenticated(false);
              return;
            }
            
            // Vérifier si l'utilisateur est un utilisateur interne
            const normalizedEmail = userEmail.toLowerCase().trim();
            console.log("Vérification internal_users après signin avec email:", normalizedEmail);
            
            const { data: internalUser, error: internalError } = await supabase
              .from('internal_users')
              .select('id, email, role, is_active')
              .eq('email', normalizedEmail)
              .single();
            
            console.log("Vérification internal_users après signin - résultat:", internalUser, internalError);
            
            if (internalError) {
              console.error("Erreur lors de la recherche utilisateur:", internalError.message);
              toast.error("Erreur de vérification de votre compte");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              return;
            }
            
            if (!internalUser) {
              console.error("Utilisateur non trouvé dans internal_users lors du changement d'état");
              toast.error("Votre compte n'est pas autorisé à accéder à cette application");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              return;
            }
            
            // Vérifier si le compte est actif
            if (!internalUser.is_active) {
              console.error("Compte utilisateur désactivé");
              toast.error("Votre compte est désactivé. Contactez un administrateur.");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              return;
            }
            
            console.log("Utilisateur interne validé après événement auth:", internalUser.email, "Rôle:", internalUser.role);
            setIsAuthenticated(true);
            toast.success("Connexion réussie");
          } catch (error) {
            console.error("Erreur lors de la vérification de l'utilisateur interne:", error);
            toast.error("Erreur de vérification. Veuillez vous reconnecter.");
            await supabase.auth.signOut();
            setIsAuthenticated(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          console.log("Utilisateur déconnecté");
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription && !isDevelopmentMode) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [isDevelopmentMode]);

  return { isAuthenticated, setIsAuthenticated, loading, setLoading, isDevelopmentMode };
}
