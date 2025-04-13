
import { Button } from "@/components/ui/button";

interface WarehouseFormActionsProps {
  isSubmitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

export function WarehouseFormActions({ 
  isSubmitting, 
  isEditing, 
  onCancel 
}: WarehouseFormActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Annuler
      </Button>
      <Button 
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enregistrement..." : isEditing ? "Mettre à jour" : "Créer"}
      </Button>
    </div>
  );
}
