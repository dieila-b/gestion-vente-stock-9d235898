
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
        
        if (data.session) {
          console.log("Session active trouvée pour:", data.session.user.email);
          
          // Vérifier si l'utilisateur existe dans la table internal_users
          try {
            const { data: internalUser, error: internalError } = await supabase
              .from('internal_users')
              .select('id, email, role, is_active')
              .eq('email', data.session.user.email)
              .single();
            
            console.log("Recherche utilisateur interne:", internalUser, internalError);
            
            if (internalError) {
              console.error("Erreur lors de la recherche utilisateur:", internalError.message);
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
            
            if (!internalUser) {
              console.error("Utilisateur non trouvé dans internal_users");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
            
            // Vérifier si le compte est actif
            if (!internalUser.is_active) {
              console.error("Compte utilisateur désactivé");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
            
            console.log("Utilisateur interne validé:", internalUser.email, "Rôle:", internalUser.role);
            setIsAuthenticated(true);
          } catch (err) {
            console.error("Erreur lors de la vérification internal_users:", err);
            setIsAuthenticated(false);
          }
        } else {
          console.log("Aucune session active trouvée");
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
            // Vérifier si l'utilisateur est un utilisateur interne
            const { data: internalUser, error: internalError } = await supabase
              .from('internal_users')
              .select('id, email, role, is_active')
              .eq('email', session.user.email)
              .single();
            
            console.log("Vérification internal_users après signin:", internalUser, internalError);
            
            if (internalError) {
              console.error("Erreur lors de la recherche utilisateur:", internalError.message);
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              return;
            }
            
            if (!internalUser) {
              console.error("Utilisateur non trouvé dans internal_users lors du changement d'état");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              return;
            }
            
            // Vérifier si le compte est actif
            if (!internalUser.is_active) {
              console.error("Compte utilisateur désactivé");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              return;
            }
            
            console.log("Utilisateur interne validé après événement auth:", internalUser.email, "Rôle:", internalUser.role);
            setIsAuthenticated(true);
          } catch (error) {
            console.error("Erreur lors de la vérification de l'utilisateur interne:", error);
            setIsAuthenticated(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
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
