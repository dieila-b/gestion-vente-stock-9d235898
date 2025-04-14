
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
}

export function FormActions({ onSave, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2 mt-6">
      <Button 
        variant="outline"
        onClick={onCancel}
      >
        Annuler
      </Button>
      <Button 
        onClick={onSave}
      >
        Enregistrer
      </Button>
    </div>
  );
}
