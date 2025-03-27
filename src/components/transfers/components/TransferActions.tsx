
import { Button } from "@/components/ui/button";

interface TransferActionsProps {
  onClose: () => void;
  isEditing: boolean;
}

export const TransferActions = ({ onClose, isEditing }: TransferActionsProps) => {
  return (
    <div className="flex justify-end gap-4 mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="glass-effect"
      >
        Annuler
      </Button>
      <Button
        type="submit"
        className="glass-effect bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30"
      >
        {isEditing ? "Mettre à jour" : "Créer le transfert"}
      </Button>
    </div>
  );
};

