
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferFormSchema, TransferFormValues } from "./schemas/transfer-form-schema";
import { TransferTypeSelect } from "./components/TransferTypeSelect";
import { TransferLocationFields } from "./components/TransferLocationFields";
import { useTransfersData } from "@/hooks/transfers/use-transfers-data";

interface TransferDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TransferFormValues) => void;
  editingTransfer: any | null;
  warehouses: any[];
  products: any[];
}

export const TransferDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  editingTransfer,
  warehouses,
  products,
}: TransferDialogProps) => {
  const [transferType, setTransferType] = useState<"depot_to_pos" | "pos_to_depot" | "depot_to_depot" | "pos_to_pos">("depot_to_depot");
  const { posLocations, createTransfer } = useTransfersData();

  // Setup form with zod validation
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      source_warehouse_id: "",
      source_pos_id: "",
      destination_warehouse_id: "",
      destination_pos_id: "",
      transfer_type: "depot_to_depot",
      notes: "",
      status: "pending",
      transfer_date: new Date().toISOString().split("T")[0],
      product_id: "",
      quantity: 1
    },
  });

  // Handle transfer type change
  const handleTransferTypeChange = (value: string) => {
    const newType = value as "depot_to_pos" | "pos_to_depot" | "depot_to_depot" | "pos_to_pos";
    setTransferType(newType);
    form.setValue("transfer_type", newType);
    
    // Reset location fields when type changes
    form.setValue("source_warehouse_id", "");
    form.setValue("source_pos_id", "");
    form.setValue("destination_warehouse_id", "");
    form.setValue("destination_pos_id", "");
  };

  // Reset form when dialog opens/closes or when editingTransfer changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransfer) {
        // If editing, populate form with transfer data
        const transferTypeValue = editingTransfer.transfer_type || "depot_to_depot";
        setTransferType(transferTypeValue);
        form.reset({
          source_warehouse_id: editingTransfer.source_warehouse_id || "",
          source_pos_id: editingTransfer.source_pos_id || "",
          destination_warehouse_id: editingTransfer.destination_warehouse_id || "",
          destination_pos_id: editingTransfer.destination_pos_id || "",
          transfer_type: transferTypeValue,
          notes: editingTransfer.notes || "",
          status: editingTransfer.status || "pending",
          transfer_date: editingTransfer.transfer_date ? 
            new Date(editingTransfer.transfer_date).toISOString().split("T")[0] : 
            new Date().toISOString().split("T")[0],
          product_id: editingTransfer.product_id || "",
          quantity: editingTransfer.quantity || 1
        });
      } else {
        // If creating, reset to defaults
        setTransferType("depot_to_depot");
        form.reset({
          source_warehouse_id: "",
          source_pos_id: "",
          destination_warehouse_id: "",
          destination_pos_id: "",
          transfer_type: "depot_to_depot",
          notes: "",
          status: "pending",
          transfer_date: new Date().toISOString().split("T")[0],
          product_id: "",
          quantity: 1
        });
      }
    }
  }, [isOpen, editingTransfer, form]);

  // Form submission handler
  const handleSubmit = async (values: TransferFormValues) => {
    console.log("Form values submitted:", values);
    
    try {
      // Utiliser la fonction createTransfer du hook
      createTransfer(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting transfer:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border border-gray-300 bg-background max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editingTransfer ? "Modifier le transfert" : "Nouveau transfert"}
          </DialogTitle>
          <DialogDescription>
            {editingTransfer ? 
              "Modifiez les informations du transfert ci-dessous." :
              "Créez un nouveau transfert entre emplacements."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Transfer Type */}
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

              {/* Location Fields */}
              <TransferLocationFields 
                form={form} 
                warehouses={warehouses} 
                posLocations={posLocations}
                transferType={transferType}
              />
              
              {/* Product */}
              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produit</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.length > 0 ? (
                          products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} {product.reference ? `(${product.reference})` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-products" disabled>
                            Aucun produit disponible
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Quantity */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optionnel)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Notes sur le transfert..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">
                {editingTransfer ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
