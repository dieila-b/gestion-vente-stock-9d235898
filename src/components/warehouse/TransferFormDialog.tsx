
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransferFormDialogProps {
  open: boolean;
  onClose: () => void;
  formState: any;
  isSubmitting: boolean;
  warehouses: any[];
  posLocations: any[];
  products: any[];
  onSourceWarehouseChange: (warehouseId: string) => void;
  onDestinationWarehouseChange: (warehouseId: string) => void;
  onProductSelect: (product: any) => void;
  onQuantityChange: (index: number, quantity: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

export const TransferFormDialog: React.FC<TransferFormDialogProps> = ({
  open,
  onClose,
  formState,
  isSubmitting,
  warehouses,
  posLocations,
  products,
  onSourceWarehouseChange,
  onDestinationWarehouseChange,
  onProductSelect,
  onQuantityChange,
  onSubmit,
  isEditing,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Transfer' : 'Create New Transfer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source-warehouse">Source Warehouse</Label>
              <Select 
                value={formState.source_warehouse_id} 
                onValueChange={onSourceWarehouseChange}
              >
                <SelectTrigger id="source-warehouse">
                  <SelectValue placeholder="Select source warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination-warehouse">Destination Warehouse</Label>
              <Select 
                value={formState.destination_warehouse_id} 
                onValueChange={onDestinationWarehouseChange}
              >
                <SelectTrigger id="destination-warehouse">
                  <SelectValue placeholder="Select destination warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Products</Label>
            {formState.products.length > 0 ? (
              <div className="space-y-2">
                {formState.products.map((product, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-grow">{product.product_name}</div>
                    <Input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => onQuantityChange(index, parseInt(e.target.value))}
                      className="w-24"
                      min={1}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded border border-dashed border-gray-300 p-4 text-center">
                <p className="text-sm text-muted-foreground">No products added</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
