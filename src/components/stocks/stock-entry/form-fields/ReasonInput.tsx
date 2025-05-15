
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { StockEntryForm } from "@/hooks/stocks/useStockMovementTypes";

interface ReasonInputProps {
  form: UseFormReturn<StockEntryForm>;
}

export function ReasonInput({ form }: ReasonInputProps) {
  return (
    <FormField
      control={form.control}
      name="reason"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Motif</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Veuillez indiquer le motif de l'entrée"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
