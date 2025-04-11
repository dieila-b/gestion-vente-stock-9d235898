
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ReturnStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: "pending" | "completed" | "cancelled") => void;
  currentStatus: string;
}

export function ReturnStatusDialog({ isOpen, onClose, onStatusChange, currentStatus }: ReturnStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "completed" | "cancelled">(
    currentStatus === "pending" || currentStatus === "completed" || currentStatus === "cancelled" 
      ? (currentStatus as "pending" | "completed" | "cancelled") 
      : "pending"
  );

  const handleSubmit = () => {
    onStatusChange(selectedStatus);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le statut du retour</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <RadioGroup value={selectedStatus} onValueChange={(val) => setSelectedStatus(val as "pending" | "completed" | "cancelled")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pending" id="pending" />
              <Label htmlFor="pending">En attente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed" id="completed" />
              <Label htmlFor="completed">Terminé</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cancelled" id="cancelled" />
              <Label htmlFor="cancelled">Annulé</Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
