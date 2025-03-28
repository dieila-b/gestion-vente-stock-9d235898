
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isUpdating: boolean;
  onCancel: () => void;
}

export const FormActions = ({ isUpdating, onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-4 mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Annuler
      </Button>
      <Button type="submit">
        {isUpdating ? "Mettre à jour" : "Ajouter"}
      </Button>
    </div>
  );
};
