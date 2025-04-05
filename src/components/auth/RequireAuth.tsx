
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, isDevelopmentMode } = useAuth();
  const navigate = useNavigate();

  // En mode développement, rediriger immédiatement vers le dashboard et donner accès complet
  useEffect(() => {
    if (isDevelopmentMode) {
      console.log("Mode développeur: Accès complet accordé automatiquement");
      // Si on est sur la page login en mode dev, rediriger vers dashboard
      if (window.location.pathname === "/login") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [isDevelopmentMode, navigate]);

  // En mode développement, toujours donner accès complet sans vérification
  if (isDevelopmentMode) {
    console.log("Mode développeur: Accès complet accordé automatiquement");
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
