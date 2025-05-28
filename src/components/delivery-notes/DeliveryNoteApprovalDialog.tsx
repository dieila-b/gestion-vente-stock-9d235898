
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DeliveryNote } from "@/types/delivery-note";
import { useFetchWarehouses } from "@/hooks/delivery-notes/use-fetch-warehouses";

interface DeliveryNoteApprovalDialogProps {
  deliveryNote: DeliveryNote | null;
  open: boolean;
  onClose: () => void;
  onApprove: (noteId: string, warehouseId: string, items: Array<{ id: string; quantity_received: number }>) => Promise<void>;
}

export function DeliveryNoteApprovalDialog({
  deliveryNote,
  open,
  onClose,
  onApprove
}: DeliveryNoteApprovalDialogProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data: warehouses = [] } = useFetchWarehouses();

  useEffect(() => {
    if (deliveryNote?.items) {
      // Initialize quantities with ordered quantities
      const initialQuantities: Record<string, number> = {};
      deliveryNote.items.forEach(item => {
        initialQuantities[item.id] = item.quantity_ordered;
      });
      setQuantities(initialQuantities);
    }
  }, [deliveryNote]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantities(prev => ({ ...prev, [itemId]: numValue }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!selectedWarehouse) {
      newErrors.push("Veuillez sélectionner un entrepôt");
    }

    if (!deliveryNote?.items?.length) {
      newErrors.push("Aucun article trouvé dans le bon de livraison");
    }

    deliveryNote?.items?.forEach(item => {
      const receivedQty = quantities[item.id] || 0;
      if (receivedQty < 0) {
        newErrors.push(`La quantité reçue pour ${item.product?.name} ne peut pas être négative`);
      }
      if (receivedQty > item.quantity_ordered) {
        newErrors.push(`La quantité reçue pour ${item.product?.name} ne peut pas dépasser la quantité commandée`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleApprove = async () => {
    if (!deliveryNote || !validateForm()) return;

    setIsLoading(true);
    try {
      const validatedItems = deliveryNote.items.map(item => ({
        id: item.id,
        quantity_received: quantities[item.id] || 0
      }));

      await onApprove(deliveryNote.id, selectedWarehouse, validatedItems);
      onClose();
    } catch (error) {
      console.error("Error approving delivery note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedWarehouse("");
    setQuantities({});
    setErrors([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Approbation du bon de livraison {deliveryNote?.delivery_number}
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
          {/* Sélection entrepôt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Entrepôt de réception *</label>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un entrepôt" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tableau des articles */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Articles et quantités reçues</label>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Qté commandée</TableHead>
                    <TableHead>Qté reçue</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryNote?.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product?.name || 'Produit inconnu'}
                      </TableCell>
                      <TableCell>
                        {item.product?.reference || '-'}
                      </TableCell>
                      <TableCell>
                        {item.quantity_ordered}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max={item.quantity_ordered}
                          value={quantities[item.id] || ""}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-24"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        {item.unit_price?.toLocaleString('fr-FR')} GNF
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Information importante */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Une fois approuvé, ce bon de livraison sera automatiquement converti en facture d'achat et le stock sera mis à jour dans l'entrepôt sélectionné.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isLoading ? "Approbation..." : "Approuver et créer la facture"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
