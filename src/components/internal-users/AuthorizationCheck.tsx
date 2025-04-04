
import { Loader2, User } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface AuthorizationCheckProps {
  isAuthChecking: boolean;
  isAuthorized: boolean;
}

export const AuthorizationCheck = ({
  isAuthChecking,
  isAuthorized,
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
              Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return null;
};
