
import { AlertCircle } from "lucide-react";
import { formatGNF } from "@/lib/currency";
import { StockAlert } from "@/hooks/dashboard/useStockAlerts";

type StockAlertsListProps = {
  alerts: StockAlert[];
  isLoading: boolean;
};

export function StockAlertsList({ alerts, isLoading }: StockAlertsListProps) {
  if (isLoading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-48">
        <p className="text-muted-foreground">Chargement des alertes...</p>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="rounded-md p-8 flex flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Aucune alerte disponible</h3>
        <p className="text-center text-muted-foreground">
          Tous vos stocks sont à des niveaux satisfaisants.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`p-4 rounded-md flex items-start justify-between ${
            alert.alert_type === 'out_of_stock' 
              ? 'bg-red-500/10 border border-red-500/20' 
              : 'bg-amber-500/10 border border-amber-500/20'
          }`}
        >
          <div className="space-y-1">
            <h3 className="font-medium">{alert.name}</h3>
            <div className="text-sm text-muted-foreground">
              {alert.category && <span>Catégorie: {alert.category}</span>}
              {alert.location && (
                <span className="ml-2">
                  • Emplacement: {alert.location} ({alert.location_type === 'warehouse' ? 'Dépôt' : 'PDV'})
                </span>
              )}
            </div>
            <div className="text-sm">
              <span className={`font-semibold ${
                alert.alert_type === 'out_of_stock' ? 'text-red-500' : 'text-amber-500'
              }`}>
                {alert.alert_type === 'out_of_stock' 
                  ? 'Rupture de stock' 
                  : `Stock faible: ${alert.stock} unité${alert.stock > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{formatGNF(alert.price)}</div>
            <div className="text-xs text-muted-foreground">Prix unitaire</div>
          </div>
        </div>
      ))}
    </div>
  );
}
