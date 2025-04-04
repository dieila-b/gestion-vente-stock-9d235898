
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
        console.log("Vérification de la session Supabase...");
        // Vérifier la session Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la vérification de session:", error);
          toast.error("Erreur lors de la vérification de session");
          setIsAuthenticated(false);
          setUserRole(null);
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
              .select('id, email, role, is_active')
              .eq('email', data.session.user.email)
              .single();
            
            console.log("Recherche utilisateur interne:", internalUsers, internalError);
            
            if (internalError) {
              console.error("Erreur lors de la requête internal_users:", internalError);
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserRole(null);
              localStorage.removeItem('userRole');
            } else if (!internalUsers) {
              console.log("Utilisateur non trouvé dans la table internal_users");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserRole(null);
              localStorage.removeItem('userRole');
            } else if (!internalUsers.is_active) {
              console.log("Utilisateur désactivé:", internalUsers.email);
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserRole(null);
              localStorage.removeItem('userRole');
              toast.error("Votre compte a été désactivé");
            } else {
              console.log("Utilisateur interne validé:", internalUsers.email, "Rôle:", internalUsers.role);
              setIsAuthenticated(true);
              setUserRole(internalUsers.role);
              localStorage.setItem('userRole', internalUsers.role);
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
              .select('id, email, role, is_active')
              .eq('email', session.user.email)
              .single();
            
            console.log("Vérification internal_users après signin:", internalUsers, internalError);
            
            if (internalError) {
              console.error("Erreur lors de la requête internal_users:", internalError);
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserRole(null);
              localStorage.removeItem('userRole');
              toast.error("Erreur lors de la vérification de vos droits d'accès");
            } else if (!internalUsers) {
              console.error("Utilisateur non trouvé dans internal_users lors du changement d'état");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserRole(null);
              localStorage.removeItem('userRole');
              toast.error("Vous n'avez pas accès à cette application");
            } else if (!internalUsers.is_active) {
              console.error("Utilisateur désactivé lors du changement d'état:", internalUsers.email);
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserRole(null);
              localStorage.removeItem('userRole');
              toast.error("Votre compte a été désactivé");
            } else {
              console.log("Utilisateur interne validé après événement auth:", internalUsers.email, "Rôle:", internalUsers.role);
              setIsAuthenticated(true);
              setUserRole(internalUsers.role);
              localStorage.setItem('userRole', internalUsers.role);
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

  return { isAuthenticated, setIsAuthenticated, loading, setLoading, userRole, setUserRole };
}
