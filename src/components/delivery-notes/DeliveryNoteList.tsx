
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { DeliveryNote } from "@/types/delivery-note";
import { Button } from "@/components/ui/button";
import { Check, Edit, Eye, Trash2, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DeliveryNoteListProps {
  deliveryNotes: DeliveryNote[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<boolean> | void;
  onApprove?: (id: string) => Promise<boolean> | void;
  onEdit?: (id: string) => void;
  onView: (id: string) => void;
  onPrint?: (id: string) => void;
}

export function DeliveryNoteList({
  deliveryNotes,
  isLoading,
  onDelete,
  onApprove,
  onEdit,
  onView,
  onPrint,
}: DeliveryNoteListProps) {
  console.log("📋 DeliveryNoteList render:", {
    isLoading,
    deliveryNotesCount: deliveryNotes?.length || 0,
    deliveryNotes: deliveryNotes
  });

  if (isLoading) {
    console.log("⏳ Showing loading state");
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!deliveryNotes) {
    console.log("⚠️  deliveryNotes is null or undefined");
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">Erreur: Impossible de charger les bons de livraison</p>
      </div>
    );
  }

  if (!Array.isArray(deliveryNotes)) {
    console.log("⚠️  deliveryNotes is not an array:", typeof deliveryNotes);
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">Erreur: Format de données incorrect</p>
      </div>
    );
  }

  if (deliveryNotes.length === 0) {
    console.log("📭 No delivery notes found");
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
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("📦 No items found for delivery note");
      return "0 article";
    }
    
    const count = items.length;
    console.log(`📦 Found ${count} items for delivery note`);
    
    return `${count} article${count > 1 ? 's' : ''}`;
  };

  console.log("✅ Rendering delivery notes table with", deliveryNotes.length, "notes");

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
        {deliveryNotes.map((note) => {
          console.log(`🔍 Rendering delivery note ${note.delivery_number}:`, {
            id: note.id,
            itemsCount: note.items?.length || 0,
            items: note.items
          });
          
          return (
            <TableRow key={note.id}>
              <TableCell>{note.delivery_number}</TableCell>
              <TableCell>{note.purchase_order?.order_number}</TableCell>
              <TableCell>
                {note.created_at ? format(new Date(note.created_at), "dd/MM/yyyy", { locale: fr }) : '-'}
              </TableCell>
              <TableCell>{note.supplier?.name}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatArticles(note.items)}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(note.status)}
              </TableCell>
              <TableCell>{note.purchase_order?.total_amount?.toLocaleString('fr-FR')} GNF</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {onEdit && note.status === 'pending' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEdit(note.id)}
                      className="h-10 w-10 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onApprove && note.status === 'pending' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onApprove(note.id)} 
                      className="h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 text-white"
                      title="Approuver"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(note.id)} 
                    className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {onPrint && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onPrint(note.id)} 
                      className="h-10 w-10 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
                      title="Imprimer"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
