
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Printer, Check, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PurchaseOrder } from "@/types/purchase-order";

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onApprove: (orderId: string) => Promise<void>;
  onDelete: (orderId: string) => void;
  onEdit: (orderId: string) => void;
  onPrint: (order: PurchaseOrder) => void;
}

export const PurchaseOrderTable = ({
  orders,
  isLoading,
  onApprove,
  onDelete,
  onEdit,
  onPrint
}: PurchaseOrderTableProps) => {
  const formatArticles = (items: any[]) => {
    if (!items || items.length === 0) return "0 article";
    
    const count = items.length;
    
    if (count === 1) {
      return `1 article`;
    }
    return `${count} articles`;
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Commande</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Articles</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Montant net</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Chargement...</TableCell>
            </TableRow>
          ) : orders?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">Aucun bon de commande trouvé</TableCell>
            </TableRow>
          ) : (
            orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.order_number}</TableCell>
                <TableCell>
                  {format(new Date(order.created_at), "dd/MM/yyyy", { locale: fr })}
                </TableCell>
                <TableCell>{order.supplier.name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatArticles(order.items || [])}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'approved' ? 'bg-green-100 text-green-800' :
                    order.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status === 'approved' ? 'Approuvé' :
                     order.status === 'draft' ? 'Brouillon' :
                     'En attente'}
                  </span>
                </TableCell>
                <TableCell>{order.total_amount.toLocaleString('fr-FR')} GNF</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {order.status !== 'approved' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(order.id)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                          onClick={() => onApprove(order.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => onDelete(order.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPrint(order)}
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
