
import { Button } from "@/components/ui/button";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { DeleteDialogActionsProps } from "./types";

export function DialogActions({ isDeleting, onCancel }: DeleteDialogActionsProps) {
  return (
    <AlertDialogFooter>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
      >
        Annuler
      </Button>
      <Button 
        type="submit" 
        disabled={isDeleting}
        className="bg-red-600 text-white hover:bg-red-700"
      >
        {isDeleting ? "Suppression..." : "Supprimer"}
      </Button>
    </AlertDialogFooter>
  );
}
