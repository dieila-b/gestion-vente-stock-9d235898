
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define a simple schema for the transfer form
const transferFormSchema = z.object({
  from_warehouse_id: z.string().min(1, "Veuillez sélectionner un entrepôt source"),
  to_warehouse_id: z.string().min(1, "Veuillez sélectionner un entrepôt destination"),
  product_id: z.string().min(1, "Veuillez sélectionner un produit"),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0")
});

type TransferFormValues = z.infer<typeof transferFormSchema>;

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
  // Setup form with zod validation
  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      from_warehouse_id: "",
      to_warehouse_id: "",
      product_id: "",
      quantity: 1
    },
  });

  // Reset form when dialog opens/closes or when editingTransfer changes
  useEffect(() => {
    if (isOpen) {
      if (editingTransfer) {
        // If editing, populate form with transfer data
        form.reset({
          from_warehouse_id: editingTransfer.from_warehouse_id,
          to_warehouse_id: editingTransfer.to_warehouse_id,
          product_id: editingTransfer.product_id,
          quantity: editingTransfer.quantity
        });
      } else {
        // If creating, reset to defaults
        form.reset({
          from_warehouse_id: "",
          to_warehouse_id: "",
          product_id: "",
          quantity: 1
        });
      }
    }
  }, [isOpen, editingTransfer, form]);

  // Debug logs
  useEffect(() => {
    console.log("TransferDialog rendering with:", {
      warehouses: warehouses?.length,
      warehouses_data: warehouses,
      products: products?.length,
      products_data: products
    });
  }, [warehouses, products]);

  // Form submission handler
  const handleSubmit = (values: TransferFormValues) => {
    console.log("Form values:", values);
    onSubmit(values);
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
              "Créez un nouveau transfert entre entrepôts."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Source Warehouse */}
              <FormField
                control={form.control}
                name="from_warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entrepôt source</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'entrepôt source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses?.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Destination Warehouse */}
              <FormField
                control={form.control}
                name="to_warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entrepôt destination</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner l'entrepôt destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses?.map((warehouse) => (
                          <SelectItem 
                            key={warehouse.id} 
                            value={warehouse.id}
                            disabled={warehouse.id === form.watch('from_warehouse_id')}
                          >
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
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
