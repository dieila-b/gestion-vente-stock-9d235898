
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface ApproveConfirmationDialogProps {
  isOpen: boolean;
  isProcessing: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function ApproveConfirmationDialog({
  isOpen,
  isProcessing,
  onOpenChange,
  onConfirm
}: ApproveConfirmationDialogProps) {
  const [internalProcessing, setInternalProcessing] = useState(false);
  
  const handleConfirm = async () => {
    try {
      // Prevent multiple clicks
      if (internalProcessing || isProcessing) return;
      
      // Set local processing state
      setInternalProcessing(true);
      
      // Call the provided confirmation handler
      await onConfirm();
    } catch (error) {
      console.error("Error in approve confirmation:", error);
    } finally {
      // Reset local processing state after completion
      setInternalProcessing(false);
    }
  };
  
  // Combine both processing states to disable buttons
  const isButtonDisabled = isProcessing || internalProcessing;

  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Only allow closing if not processing
        if (!isButtonDisabled) {
          onOpenChange(open);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer l'approbation</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir approuver ce bon de commande ? Un bon de livraison sera automatiquement créé.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isButtonDisabled}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700"
            disabled={isButtonDisabled}
          >
            {isButtonDisabled ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approbation...
              </>
            ) : (
              "Approuver"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
