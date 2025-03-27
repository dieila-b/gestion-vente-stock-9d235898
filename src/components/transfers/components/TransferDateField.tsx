
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { TransferFormValues } from "../schemas/transfer-form-schema";

interface TransferDateFieldProps {
  form: UseFormReturn<TransferFormValues>;
}

export const TransferDateField = ({ form }: TransferDateFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="transfer_date"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Date du transfert</FormLabel>
          <FormControl>
            <Input
              type="datetime-local"
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

