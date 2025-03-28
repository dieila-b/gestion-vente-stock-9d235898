
import { Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface AuthorizationCheckProps {
  isAuthChecking: boolean;
  isAuthorized: boolean;
  onLoginClick: () => void;
}

export const AuthorizationCheck = ({
  isAuthChecking,
  isAuthorized,
  onLoginClick,
}: AuthorizationCheckProps) => {
  if (isAuthChecking) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Vérification de l'authentification...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
            <User className="h-16 w-16 text-red-500" />
            <h1 className="text-2xl font-bold">Accès non autorisé</h1>
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder à cette page. Veuillez vous connecter et réessayer.
            </p>
            <Button onClick={onLoginClick}>
              Se connecter
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return null;
};
