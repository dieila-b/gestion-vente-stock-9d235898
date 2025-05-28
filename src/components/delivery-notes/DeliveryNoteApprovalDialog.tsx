
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeliveryNote } from "@/types/delivery-note";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFetchWarehouses } from "@/hooks/delivery-notes/use-fetch-warehouses";
import { useFetchPOSLocations } from "@/hooks/use-pos-locations";

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
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: warehouses = [] } = useFetchWarehouses();
  const { data: posLocations = [] } = useFetchPOSLocations();

  useEffect(() => {
    if (note?.items) {
      // Initialize with ordered quantities
      const initialQuantities: Record<string, number> = {};
      note.items.forEach(item => {
        initialQuantities[item.id] = item.quantity_ordered;
      });
      setReceivedQuantities(initialQuantities);
    }
    setSelectedLocationId("");
    setErrors([]);
  }, [note]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setReceivedQuantities(prev => ({ ...prev, [itemId]: numValue }));
    setErrors([]);
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!selectedLocationId) {
      newErrors.push("Veuillez sélectionner un emplacement de stockage");
    }

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

  const updateStockForLocation = async (productId: string, quantity: number, unitPrice: number) => {
    if (quantity <= 0) return;

    try {
      // Déterminer le type d'emplacement
      const isWarehouse = warehouses.some(w => w.id === selectedLocationId);
      
      // 1. Créer le mouvement de stock
      const movementData: any = {
        product_id: productId,
        quantity: quantity,
        unit_price: unitPrice,
        total_value: quantity * unitPrice,
        type: 'in',
        reason: `Réception bon de livraison ${note.delivery_number}`
      };

      if (isWarehouse) {
        movementData.warehouse_id = selectedLocationId;
      } else {
        // Pour les PDV, utiliser un entrepôt par défaut car la FK n'accepte que les entrepôts
        const defaultWarehouse = warehouses[0];
        if (defaultWarehouse) {
          movementData.warehouse_id = defaultWarehouse.id;
          movementData.reason = `${movementData.reason} (PDV: ${posLocations.find(p => p.id === selectedLocationId)?.name || 'PDV'})`;
        }
      }

      const { error: movementError } = await supabase
        .from('warehouse_stock_movements')
        .insert(movementData);

      if (movementError) throw movementError;

      // 2. Mettre à jour warehouse_stock
      const stockQuery = supabase
        .from('warehouse_stock')
        .select('id, quantity, unit_price, total_value')
        .eq('product_id', productId);

      if (isWarehouse) {
        stockQuery.eq('warehouse_id', selectedLocationId).is('pos_location_id', null);
      } else {
        stockQuery.eq('pos_location_id', selectedLocationId).is('warehouse_id', null);
      }

      const { data: existingStock, error: stockCheckError } = await stockQuery.maybeSingle();

      if (stockCheckError) throw stockCheckError;

      if (existingStock) {
        // Mise à jour avec calcul de prix moyen pondéré
        const newQuantity = existingStock.quantity + quantity;
        const oldValue = existingStock.quantity * existingStock.unit_price;
        const newValue = quantity * unitPrice;
        const newTotalValue = oldValue + newValue;
        const newUnitPrice = newQuantity > 0 ? newTotalValue / newQuantity : unitPrice;

        const { error: updateError } = await supabase
          .from('warehouse_stock')
          .update({
            quantity: newQuantity,
            unit_price: newUnitPrice,
            total_value: newTotalValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStock.id);

        if (updateError) throw updateError;
      } else {
        // Créer une nouvelle entrée
        const stockData: any = {
          product_id: productId,
          quantity: quantity,
          unit_price: unitPrice,
          total_value: quantity * unitPrice
        };

        if (isWarehouse) {
          stockData.warehouse_id = selectedLocationId;
          stockData.pos_location_id = null;
        } else {
          stockData.pos_location_id = selectedLocationId;
          stockData.warehouse_id = null;
        }

        const { error: insertError } = await supabase
          .from('warehouse_stock')
          .insert(stockData);

        if (insertError) throw insertError;
      }

      // 3. Mettre à jour le stock du catalogue
      const { data: productData, error: productError } = await supabase
        .from('catalog')
        .select('stock')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const newCatalogStock = (productData?.stock || 0) + quantity;
      const { error: catalogUpdateError } = await supabase
        .from('catalog')
        .update({ 
          stock: newCatalogStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (catalogUpdateError) throw catalogUpdateError;

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      throw new Error(`Erreur lors de la mise à jour du stock: ${error.message}`);
    }
  };

  const handleApprove = async () => {
    if (!note || !validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Update delivery note items with received quantities
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

      // 2. Mettre à jour les stocks pour chaque article reçu
      for (const item of note.items) {
        const receivedQty = receivedQuantities[item.id] || 0;
        if (receivedQty > 0) {
          await updateStockForLocation(item.product_id, receivedQty, item.unit_price);
        }
      }

      // 3. Update delivery note status to 'received'
      const { error: noteError } = await supabase
        .from('delivery_notes')
        .update({ 
          status: 'received',
          warehouse_id: selectedLocationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', note.id);
      
      if (noteError) throw noteError;

      // 4. Create purchase invoice from approved delivery note
      await createPurchaseInvoice(note, updates);

      toast.success("Bon de livraison approuvé, stocks mis à jour et facture d'achat créée");
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

  // Combiner les entrepôts et PDV pour la sélection
  const allLocations = [
    ...warehouses.map(w => ({ id: w.id, name: w.name, type: 'Entrepôt' })),
    ...posLocations.map(p => ({ id: p.id, name: p.name, type: 'Point de Vente' }))
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <strong>Fournisseur:</strong> {note.supplier?.name}
            </div>
            <div>
              <strong>Bon de commande:</strong> {note.purchase_order?.order_number}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Emplacement de stockage *</label>
            <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un emplacement" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.length > 0 && (
                  <>
                    <SelectItem value="warehouses-header" disabled className="font-semibold text-sm text-muted-foreground">
                      Entrepôts
                    </SelectItem>
                    {warehouses.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </>
                )}
                {posLocations.length > 0 && (
                  <>
                    <SelectItem value="pos-header" disabled className="font-semibold text-sm text-muted-foreground">
                      Points de Vente
                    </SelectItem>
                    {posLocations.map(pos => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Quantités reçues par article</h3>
            <p className="text-sm text-gray-600">
              Saisissez les quantités réellement reçues pour chaque article. Ces quantités seront ajoutées au stock de l'emplacement sélectionné.
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
            {isSubmitting ? "Approbation en cours..." : "Approuver et mettre à jour les stocks"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
