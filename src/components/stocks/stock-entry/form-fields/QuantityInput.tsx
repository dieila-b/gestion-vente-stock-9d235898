
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StockEntryForm } from "@/hooks/stocks/useStockMovementTypes";

interface QuantityInputProps {
  form: UseFormReturn<StockEntryForm>;
}

export function QuantityInput({ form }: QuantityInputProps) {
  return (
    <FormField
      control={form.control}
      name="quantity"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Quantité</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              min="1" 
              {...field}
              onChange={e => field.onChange(parseInt(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
