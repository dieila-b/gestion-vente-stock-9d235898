
import { Button } from "@/components/ui/button";

interface DialogFormActionsProps {
  isSubmitting: boolean;
  isUploading: boolean;
  onCancel: () => void;
}

export function DialogFormActions({ 
  isSubmitting, 
  isUploading,
  onCancel 
}: DialogFormActionsProps) {
  return (
    <>
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
        disabled={isSubmitting || isUploading}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </>
  );
}
