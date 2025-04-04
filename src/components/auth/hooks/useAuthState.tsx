
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier la session Supabase au chargement
    const checkSession = async () => {
      try {
        // En développement, on est automatiquement authentifié
        if (process.env.NODE_ENV === 'development') {
          console.log("Mode développement: Authentification automatique activée");
          setIsAuthenticated(true);
          setUserRole('admin'); // En développement, on est admin par défaut
          localStorage.setItem('userRole', 'admin');
          setLoading(false);
          return;
        }

        console.log("Vérification de la session Supabase...");
        // En production, vérifier la session Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la vérification de session:", error);
          toast.error("Erreur lors de la vérification de session");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        console.log("Résultat getSession:", data);
        
        if (data.session) {
          console.log("Session active trouvée pour:", data.session.user.email);
          
          // Vérifier si l'utilisateur existe dans la table internal_users
          try {
            const { data: internalUsers, error: internalError } = await supabase
              .from('internal_users')
              .select('id, email, role')
              .eq('email', data.session.user.email);
            
            console.log("Recherche utilisateur interne:", internalUsers, internalError);
            
            if (internalError) {
              console.error("Erreur lors de la requête internal_users:", internalError);
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserRole(null);
              localStorage.removeItem('userRole');
            } else if (!internalUsers || internalUsers.length === 0) {
              console.log("Utilisateur non trouvé dans la table internal_users");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserRole(null);
              localStorage.removeItem('userRole');
            } else {
              console.log("Utilisateur interne validé:", internalUsers[0].email, "Rôle:", internalUsers[0].role);
              setIsAuthenticated(true);
              setUserRole(internalUsers[0].role);
              localStorage.setItem('userRole', internalUsers[0].role);
            }
          } catch (err) {
            console.error("Erreur lors de la vérification internal_users:", err);
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setUserRole(null);
            localStorage.removeItem('userRole');
          }
        } else {
          console.log("Aucune session active trouvée");
          setIsAuthenticated(false);
          setUserRole(null);
          localStorage.removeItem('userRole');
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        setIsAuthenticated(false);
        setUserRole(null);
        localStorage.removeItem('userRole');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // S'abonner aux changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Événement d'authentification:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            // Vérifier si l'utilisateur est un utilisateur interne
            const { data: internalUsers, error: internalError } = await supabase
              .from('internal_users')
              .select('id, email, role')
              .eq('email', session.user.email);
            
            console.log("Vérification internal_users après signin:", internalUsers, internalError);
            
            if (internalError) {
              console.error("Erreur lors de la requête internal_users:", internalError);
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserRole(null);
              localStorage.removeItem('userRole');
              toast.error("Erreur lors de la vérification de vos droits d'accès");
            } else if (!internalUsers || internalUsers.length === 0) {
              console.error("Utilisateur non trouvé dans internal_users lors du changement d'état");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserRole(null);
              localStorage.removeItem('userRole');
              toast.error("Vous n'avez pas accès à cette application");
            } else {
              console.log("Utilisateur interne validé après événement auth:", internalUsers[0].email, "Rôle:", internalUsers[0].role);
              setIsAuthenticated(true);
              setUserRole(internalUsers[0].role);
              localStorage.setItem('userRole', internalUsers[0].role);
            }
          } catch (error) {
            console.error("Erreur lors de la vérification de l'utilisateur interne:", error);
            setIsAuthenticated(false);
            setUserRole(null);
            localStorage.removeItem('userRole');
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserRole(null);
          localStorage.removeItem('userRole');
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return { isAuthenticated, setIsAuthenticated, loading, setLoading, userRole };
}
