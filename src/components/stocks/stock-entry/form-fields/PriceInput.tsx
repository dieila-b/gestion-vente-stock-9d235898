
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { StockEntryForm } from "@/hooks/stocks/useStockMovementTypes";

interface PriceInputProps {
  form: UseFormReturn<StockEntryForm>;
  disabled?: boolean;
}

export function PriceInput({ form, disabled = false }: PriceInputProps) {
  return (
    <FormField
      control={form.control}
      name="unitPrice"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Prix unitaire</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              step={0.01}
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value || "0"))}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
