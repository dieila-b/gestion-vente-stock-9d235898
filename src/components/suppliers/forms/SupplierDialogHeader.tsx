
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const SupplierDialogHeader = () => {
  return (
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-gradient bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
        Ajouter un nouveau fournisseur
      </DialogTitle>
    </DialogHeader>
  );
};
