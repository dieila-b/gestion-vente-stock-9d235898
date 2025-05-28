
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeliveryNote } from "@/types/delivery-note";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeliveryNoteApprovalDialogProps {
  note: DeliveryNote | null;
  open: boolean;
  onClose: () => void;
  onApprovalComplete: () => void;
}

interface ReceivedQuantity {
  id: string;
  quantity_received: number;
}

export function DeliveryNoteApprovalDialog({
  note,
  open,
  onClose,
  onApprovalComplete
}: DeliveryNoteApprovalDialogProps) {
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note?.items) {
      // Initialize with ordered quantities
      const initialQuantities: Record<string, number> = {};
      note.items.forEach(item => {
        initialQuantities[item.id] = item.quantity_ordered;
      });
      setReceivedQuantities(initialQuantities);
    }
  }, [note]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setReceivedQuantities(prev => ({ ...prev, [itemId]: numValue }));
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!note?.items) {
      newErrors.push("Aucun article trouvé");
      setErrors(newErrors);
      return false;
    }

    note.items.forEach(item => {
      const receivedQty = receivedQuantities[item.id] || 0;
      if (receivedQty > item.quantity_ordered) {
        newErrors.push(`La quantité reçue pour ${item.product?.name} ne peut pas dépasser la quantité commandée (${item.quantity_ordered})`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleApprove = async () => {
    if (!note || !validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Update delivery note items with received quantities
      const updates = note.items.map(item => ({
        id: item.id,
        quantity_received: receivedQuantities[item.id] || 0
      }));

      // Update each delivery note item
      for (const update of updates) {
        const { error } = await supabase
          .from('delivery_note_items')
          .update({ quantity_received: update.quantity_received })
          .eq('id', update.id);
        
        if (error) throw error;
      }

      // Update delivery note status to 'received'
      const { error: noteError } = await supabase
        .from('delivery_notes')
        .update({ 
          status: 'received',
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id);
      
      if (noteError) throw noteError;

      // Create purchase invoice from approved delivery note
      await createPurchaseInvoice(note, updates);

      toast.success("Bon de livraison approuvé et facture d'achat créée");
      onApprovalComplete();
      onClose();
    } catch (error: any) {
      console.error('Error approving delivery note:', error);
      toast.error(`Erreur lors de l'approbation: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createPurchaseInvoice = async (deliveryNote: DeliveryNote, receivedItems: ReceivedQuantity[]) => {
    try {
      // Generate invoice number
      const invoiceNumber = `FA-${Date.now()}`;
      
      // Calculate total amount based on received quantities
      let totalAmount = 0;
      receivedItems.forEach(receivedItem => {
        const originalItem = deliveryNote.items.find(item => item.id === receivedItem.id);
        if (originalItem) {
          totalAmount += receivedItem.quantity_received * originalItem.unit_price;
        }
      });

      // Create purchase invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('purchase_invoices')
        .insert({
          invoice_number: invoiceNumber,
          supplier_id: deliveryNote.supplier_id,
          total_amount: totalAmount,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      console.log('Purchase invoice created:', invoice);
    } catch (error: any) {
      console.error('Error creating purchase invoice:', error);
      // Don't throw here to avoid blocking the approval process
      toast.warning("Bon de livraison approuvé mais erreur lors de la création de la facture");
    }
  };

  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Approbation du bon de livraison {note.delivery_number}
          </DialogTitle>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <strong>Fournisseur:</strong> {note.supplier?.name}
            </div>
            <div>
              <strong>Bon de commande:</strong> {note.purchase_order?.order_number}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Quantités reçues par article</h3>
            <p className="text-sm text-gray-600">
              Saisissez les quantités réellement reçues pour chaque article
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Qté commandée</TableHead>
                <TableHead>Qté reçue</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {note.items.map((item) => {
                const receivedQty = receivedQuantities[item.id] || 0;
                const total = receivedQty * item.unit_price;
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.product?.name}</TableCell>
                    <TableCell>{item.product?.reference}</TableCell>
                    <TableCell>{item.quantity_ordered}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={item.quantity_ordered}
                        value={receivedQty}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell>{item.unit_price.toLocaleString('fr-FR')} GNF</TableCell>
                    <TableCell className="font-medium">{total.toLocaleString('fr-FR')} GNF</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Approbation en cours..." : "Approuver et créer la facture"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
