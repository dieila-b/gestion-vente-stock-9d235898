
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ApprovalDialogFooterProps {
  isSubmitting: boolean;
  onClose: () => void;
  onApprove: () => void;
}

export function ApprovalDialogFooter({
  isSubmitting,
  onClose,
  onApprove
}: ApprovalDialogFooterProps) {
  console.log("ApprovalDialogFooter - isSubmitting:", isSubmitting);
  
  const handleApproveClick = () => {
    console.log("Approve button clicked!");
    onApprove();
  };

  return (
    <DialogFooter className="gap-2">
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Annuler
      </Button>
      <Button 
        onClick={handleApproveClick} 
        disabled={isSubmitting}
        className="bg-green-600 hover:bg-green-700"
      >
        {isSubmitting ? "Approbation en cours..." : "Approuver et mettre à jour les stocks"}
      </Button>
    </DialogFooter>
  );
}
