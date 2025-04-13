
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { EditDialogActionsProps } from "./types";

export function DialogActions({ isSubmitting, onCancel, disabled = false }: EditDialogActionsProps) {
  return (
    <DialogFooter className="mt-6 gap-2">
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
        disabled={isSubmitting || disabled}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </DialogFooter>
  );
}
