
import { useAuth } from "./hooks/useAuth";
import { useLocation, Navigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, isDevelopmentMode, testingMode } = useAuth();
  const location = useLocation();

  console.log("RequireAuth: Vérification de l'authentification", { 
    isDevelopmentMode, 
    testingMode, 
    isAuthenticated, 
    loading,
    pathname: location.pathname
  });

  if (loading) {
    console.log("RequireAuth: Vérification d'authentification en cours...");
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    console.log("RequireAuth: Pas de session active, redirection vers login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Message de statut d'authentification
  if (isDevelopmentMode) {
    console.log("RequireAuth: Mode développement actif - Authentification contournée");
  } else if (testingMode) {
    console.log("RequireAuth: Mode TEST actif en production - Authentification contournée");
  } else {
    console.log("RequireAuth: Mode production - Session utilisateur valide vérifiée");
  }
  
  return <>{children}</>;
}
