
import { Button } from "@/components/ui/button";
import { Truck, DollarSign, RefreshCcw } from "lucide-react";
import { useStockCheck } from "./hooks/useStockCheck";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderActionButtonsProps {
  order: any;
  isUpdating: boolean;
  setIsUpdating: (value: boolean) => void;
  refetchPreorders: () => void;
  setSelectedOrder: (order: any) => void;
  setShowPaymentDialog: (show: boolean) => void;
}

export function OrderActionButtons({
  order,
  isUpdating,
  setIsUpdating,
  refetchPreorders,
  setSelectedOrder,
  setShowPaymentDialog
}: OrderActionButtonsProps) {
  const { checkStockAvailability } = useStockCheck(setIsUpdating, refetchPreorders);

  const updateOrderStatus = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('preorders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Statut mis à jour: ${status}`);
      refetchPreorders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsUpdating(false);
    }
  };

  // Vérifier si tous les produits d'une précommande sont disponibles
  const areAllItemsAvailable = (order: any) => {
    return order.items.every((item: any) => item.status === 'available');
  };

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {/* Boutons d'action basés sur le statut */}
      {order.status !== 'canceled' && order.status !== 'delivered' && (
        <>
          <Button 
            size="sm"
            onClick={() => {
              setSelectedOrder(order);
              setShowPaymentDialog(true);
            }}
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            Versement
          </Button>
          
          <Button 
            size="sm"
            variant="outline"
            onClick={() => checkStockAvailability(order.id)}
            disabled={isUpdating}
            className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Vérifier Disponibilité
          </Button>
          
          {(order.status === 'paid' || (order.paid_amount > 0 && areAllItemsAvailable(order))) && (
            <Button 
              size="sm"
              onClick={() => updateOrderStatus(order.id, 'delivered')}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Truck className="h-4 w-4 mr-1" />
              Marquer comme livré
            </Button>
          )}
          
          <Button 
            size="sm"
            variant="destructive"
            onClick={() => updateOrderStatus(order.id, 'canceled')}
            disabled={isUpdating}
          >
            Annuler
          </Button>
        </>
      )}
      
      {order.status === 'canceled' && (
        <Button 
          size="sm"
          variant="outline"
          onClick={() => updateOrderStatus(order.id, 'pending')}
          disabled={isUpdating}
        >
          Réactiver
        </Button>
      )}
    </div>
  );
}
