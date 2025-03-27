
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Transaction {
  id: string;
  discount: number;
  status: string;
}

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSave: () => void;
  isLoading: boolean;
  onDiscountChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function EditTransactionDialog({
  transaction,
  onClose,
  onSave,
  isLoading,
  onDiscountChange,
  onStatusChange,
}: EditTransactionDialogProps) {
  if (!transaction) return null;

  return (
    <Dialog open={!!transaction} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Remise</Label>
            <Input
              type="number"
              value={transaction.discount || 0}
              onChange={(e) => onDiscountChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={transaction.status}
              onValueChange={onStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Complétée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
                <SelectItem value="refunded">Remboursée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
