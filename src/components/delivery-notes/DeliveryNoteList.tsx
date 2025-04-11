
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DeliveryNote } from "@/types/delivery-note";
import { DeliveryNoteActions } from "./DeliveryNoteActions";
import { isSelectQueryError } from "@/utils/supabase-helpers";

interface DeliveryNoteListProps {
  deliveryNotes: DeliveryNote[];
  isLoading: boolean;
  selectedWarehouseId: string;
  onWarehouseSelect: (id: string) => void;
  onApprove: (id: string, warehouseId: string, items: Array<{ id: string; quantity_received: number }>) => void;
  onEdit: (id: string) => void;
  onPrint: (note: DeliveryNote) => void;
  onDelete: (id: string) => void;
  warehouses: Array<{ id: string; name: string }>;
}

export function DeliveryNoteList({
  deliveryNotes,
  isLoading,
  selectedWarehouseId,
  onWarehouseSelect,
  onApprove,
  onEdit,
  onPrint,
  onDelete,
  warehouses
}: DeliveryNoteListProps) {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="text-center">Chargement...</TableCell>
      </TableRow>
    );
  }

  if (!deliveryNotes?.length) {
    return (
      <TableRow>
        <TableCell colSpan={8} className="text-center">Aucun bon de livraison trouvé</TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {deliveryNotes.map((note) => (
        <TableRow key={note.id}>
          <TableCell>{note.delivery_number}</TableCell>
          <TableCell>{note.purchase_order?.order_number}</TableCell>
          <TableCell>
            {format(new Date(note.created_at), "dd/MM/yyyy", { locale: fr })}
          </TableCell>
          <TableCell>{note.supplier.name}</TableCell>
          <TableCell>
            {note.items.reduce((acc, item) => acc + (item.received_quantity || item.quantity_received || 0), 0)} / {note.items.reduce((acc, item) => acc + (item.expected_quantity || item.quantity_ordered || 0), 0)}
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
            <DeliveryNoteActions
              note={note}
              selectedWarehouseId={selectedWarehouseId}
              onWarehouseSelect={onWarehouseSelect}
              onApprove={onApprove}
              onEdit={onEdit}
              onPrint={onPrint}
              onDelete={onDelete}
              warehouses={warehouses}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
