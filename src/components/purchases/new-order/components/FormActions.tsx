
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  isValid: boolean;
  onCancel: () => void;
}

export const FormActions = ({
  isSubmitting,
  isValid,
  onCancel,
}: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-4">
      <Button 
        type="button" 
        variant="outline" 
        className="neo-blur border-white/10 text-white/80"
        onClick={onCancel}
      >
        Annuler
      </Button>
      <Button 
        type="submit" 
        className="neo-blur"
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? "Création en cours..." : "Créer la commande"}
      </Button>
    </div>
  );
};
