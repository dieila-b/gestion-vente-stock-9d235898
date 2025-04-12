
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DeliveryNote } from "@/types/delivery-note";
import { Button } from "@/components/ui/button";
import { Check, Edit, Trash2, Eye } from "lucide-react";

interface DeliveryNoteListProps {
  deliveryNotes: DeliveryNote[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<boolean> | void;
  onApprove: (id: string) => Promise<boolean> | void;
  onEdit: (id: string) => void;
  selectedWarehouseId?: string;
  onWarehouseSelect?: (id: string) => void;
  warehouses?: Array<{ id: string; name: string }>;
}

export function DeliveryNoteList({
  deliveryNotes,
  isLoading,
  onDelete,
  onApprove,
  onEdit,
  selectedWarehouseId = "",
  onWarehouseSelect = () => {},
  warehouses = []
}: DeliveryNoteListProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Chargement des bons de livraison...</p>
      </div>
    );
  }

  if (!deliveryNotes?.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Aucun bon de livraison trouvé</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Numéro</TableHead>
          <TableHead>Bon de commande</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Fournisseur</TableHead>
          <TableHead>Articles</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveryNotes.map((note) => (
          <TableRow key={note.id}>
            <TableCell>{note.delivery_number}</TableCell>
            <TableCell>{note.purchase_order?.order_number}</TableCell>
            <TableCell>
              {note.created_at ? format(new Date(note.created_at), "dd/MM/yyyy", { locale: fr }) : '-'}
            </TableCell>
            <TableCell>{note.supplier.name}</TableCell>
            <TableCell>
              {note.items.reduce((acc, item) => acc + (item.quantity_received || 0), 0)} / {note.items.reduce((acc, item) => acc + item.quantity_ordered, 0)}
              <div className="text-xs text-gray-500">
                {note.items.map(item => item.product?.name).join(', ')}
              </div>
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                note.status === 'received' ? 'bg-green-100 text-green-800' :
                note.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                note.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {note.status === 'received' ? 'Reçu' :
                 note.status === 'pending' ? 'En attente' : 
                 note.status === 'rejected' ? 'Rejeté' :
                 'Inconnu'}
              </span>
            </TableCell>
            <TableCell>{note.purchase_order?.total_amount?.toLocaleString('fr-FR')} GNF</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(note.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                {note.status === 'pending' && (
                  <Button variant="outline" size="sm" onClick={() => onApprove(note.id)} className="text-green-600">
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => onDelete(note.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
