
import { Button } from "@/components/ui/button";

interface ProductFormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isUploading: boolean;
}

export const ProductFormActions = ({ 
  onCancel, 
  onSubmit, 
  isSubmitting,
  isUploading
}: ProductFormActionsProps) => {
  return (
    <div className="flex gap-2 justify-end mt-6 pt-4 border-t border-white/10">
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="enhanced-glass"
      >
        Annuler
      </Button>
      <Button 
        onClick={onSubmit}
        disabled={isSubmitting || isUploading}
      >
        {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
      </Button>
    </div>
  );
};
