
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DeliveryNote } from "@/types/delivery-note";
import { Button } from "@/components/ui/button";
import { Check, Edit, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DeliveryNoteListProps {
  deliveryNotes: DeliveryNote[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<boolean> | void;
  onApprove?: (id: string) => Promise<boolean> | void;
  onEdit?: (id: string) => void;
  onView: (id: string) => void;
}

export function DeliveryNoteList({
  deliveryNotes,
  isLoading,
  onDelete,
  onApprove,
  onEdit,
  onView,
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

  if (!deliveryNotes?.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Aucun bon de livraison trouvé</p>
      </div>
    );
  }

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

  const formatArticles = (items: any[]) => {
    if (!items || items.length === 0) return "0 article";
    
    const count = items.length;
    const totalOrdered = items.reduce((sum, item) => sum + (item.quantity_ordered || 0), 0);
    const totalReceived = items.reduce((sum, item) => sum + (item.quantity_received || 0), 0);
    
    if (count === 1) {
      return `1 article (${totalReceived}/${totalOrdered})`;
    }
    return `${count} articles (${totalReceived}/${totalOrdered})`;
  };

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
            <TableCell>{note.supplier?.name}</TableCell>
            <TableCell>
              <div className="text-sm">
                {formatArticles(note.items || [])}
              </div>
            </TableCell>
            <TableCell>
              {getStatusBadge(note.status)}
            </TableCell>
            <TableCell>{note.purchase_order?.total_amount?.toLocaleString('fr-FR')} GNF</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => onView(note.id)}>
                  <Eye className="h-4 w-4" />
                </Button>
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(note.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onApprove && note.status === 'pending' && (
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
