
import { Loader2 } from "lucide-react";

interface AuthorizationCheckProps {
  isAuthChecking: boolean;
  isAuthorized: boolean;
}

export function AuthorizationCheck({ isAuthChecking, isAuthorized }: AuthorizationCheckProps) {
  if (isAuthChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Accès Refusé</h2>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
          </p>
          <p className="text-gray-600">
            Veuillez contacter l'administrateur si vous pensez qu'il s'agit d'une erreur.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
