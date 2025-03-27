
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Transfer } from "@/types/transfer";
import { useState } from "react";
import { TransferFormValues } from "./schemas/transfer-form-schema";
import { TransferDateField } from "./components/TransferDateField";
import { TransferStatusField } from "./components/TransferStatusField";
import { TransferNotesField } from "./components/TransferNotesField";
import { TransferActions } from "./components/TransferActions";
import { TransferTypeSelect } from "./components/TransferTypeSelect";
import { TransferLocationFields } from "./components/TransferLocationFields";
import { TransferProductFields } from "./components/TransferProductFields";

interface TransferDialogProps {
  form: UseFormReturn<TransferFormValues>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TransferFormValues) => void;
  editingTransfer: Transfer | null;
  warehouses: any[];
  products: any[];
  posLocations: any[];
}

export const TransferDialog = ({
  form,
  isOpen,
  onOpenChange,
  onSubmit,
  editingTransfer,
  warehouses,
  products,
  posLocations,
}: TransferDialogProps) => {
  const transferType = form.watch('transfer_type');
  const productId = form.watch('product_id');
  const sourceWarehouseId = form.watch('source_warehouse_id');
  const sourcePosId = form.watch('source_pos_id');
  const [availableQuantity, setAvailableQuantity] = useState<number | null>(null);

  const handleTransferTypeChange = (value: string) => {
    const newType = value as "depot_to_pos" | "pos_to_depot" | "depot_to_depot";
    form.setValue('transfer_type', newType);
    
    // Reset all location fields
    form.setValue('source_warehouse_id', undefined);
    form.setValue('destination_warehouse_id', undefined);
    form.setValue('source_pos_id', undefined);
    form.setValue('destination_pos_id', undefined);
    
    // Reset product selection
    form.setValue('product_id', '');
    form.setValue('quantity', 1);
    setAvailableQuantity(null);
    
    // Clear any validation errors
    form.clearErrors();
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-panel border-0 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient">
            {!!editingTransfer ? "Modifier le transfert" : "Créer un nouveau transfert"}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TransferDateField form={form} />

                <FormField
                  control={form.control}
                  name="transfer_type"
                  render={({ field }) => (
                    <TransferTypeSelect
                      field={field}
                      onTypeChange={handleTransferTypeChange}
                    />
                  )}
                />

                <TransferLocationFields
                  form={form}
                  warehouses={warehouses}
                  posLocations={posLocations}
                  transferType={transferType}
                />

                <TransferProductFields
                  form={form}
                  products={products}
                  availableQuantity={availableQuantity}
                />

                <TransferStatusField form={form} />
                <TransferNotesField form={form} />
              </div>

              <TransferActions
                onClose={handleClose}
                isEditing={!!editingTransfer}
              />
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
