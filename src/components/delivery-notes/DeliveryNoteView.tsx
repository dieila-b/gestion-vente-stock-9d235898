
import { DeliveryNote } from "@/types/delivery-note";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface DeliveryNoteViewProps {
  deliveryNote: DeliveryNote;
}

export function DeliveryNoteView({ deliveryNote }: DeliveryNoteViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge className="bg-green-100 text-green-800">Reçu</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Inconnu'}</Badge>;
    }
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
            <p className="font-medium">
              {deliveryNote.created_at 
                ? format(new Date(deliveryNote.created_at), "dd MMMM yyyy", { locale: fr }) 
                : 'N/A'}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Fournisseur</h3>
            <p className="font-medium">{deliveryNote.supplier?.name || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Bon de commande associé</h3>
            <p className="font-medium">{deliveryNote.purchase_order?.order_number || 'N/A'}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Statut</h3>
            <div className="mt-1">{getStatusBadge(deliveryNote.status)}</div>
          </div>

          <div>
            <h3 className="font-medium text-sm text-muted-foreground">Montant total</h3>
            <p className="font-medium">
              {deliveryNote.purchase_order?.total_amount?.toLocaleString('fr-FR')} GNF
            </p>
          </div>
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
                  <p>
                    Quantité reçue: {item.quantity_received} / {item.quantity_ordered}
                  </p>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <p>Réf: {item.product?.reference || 'N/A'}</p>
                  <p>Prix unitaire: {item.unit_price?.toLocaleString('fr-FR')} GNF</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
