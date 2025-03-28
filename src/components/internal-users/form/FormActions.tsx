
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  isEditMode: boolean;
}

export const FormActions = ({ isSubmitting, onCancel, isEditMode }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-4 pt-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Annuler
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting 
          ? "Traitement en cours..." 
          : isEditMode 
            ? "Mettre à jour" 
            : "Ajouter"
        }
      </Button>
    </div>
  );
};
