
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "../SupplierFormSchema";

interface WebsiteFieldProps {
  form: UseFormReturn<SupplierFormValues>;
}

export const WebsiteField = ({ form }: WebsiteFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="website"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Site web</FormLabel>
          <FormControl>
            <Input
              type="url"
              placeholder="https://www.entreprise.com"
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
