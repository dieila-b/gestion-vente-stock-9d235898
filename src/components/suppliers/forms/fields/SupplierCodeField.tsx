
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "../SupplierFormSchema";

interface SupplierCodeFieldProps {
  form: UseFormReturn<SupplierFormValues>;
}

export const SupplierCodeField = ({ form }: SupplierCodeFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="supplier_code"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Code Fournisseur</FormLabel>
          <FormControl>
            <Input
              placeholder="Généré automatiquement"
              className="glass-effect bg-gray-100"
              disabled
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
