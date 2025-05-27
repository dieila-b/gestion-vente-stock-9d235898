
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { StockEntryForm } from "@/hooks/stocks/useStockMovementTypes";

interface WarehouseSelectProps {
  form: UseFormReturn<StockEntryForm>;
  warehouses: { id: string; name: string; }[];
  posLocations?: { id: string; name: string; }[];
  disabled?: boolean;
}

export function WarehouseSelect({ form, warehouses, posLocations = [], disabled = false }: WarehouseSelectProps) {
  return (
    <FormField
      control={form.control}
      name="warehouseId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Emplacement</FormLabel>
          <FormControl>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un emplacement" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.length > 0 && (
                  <>
                    <SelectItem value="warehouses-header" disabled className="font-semibold text-sm text-muted-foreground">
                      Entrepôts
                    </SelectItem>
                    {warehouses.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </>
                )}
                {posLocations.length > 0 && (
                  <>
                    <SelectItem value="pos-header" disabled className="font-semibold text-sm text-muted-foreground">
                      Points de Vente
                    </SelectItem>
                    {posLocations.map(pos => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
