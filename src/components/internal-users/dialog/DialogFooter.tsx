
import { DialogFooter as ShadcnDialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface DialogFooterProps {
  isLoading: boolean;
  onCancel: () => void;
}

export const DialogFooter = ({ isLoading, onCancel }: DialogFooterProps) => {
  return (
    <ShadcnDialogFooter className="pt-4">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
        Annuler
      </Button>
      <Button type="submit" disabled={isLoading} className="gap-2">
        <Save className="h-4 w-4" />
        Enregistrer
      </Button>
    </ShadcnDialogFooter>
  );
};
