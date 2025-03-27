
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatGNF } from "@/lib/currency";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderItemRow } from "./OrderItemRow";
import { OrderActionButtons } from "./OrderActionButtons";
import { useOrderStatus } from "./hooks/useOrderStatus";

interface OrderCardProps {
  order: any;
  isUpdating: boolean;
  setIsUpdating: (value: boolean) => void;
  refetchPreorders: () => void;
  setSelectedOrder: (order: any) => void;
  setShowPaymentDialog: (show: boolean) => void;
}

export function OrderCard({ 
  order, 
  isUpdating, 
  setIsUpdating, 
  refetchPreorders, 
  setSelectedOrder, 
  setShowPaymentDialog 
}: OrderCardProps) {
  const { getStatusIcon, areAllItemsAvailable } = useOrderStatus();

  return (
    <Card key={order.id} className="glass-panel">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(order.status)}
              Client: {order.client.company_name || order.client.contact_name}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Créée le {new Date(order.created_at).toLocaleDateString()}
              {order.client.phone && ` • ${order.client.phone}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
            {areAllItemsAvailable(order) && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                Tous les produits disponibles
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Produits</h4>
            <ul className="space-y-2">
              {order.items.map((item: any) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-medium">{formatGNF(order.total_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payé</p>
              <p className="font-medium">{formatGNF(order.paid_amount)}</p>
            </div>
            {order.remaining_amount > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Reste à payer</p>
                <p className="font-medium text-amber-500">{formatGNF(order.remaining_amount)}</p>
              </div>
            )}
          </div>
          
          <OrderActionButtons 
            order={order}
            isUpdating={isUpdating}
            setIsUpdating={setIsUpdating}
            refetchPreorders={refetchPreorders}
            setSelectedOrder={setSelectedOrder}
            setShowPaymentDialog={setShowPaymentDialog}
          />
        </div>
      </CardContent>
    </Card>
  );
}
