
import { Button } from "@/components/ui/button";

interface ClientFormActionsProps {
  onClose: () => void;
  isLoading: boolean;
  submitLabel?: string;
}

export const ClientFormActions = ({ onClose, isLoading, submitLabel = "Créer le client" }: ClientFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="enhanced-glass"
      >
        Annuler
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Traitement en cours..." : submitLabel}
      </Button>
    </div>
  );
};
