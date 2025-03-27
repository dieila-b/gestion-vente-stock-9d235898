import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, isAfter } from "date-fns";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { OrderRow, CatalogRow, TransferRow, isOrderRow, isCatalogRow, isTransferRow } from "./types/activity";
import { useActivitySubscriptions } from "./hooks/useActivitySubscriptions";
import { ActivityItem } from "./components/ActivityItem";
import { useActivityTransforms } from "./hooks/useActivityTransforms";
import { toast } from "sonner";

export function RecentActivity() {
  const {
    activities,
    isLoading,
    updateRelativeTimes,
    addActivity,
  } = useActivitySubscriptions();

  const { 
    transformOrderToActivity,
    transformCatalogToActivity,
    transformTransferToActivity,
    transformStockMovementToActivity
  } = useActivityTransforms();

  useEffect(() => {
    // Mettre à jour les temps relatifs toutes les minutes
    const timeUpdateInterval = setInterval(updateRelativeTimes, 60000);

    // Configurer les canaux de souscription Supabase
    const ordersChannel = supabase.channel('orders-activities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload: RealtimePostgresChangesPayload<OrderRow>) => {
          console.log("Nouvelle vente reçue:", payload);
          const newOrder = payload.new;
          if (isOrderRow(newOrder) && isAfter(new Date(newOrder.created_at), startOfMonth(new Date()))) {
            const activity = transformOrderToActivity(newOrder);
            addActivity(activity);
            toast.success("Nouvelle vente enregistrée");
          }
        }
      )
      .subscribe();

    const catalogChannel = supabase.channel('catalog-activities')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'catalog' },
        (payload: RealtimePostgresChangesPayload<CatalogRow>) => {
          console.log("Mise à jour du catalogue reçue:", payload);
          const update = payload.new;
          if (isCatalogRow(update) && isAfter(new Date(update.updated_at), startOfMonth(new Date()))) {
            const activity = transformCatalogToActivity(update);
            addActivity(activity);
            toast.info("Stock mis à jour");
          }
        }
      )
      .subscribe();

    const transfersChannel = supabase.channel('transfers-activities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stock_transfers' },
        (payload: RealtimePostgresChangesPayload<TransferRow>) => {
          console.log("Nouveau transfert reçu:", payload);
          const transfer = payload.new;
          if (isTransferRow(transfer) && isAfter(new Date(transfer.created_at), startOfMonth(new Date()))) {
            const activity = transformTransferToActivity(transfer);
            addActivity(activity);
            toast.info("Nouveau transfert de stock");
          }
        }
      )
      .subscribe();

    // Ajouter un canal pour les mouvements de stock
    const stockMovementsChannel = supabase.channel('stock-movements-activities')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'warehouse_stock_movements' },
        (payload) => {
          console.log("Nouveau mouvement de stock reçu:", payload);
          const stockMovement = payload.new;
          if (stockMovement && isAfter(new Date(stockMovement.created_at), startOfMonth(new Date()))) {
            const activity = transformStockMovementToActivity(stockMovement);
            addActivity(activity);
            
            const movementType = stockMovement.type === 'in' ? 'entrée' : 'sortie';
            toast.info(`Nouvelle ${movementType} de stock enregistrée`);
          }
        }
      )
      .subscribe();

    // Nettoyage
    return () => {
      clearInterval(timeUpdateInterval);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(catalogChannel);
      supabase.removeChannel(transfersChannel);
      supabase.removeChannel(stockMovementsChannel);
    };
  }, [addActivity, updateRelativeTimes, transformOrderToActivity, transformCatalogToActivity, transformTransferToActivity, transformStockMovementToActivity]);

  if (isLoading) {
    return (
      <Card className="glass-effect p-6">
        <h2 className="text-lg font-semibold mb-4 text-gradient">
          Activités Récentes
        </h2>
        <div className="text-center text-muted-foreground py-4">
          Chargement...
        </div>
      </Card>
    );
  }

  if (!activities.length) {
    return (
      <Card className="glass-effect p-6">
        <h2 className="text-lg font-semibold mb-4 text-gradient">
          Activités Récentes
        </h2>
        <div className="text-center text-muted-foreground py-4">
          Aucune activité récente
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-effect p-6">
      <h2 className="text-lg font-semibold mb-4 text-gradient">
        Activités Récentes
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityItem
            key={activity.uniqueKey}
            activity={activity}
          />
        ))}
      </div>
    </Card>
  );
}
