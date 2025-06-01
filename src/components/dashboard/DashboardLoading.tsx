
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export function DashboardLoading() {
  console.log("Dashboard: Chargement des données financières");
  
  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Chargement du tableau de bord...</p>
          <p className="text-xs text-gray-400">Si le chargement persiste, vérifiez votre connexion internet</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
