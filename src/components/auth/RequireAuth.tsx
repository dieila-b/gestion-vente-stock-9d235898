
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

      // En production, on vérifie si l'utilisateur est un utilisateur interne et actif
      try {
        if (!isAuthenticated) {
          console.log("Utilisateur non authentifié");
          setIsInternalUser(false);
          setLoading(false);
          return;
        }
        
        // Vérifier d'abord dans le localStorage
        const userRole = localStorage.getItem('userRole');
        if (userRole && ['admin', 'manager'].includes(userRole)) {
          console.log("Rôle valide trouvé dans localStorage:", userRole);
          setIsInternalUser(true);
          setLoading(false);
          return;
        }
        
        // Sinon, vérifier via Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Session dans RequireAuth:", session?.user?.email, sessionError);
        
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
        
        // Vérifier si l'utilisateur existe et est actif dans la table internal_users
        const { data: internalUsers, error: internalError } = await supabase
          .from('internal_users')
          .select('id, email, role, is_active')
          .eq('email', session.user.email);
          
        console.log("Vérification internal_users dans RequireAuth:", 
          internalUsers ? `${internalUsers.length} résultats` : "Aucun résultat", 
          internalError);
          
        if (internalError) {
          console.error("Erreur lors de la vérification de l'utilisateur interne:", internalError);
          setIsInternalUser(false);
          toast.error("Erreur lors de la vérification de votre accès");
        } else if (!internalUsers || internalUsers.length === 0) {
          console.log("Utilisateur non trouvé dans la table internal_users");
          setIsInternalUser(false);
          toast.error("Vous n'avez pas accès à cette application");
        } else if (!internalUsers[0].is_active) {
          console.log("Utilisateur interne désactivé:", internalUsers[0].email);
          setIsInternalUser(false);
          toast.error("Votre compte a été désactivé");
        } else {
          console.log("Utilisateur interne trouvé:", internalUsers[0].email, "Rôle:", internalUsers[0].role, "Actif:", internalUsers[0].is_active);
          setIsInternalUser(true);
          // Stocker le rôle dans localStorage pour les futures vérifications
          localStorage.setItem('userRole', internalUsers[0].role);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur interne:", error);
        setIsInternalUser(false);
        setLoading(false);
        toast.error("Erreur lors de la vérification de votre accès");
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
