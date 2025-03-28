
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "../SupplierFormSchema";

interface SupplierCodeFieldProps {
  form: UseFormReturn<SupplierFormValues>;
  supplierCode?: string;
}

export const SupplierCodeField = ({ form, supplierCode }: SupplierCodeFieldProps) => {
  return (
    <FormItem>
      <FormLabel>Code Fournisseur</FormLabel>
      <FormControl>
        <Input
          placeholder="Généré automatiquement"
          className="glass-effect bg-gray-100"
          disabled
          value={supplierCode || 'Auto-généré'}
          readOnly
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
