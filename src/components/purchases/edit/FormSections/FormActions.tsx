
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function FormActions({ onSave, onCancel, isSaving = false }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4 border-t mt-6">
      <Button 
        variant="outline"
        onClick={onCancel}
        disabled={isSaving}
        type="button"
      >
        <X className="w-4 h-4 mr-2" />
        Annuler
      </Button>
      <Button 
        onClick={onSave}
        disabled={isSaving}
        type="button"
        className="bg-green-600 hover:bg-green-700"
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </div>
  );
}
