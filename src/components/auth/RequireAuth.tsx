
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isInternalUser, setIsInternalUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkInternalUser() {
      setLoading(true);
      
      try {
        if (!isAuthenticated) {
          console.log("Utilisateur non authentifié");
          setIsInternalUser(false);
          setLoading(false);
          return;
        }
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Session dans RequireAuth:", session, sessionError);
        
        if (sessionError) {
          console.error("Erreur lors de la récupération de la session:", sessionError);
          setIsInternalUser(false);
          setLoading(false);
          return;
        }
        
        if (!session) {
          console.log("Pas de session active trouvée");
          setIsInternalUser(false);
          setLoading(false);
          return;
        }
        
        console.log("Session active trouvée pour l'utilisateur:", session.user.email);
        
        // Vérifier si l'utilisateur existe dans la table internal_users
        try {
          const { data, error } = await supabase
            .from('internal_users')
            .select('id, email')
            .eq('email', session.user.email)
            .single();
            
          console.log("Vérification internal_users dans RequireAuth:", data, error);
            
          if (error) {
            console.error("Erreur lors de la vérification de l'utilisateur interne:", error);
            setIsInternalUser(false);
          } else if (!data) {
            console.log("Utilisateur non trouvé dans la table internal_users");
            setIsInternalUser(false);
          } else {
            console.log("Utilisateur interne trouvé:", data.email);
            setIsInternalUser(true);
          }
        } catch (err) {
          console.error("Exception lors de la vérification internal_users:", err);
          setIsInternalUser(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur interne:", error);
        setIsInternalUser(false);
      } finally {
        setLoading(false);
      }
    }
    
    // Vérifier si l'utilisateur est interne seulement si authentifié ou si l'état d'auth a changé
    if (!authLoading) {
      checkInternalUser();
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("Redirection vers /login car non authentifié");
    return <Navigate to="/login" replace />;
  }

  if (!isInternalUser) {
    console.log("Redirection vers /unauthorized car utilisateur non interne");
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
