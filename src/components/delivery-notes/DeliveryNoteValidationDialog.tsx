
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeliveryNote } from "@/types/delivery-note";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeliveryNoteValidationDialogProps {
  note: DeliveryNote | null;
  warehouseId: string;
  onWarehouseSelect: (id: string) => void;
  onValidate: (noteId: string, items: Array<{ id: string; quantity_received: number }>) => void;
  onCancel: () => void;
  warehouses: Array<{ id: string; name: string }>;
  open: boolean;
}

export function DeliveryNoteValidationDialog({
  note,
  warehouseId,
  onWarehouseSelect,
  onValidate,
  onCancel,
  warehouses,
  open
}: DeliveryNoteValidationDialogProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantities(prev => ({ ...prev, [itemId]: numValue }));
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!warehouseId) {
      newErrors.push("Veuillez sélectionner un entrepôt");
    }

    note?.items.forEach(item => {
      const receivedQty = quantities[item.id] || 0;
      if (receivedQty === 0) {
        newErrors.push(`La quantité reçue pour ${item.product.name} doit être spécifiée`);
      }
      if (receivedQty > item.quantity_ordered) {
        newErrors.push(`La quantité reçue pour ${item.product.name} ne peut pas dépasser la quantité commandée`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleValidate = () => {
    if (!note) return;
    
    if (validateForm()) {
      const validatedItems = note.items.map(item => ({
        id: item.id,
        quantity_received: quantities[item.id] || 0
      }));
      onValidate(note.id, validatedItems);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Validation du bon de livraison {note?.delivery_number}</DialogTitle>
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
          <div className="grid gap-4">
            <div className="flex flex-col space-y-2">
              <label>Entrepôt de réception</label>
              <Select value={warehouseId} onValueChange={onWarehouseSelect}>
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
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Qté commandée</TableHead>
                <TableHead>Qté reçue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {note?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.product.reference}</TableCell>
                  <TableCell>{item.quantity_ordered}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max={item.quantity_ordered}
                      value={quantities[item.id] || ""}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button onClick={handleValidate}>
            Valider la réception
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
