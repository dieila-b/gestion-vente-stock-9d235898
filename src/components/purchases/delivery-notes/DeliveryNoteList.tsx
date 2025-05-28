
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Check, Trash2, Printer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DeliveryNote } from "@/types/delivery-note";

interface DeliveryNoteListProps {
  deliveryNotes: DeliveryNote[];
  isLoading: boolean;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  onApprove?: (id: string) => void;
}

export function DeliveryNoteList({
  deliveryNotes,
  isLoading,
  onView,
  onDelete,
  onEdit,
  onApprove
}: DeliveryNoteListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (deliveryNotes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun bon de livraison trouvé
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">En attente</Badge>;
      case 'received':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Reçu</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status || 'Inconnu'}</Badge>;
    }
  };

  const formatDisplayDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Date inconnue';
    
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date inconnue';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N° Livraison</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Fournisseur</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Bon commande</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deliveryNotes.map((note) => (
          <TableRow key={note.id}>
            <TableCell className="font-medium">{note.delivery_number || 'BL-XXXX'}</TableCell>
            <TableCell>
              {formatDisplayDate(note.created_at)}
            </TableCell>
            <TableCell>{note.supplier?.name || 'Fournisseur inconnu'}</TableCell>
            <TableCell>{getStatusBadge(note.status)}</TableCell>
            <TableCell>{note.purchase_order?.order_number || 'N/A'}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                {/* Éditer - Jaune */}
                {onEdit && note.status !== 'received' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(note.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Approuver - Vert */}
                {onApprove && note.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApprove(note.id)}
                    className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                    title="Approuver"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Imprimer - Gris */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(note.id)}
                  className="bg-gray-500 hover:bg-gray-600 text-white border-gray-500"
                  title="Imprimer"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                
                {/* Supprimer - Rouge */}
                {note.status !== 'received' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(note.id)}
                    className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
