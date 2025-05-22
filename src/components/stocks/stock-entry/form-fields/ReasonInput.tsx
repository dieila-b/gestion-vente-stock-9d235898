
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StockEntryForm } from "@/hooks/stocks/useStockMovementTypes";

interface ReasonInputProps {
  form: UseFormReturn<StockEntryForm>;
  disabled?: boolean;
}

export function ReasonInput({ form, disabled = false }: ReasonInputProps) {
  return (
    <FormField
      control={form.control}
      name="reason"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Motif</FormLabel>
          <FormControl>
            <Input 
              {...field} 
              placeholder="Raison de l'entrée de stock"
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
