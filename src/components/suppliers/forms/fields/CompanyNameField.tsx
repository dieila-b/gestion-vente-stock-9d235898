
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "../SupplierFormSchema";

interface CompanyNameFieldProps {
  form: UseFormReturn<SupplierFormValues>;
}

export const CompanyNameField = ({ form }: CompanyNameFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nom de l'entreprise</FormLabel>
          <FormControl>
            <Input
              placeholder="Entrez le nom"
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
