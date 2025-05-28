import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { formatGNF } from "@/lib/currency";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DeliveryNote } from "@/types/delivery-note";
import { formatDate } from "@/lib/formatters";

interface DeliveryNoteListProps {
  deliveryNotes: DeliveryNote[];
  isLoading: boolean;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void; // Optional for backwards compatibility
  onApprove?: (id: string) => void; // Optional for backwards compatibility
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

  const formatArticles = (items: any[]) => {
    if (!items || items.length === 0) return "0 article";
    
    const count = items.length;
    
    if (count === 1) {
      return `1 article`;
    }
    return `${count} articles`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N° Livraison</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Fournisseur</TableHead>
          <TableHead>Articles</TableHead>
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
            <TableCell>
              <div className="text-sm">
                {formatArticles(note.items || [])}
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(note.status)}</TableCell>
            <TableCell>{note.purchase_order?.order_number || 'N/A'}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(note.id)}
                  title="Voir"
                  className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(note.id)}
                    title="Modifier"
                    className="h-10 w-10 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </Button>
                )}
                {onApprove && note.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onApprove(note.id)}
                    title="Approuver"
                    className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(note.id)}
                  title="Supprimer"
                  className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white"
                >
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
