
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
  console.log("📋 DeliveryNoteList - Notes:", deliveryNotes?.length || 0);
  
  // Log items for debugging
  deliveryNotes?.forEach((note, index) => {
    console.log(`🔍 Note ${index + 1} (${note.delivery_number}):`, {
      id: note.id,
      itemsCount: note.items?.length || 0,
      items: note.items,
      hasItems: !!note.items,
      itemsIsArray: Array.isArray(note.items)
    });
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!deliveryNotes?.length) {
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
              💡 Pour créer un bon de livraison, approuvez d'abord une commande d'achat.
            </p>
          </div>
        </div>
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
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatArticles = (items: any[]) => {
    console.log("🔍 formatArticles called with:", items);
    console.log("🔍 formatArticles - items type:", typeof items);
    console.log("🔍 formatArticles - items isArray:", Array.isArray(items));
    
    if (!items) {
      console.warn("⚠️ Items is null or undefined");
      return "0 article";
    }
    
    if (!Array.isArray(items)) {
      console.warn("⚠️ Items is not an array:", items);
      return "0 article";
    }
    
    const count = items.length;
    console.log(`📊 Items count: ${count}`);
    
    if (count === 0) return "0 article";
    if (count === 1) return "1 article";
    return `${count} articles`;
  };

  const getItemsPreview = (items: any[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return null;
    }
    
    const productNames = items
      .map(item => item.product?.name)
      .filter(Boolean)
      .slice(0, 2);
    
    if (productNames.length === 0) {
      return "Articles sans nom";
    }
    
    let preview = productNames.join(', ');
    if (items.length > 2) {
      preview += '...';
    }
    
    return preview;
  };

  const handleDeleteClick = async (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("🔄 Delete button clicked for:", id);
    
    try {
      await onDelete(id);
    } catch (error) {
      console.error("❌ Error in delete handler:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {deliveryNotes.length} bon{deliveryNotes.length > 1 ? 's' : ''} de livraison
      </div>
      
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
            const itemsCount = note.items?.length || 0;
            console.log(`🔍 Rendering row for note ${note.delivery_number}:`, {
              itemsLength: itemsCount,
              items: note.items,
              hasItems: !!note.items,
              itemsIsArray: Array.isArray(note.items)
            });
            
            return (
              <TableRow key={note.id}>
                <TableCell className="font-medium">
                  {note.delivery_number}
                </TableCell>
                <TableCell>{note.purchase_order?.order_number || 'N/A'}</TableCell>
                <TableCell>
                  {note.created_at 
                    ? format(new Date(note.created_at), "dd/MM/yyyy", { locale: fr }) 
                    : '-'
                  }
                </TableCell>
                <TableCell>{note.supplier?.name || 'Fournisseur inconnu'}</TableCell>
                <TableCell>
                  <div className="text-sm font-medium">
                    {formatArticles(note.items)}
                  </div>
                  {getItemsPreview(note.items) && (
                    <div className="text-xs text-gray-500 mt-1">
                      {getItemsPreview(note.items)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {getStatusBadge(note.status)}
                </TableCell>
                <TableCell>
                  {(note.purchase_order?.total_amount || 0).toLocaleString('fr-FR')} GNF
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {onEdit && note.status === 'pending' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEdit(note.id)}
                        className="h-8 w-8 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
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
                        className="h-8 w-8 rounded-full bg-green-500 hover:bg-green-600 text-white"
                        title="Approuver"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {note.status === 'pending' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleDeleteClick(note.id, e)}
                        className="h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {onPrint && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onPrint(note.id)} 
                        className="h-8 w-8 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
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
    </div>
  );
}
