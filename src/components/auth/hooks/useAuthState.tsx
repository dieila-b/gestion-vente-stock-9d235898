
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
        
        setIsAuthenticated(true);
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
          setIsAuthenticated(true);
          toast.success("Connexion réussie");
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
