
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useSupplierEditForm } from "./hooks/useSupplierEditForm";
import { SupplierFormFields } from "./forms/SupplierFormFields";
import { Supplier } from "@/types/supplier";
import { Button } from "@/components/ui/button";

interface SupplierEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier;
}

export const SupplierEditDialog = ({ isOpen, onOpenChange, supplier }: SupplierEditDialogProps) => {
  const { form, onSubmit, isPending } = useSupplierEditForm({
    onSuccess: () => onOpenChange(false),
    supplier
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-0 max-w-2xl transform perspective-1000 rotate-x-1 hover:rotate-x-0 transition-transform duration-300">
        <DialogTitle className="text-2xl font-bold text-gradient bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 mb-4">
          Modifier le fournisseur
        </DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <SupplierFormFields form={form} />

            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="glass-effect"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="glass-effect bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30"
                disabled={isPending}
              >
                {isPending ? "Modification en cours..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
