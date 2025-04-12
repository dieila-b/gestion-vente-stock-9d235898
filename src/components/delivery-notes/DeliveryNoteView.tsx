
import { DeliveryNote } from "@/types/delivery-note";
import { Card } from "@/components/ui/card";
import { isSelectQueryError } from "@/utils/type-utils";

interface DeliveryNoteViewProps {
  deliveryNote: DeliveryNote;
}

export function DeliveryNoteView({ deliveryNote }: DeliveryNoteViewProps) {
  // Helper function to check if a relation has an error
  const hasError = (obj: any): boolean => {
    return obj && typeof obj === 'object' && obj.error === true;
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Numéro de livraison</h3>
            <p className="font-medium">{deliveryNote.delivery_number || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Date de création</h3>
            <p className="font-medium">{new Date(deliveryNote.created_at).toLocaleDateString()}</p>
          </div>

          {deliveryNote.supplier && !hasError(deliveryNote.supplier) && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Fournisseur</h3>
              <p className="font-medium">{deliveryNote.supplier.name || 'N/A'}</p>
            </div>
          )}
          
          {deliveryNote.purchase_order && !hasError(deliveryNote.purchase_order) && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Bon de commande associé</h3>
              <p className="font-medium">{deliveryNote.purchase_order.order_number || 'N/A'}</p>
            </div>
          )}
          
          {deliveryNote.status && (
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Statut</h3>
              <p className="font-medium">{deliveryNote.status}</p>
            </div>
          )}
        </div>
      </Card>
      
      {deliveryNote.notes && (
        <Card className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Notes</h3>
          <p>{deliveryNote.notes}</p>
        </Card>
      )}
      
      {deliveryNote.items && deliveryNote.items.length > 0 && (
        <Card className="p-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Articles</h3>
          <div className="divide-y">
            {deliveryNote.items.map((item) => (
              <div key={item.id} className="py-2">
                <div className="flex justify-between">
                  <p>{item.product?.name || `Produit #${item.product_id}`}</p>
                  <p>Quantité: {item.quantity_received} / {item.quantity_ordered}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
