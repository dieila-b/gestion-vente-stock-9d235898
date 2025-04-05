
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, isDevelopmentMode } = useAuth();

  // En mode développement, toujours donner accès complet sans vérification
  if (isDevelopmentMode) {
    return <>{children}</>;
  }

  // Afficher l'indicateur de chargement uniquement en production
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

  // En production, vérifier l'authentification
  if (!isAuthenticated) {
    console.log("Redirection vers /login car non authentifié");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
