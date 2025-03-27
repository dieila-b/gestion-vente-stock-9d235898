
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface FormActionsProps {
  onClose: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export const FormActions = ({ onClose, isSubmitting, submitLabel }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="neo-blur hover:bg-white/10"
      >
        Annuler
      </Button>
      <Button
        type="submit"
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        disabled={isSubmitting}
      >
        <FileText className="h-4 w-4 mr-2" />
        {isSubmitting ? "Envoi en cours..." : submitLabel}
      </Button>
    </div>
  );
};
