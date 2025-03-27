
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Activity } from "../types/activity";

export function useActivityTransforms() {
  const transformOrderToActivity = (order: any): Activity => {
    return {
      id: order.id,
      action: "Nouvelle vente",
      details: `Commande #${order.order_number} - Montant: ${order.total_amount} GNF`,
      timestamp: new Date(order.created_at),
      time: formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: fr }),
      status: order.status,
      uniqueKey: `order-${order.id}-${Date.now()}`
    };
  };

  const transformCatalogToActivity = (catalogUpdate: any): Activity => {
    return {
      id: catalogUpdate.id,
      action: "Mise à jour du Catalogue",
      details: `Article: ${catalogUpdate.name} - Prix: ${catalogUpdate.price} GNF`,
      timestamp: new Date(catalogUpdate.updated_at),
      time: formatDistanceToNow(new Date(catalogUpdate.updated_at), { addSuffix: true, locale: fr }),
      uniqueKey: `catalog-${catalogUpdate.id}-${Date.now()}`
    };
  };

  const transformTransferToActivity = (transfer: any): Activity => {
    return {
      id: transfer.id,
      action: "Nouveau Transfert",
      details: `Transfert #${transfer.id} - Notes: ${transfer.notes || 'Aucune'}`,
      timestamp: new Date(transfer.created_at),
      time: formatDistanceToNow(new Date(transfer.created_at), { addSuffix: true, locale: fr }),
      uniqueKey: `transfer-${transfer.id}-${Date.now()}`
    };
  };

  const transformStockMovementToActivity = (stockMovement: any): Activity => {
    const isInMovement = stockMovement.type === 'in';
    const actionText = isInMovement ? 'Entrée' : 'Sortie';
    
    return {
      id: stockMovement.id,
      action: `${actionText} de stock`,
      details: `Quantité: ${stockMovement.quantity} - Motif: ${stockMovement.reason || 'Non spécifié'}`,
      timestamp: new Date(stockMovement.created_at),
      time: formatDistanceToNow(new Date(stockMovement.created_at), { addSuffix: true, locale: fr }),
      uniqueKey: `stock-movement-${stockMovement.id}-${Date.now()}`
    };
  };

  return {
    transformOrderToActivity,
    transformCatalogToActivity,
    transformTransferToActivity,
    transformStockMovementToActivity
  };
}
