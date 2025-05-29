
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Edit, Check, Printer } from "lucide-react";
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
  onEdit?: (id: string) => void;
  onApprove?: (id: string) => void;
  onPrint?: (id: string) => void;
}

export function DeliveryNoteList({
  deliveryNotes,
  isLoading,
  onView,
  onDelete,
  onEdit,
  onApprove,
  onPrint
}: DeliveryNoteListProps) {
  console.log("DeliveryNoteList rendering with:", deliveryNotes?.length || 0, "notes");
  console.log("DeliveryNoteList - isLoading:", isLoading);
  console.log("DeliveryNoteList - deliveryNotes data:", deliveryNotes);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!deliveryNotes || deliveryNotes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun bon de livraison trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Les bons de livraison créés à partir de commandes approuvées apparaîtront ici.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 Pour créer un bon de livraison, approuvez d'abord une commande d'achat depuis la section "Achats".
            </p>
          </div>
        </div>
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
      console.error("Error formatting date:", error);
      return 'Date inconnue';
    }
  };

  const formatArticles = (items: any[]) => {
    if (!items || items.length === 0) return "0 article";
    
    const count = items.length;
    return count === 1 ? `1 article` : `${count} articles`;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {deliveryNotes.length} bon{deliveryNotes.length > 1 ? 's' : ''} de livraison trouvé{deliveryNotes.length > 1 ? 's' : ''}
      </div>
      
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
          {deliveryNotes.map((note) => {
            if (!note || !note.id) {
              console.warn("Invalid note data:", note);
              return null;
            }
            
            console.log(`Rendering note ${note.id}:`, note);
            return (
              <TableRow key={note.id}>
                <TableCell className="font-medium">{note.delivery_number || 'BL-XXXX'}</TableCell>
                <TableCell>
                  {formatDisplayDate(note.created_at)}
                </TableCell>
                <TableCell>{note.supplier?.name || 'Fournisseur inconnu'}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatArticles(note.items)}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(note.status)}</TableCell>
                <TableCell>{note.purchase_order?.order_number || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {/* Show Edit button only for pending status */}
                    {onEdit && note.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(note.id)}
                        title="Modifier"
                        className="h-10 w-10 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Show Approve button only for pending status */}
                    {onApprove && note.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onApprove(note.id)}
                        title="Approuver"
                        className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Show Delete button only for pending status */}
                    {note.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(note.id)}
                        title="Supprimer"
                        className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Print button is always visible */}
                    {onPrint && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPrint(note.id)}
                        title="Imprimer"
                        className="h-10 w-10 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          }).filter(Boolean)}
        </TableBody>
      </Table>
    </div>
  );
}
