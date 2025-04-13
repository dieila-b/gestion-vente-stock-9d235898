
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "../SupplierFormSchema";

interface PhoneFieldsProps {
  form: UseFormReturn<SupplierFormValues>;
  watchedCountry: string;
}

export const PhoneFields = ({ form, watchedCountry }: PhoneFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Téléphone Mobile</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder="Numéro de téléphone mobile"
                className="glass-effect"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="landline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Téléphone Fixe</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder="Numéro de téléphone fixe"
                className="glass-effect"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
