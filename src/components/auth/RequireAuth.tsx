
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isInternalUser, setIsInternalUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkInternalUser() {
      setLoading(true);
      
      // En mode développement, on considère toujours l'utilisateur comme interne
      if (process.env.NODE_ENV === 'development') {
        setIsInternalUser(true);
        setLoading(false);
        return;
      }

      // En production, on vérifie si l'utilisateur est un utilisateur interne
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsInternalUser(false);
          setLoading(false);
          return;
        }
        
        // Vérifier si l'utilisateur existe dans la table internal_users
        const { data, error } = await supabase
          .from('internal_users')
          .select('id')
          .eq('id', session.user.id)
          .single();
          
        if (error || !data) {
          console.error("Erreur ou utilisateur non trouvé:", error);
          setIsInternalUser(false);
        } else {
          setIsInternalUser(true);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur interne:", error);
        setIsInternalUser(false);
      } finally {
        setLoading(false);
      }
    }
    
    if (isAuthenticated) {
      checkInternalUser();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (loading) {
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
    return <Navigate to="/login" replace />;
  }

  if (process.env.NODE_ENV !== 'development' && !isInternalUser) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
