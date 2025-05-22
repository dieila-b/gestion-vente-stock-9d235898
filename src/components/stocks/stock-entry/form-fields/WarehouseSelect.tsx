
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { StockEntryForm } from "@/hooks/stocks/useStockMovementTypes";

interface WarehouseSelectProps {
  form: UseFormReturn<StockEntryForm>;
  warehouses: { id: string; name: string; }[];
  disabled?: boolean;
}

export function WarehouseSelect({ form, warehouses, disabled = false }: WarehouseSelectProps) {
  return (
    <FormField
      control={form.control}
      name="warehouseId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Entrepôt</FormLabel>
          <FormControl>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un entrepôt" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map(warehouse => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
