
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
  console.log("=== APPROVAL DIALOG FOOTER RENDER ===");
  console.log("ApprovalDialogFooter - isSubmitting:", isSubmitting);
  
  const handleApproveClick = () => {
    console.log("=== APPROVE BUTTON CLICKED ===");
    console.log("Approve button clicked! Calling onApprove...");
    onApprove();
  };

  const handleCancelClick = () => {
    console.log("=== CANCEL BUTTON CLICKED ===");
    console.log("Cancel button clicked! Calling onClose...");
    onClose();
  };

  return (
    <DialogFooter className="gap-2">
      <Button 
        variant="outline" 
        onClick={handleCancelClick} 
        disabled={isSubmitting}
      >
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
