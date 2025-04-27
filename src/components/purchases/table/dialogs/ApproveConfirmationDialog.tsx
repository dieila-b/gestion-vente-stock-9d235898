
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

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
  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isProcessing) {
      await onConfirm();
    }
  };
  
  return (
    <AlertDialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!isProcessing) {
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
          <AlertDialogCancel disabled={isProcessing}>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-green-600 hover:bg-green-700"
            disabled={isProcessing}
          >
            {isProcessing ? (
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
