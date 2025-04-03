
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isInternalUser, setIsInternalUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkInternalUser() {
      setLoading(true);
      
      // En mode développement, on considère toujours l'utilisateur comme interne
      if (process.env.NODE_ENV === 'development') {
        console.log("Mode développement: Utilisateur considéré comme autorisé");
        setIsInternalUser(true);
        setLoading(false);
        return;
      }

      // En production, on vérifie si l'utilisateur est un utilisateur interne
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
          toast.error("Erreur lors de la vérification de votre session");
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
          const { data: internalUsers, error: internalError } = await supabase
            .from('internal_users')
            .select('id, email')
            .eq('email', session.user.email);
            
          console.log("Vérification internal_users dans RequireAuth:", internalUsers, internalError);
            
          if (internalError) {
            console.error("Erreur lors de la vérification de l'utilisateur interne:", internalError);
            setIsInternalUser(false);
            toast.error("Erreur lors de la vérification de votre accès");
          } else if (!internalUsers || internalUsers.length === 0) {
            console.log("Utilisateur non trouvé dans la table internal_users");
            setIsInternalUser(false);
            toast.error("Vous n'avez pas accès à cette application");
          } else {
            console.log("Utilisateur interne trouvé:", internalUsers[0].email);
            setIsInternalUser(true);
          }
        } catch (err) {
          console.error("Exception lors de la vérification internal_users:", err);
          setIsInternalUser(false);
          toast.error("Erreur lors de la vérification de votre accès");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur interne:", error);
        setIsInternalUser(false);
        toast.error("Erreur lors de la vérification de votre accès");
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

  if (process.env.NODE_ENV !== 'development' && !isInternalUser) {
    console.log("Redirection vers /unauthorized car utilisateur non interne");
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
