
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

// Détermine si l'application est en mode production
const isProduction = import.meta.env.MODE === 'production';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Si nous sommes en train de charger, afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // En mode production, vérifier l'authentification
  if (isProduction && !isAuthenticated) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // En mode développement ou si l'utilisateur est authentifié, afficher les enfants
  return <>{children}</>;
}
