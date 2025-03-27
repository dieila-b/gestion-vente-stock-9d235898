
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import { formatGNF } from "@/lib/currency";
import { CustomerReturn } from "@/types/customer-return";
import { PackageCheck, PackageX, Receipt } from "lucide-react";

interface ReturnDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerReturn: CustomerReturn | null;
}

export function ReturnDetailsDialog({ isOpen, onClose, customerReturn }: ReturnDetailsDialogProps) {
  if (!customerReturn) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-500 border-green-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500 border-red-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complété';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'En attente';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Détails du retour #{customerReturn.return_number}</DialogTitle>
          <DialogDescription>
            Créé le {formatDate(customerReturn.return_date)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
              <p className="text-lg font-medium">{customerReturn.client?.company_name || 'Client inconnu'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Facture associée</h3>
              <p className="text-lg font-medium">{customerReturn.invoice?.invoice_number || 'Aucune facture'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
              <Badge
                className={`${getStatusColor(customerReturn.status)} mt-1 border px-3 py-1`}
                variant="outline"
              >
                {getStatusText(customerReturn.status)}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Montant</h3>
              <p className="text-lg font-medium">{formatGNF(customerReturn.total_amount)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Motif du retour</h3>
              <p className="text-base">{customerReturn.reason || 'Aucun motif spécifié'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <p className="text-base">{customerReturn.notes || 'Aucune note'}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 border rounded-md p-4">
          <h3 className="font-medium mb-3">Articles retournés</h3>
          <div className="space-y-2">
            {customerReturn.returned_items && customerReturn.returned_items.length > 0 ? (
              customerReturn.returned_items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-secondary/20 rounded">
                  <PackageCheck className="h-4 w-4 text-indigo-400" />
                  <span className="text-indigo-100 font-medium">{item.quantity}x</span>
                  <span>{item.product_name}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-4 text-muted-foreground">
                <PackageX className="mr-2 h-5 w-5" />
                Aucun article dans ce retour
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
