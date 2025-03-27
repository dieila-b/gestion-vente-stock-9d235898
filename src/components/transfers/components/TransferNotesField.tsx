
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { TransferFormValues } from "../schemas/transfer-form-schema";

interface TransferNotesFieldProps {
  form: UseFormReturn<TransferFormValues>;
}

export const TransferNotesField = ({ form }: TransferNotesFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Input
              placeholder="Notes additionnelles"
              className="glass-effect"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

