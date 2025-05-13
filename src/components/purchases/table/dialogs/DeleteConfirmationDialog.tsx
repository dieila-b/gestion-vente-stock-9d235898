
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  isProcessing: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmationDialog({
  isOpen,
  isProcessing,
  onOpenChange,
  onConfirm
}: DeleteConfirmationDialogProps) {
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
      console.error("Error in delete confirmation:", error);
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
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer ce bon de commande ? Cette action ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isButtonDisabled}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
            disabled={isButtonDisabled}
          >
            {isButtonDisabled ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              "Supprimer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
