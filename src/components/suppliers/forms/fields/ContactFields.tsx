
import { useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "../SupplierFormSchema";
import { getPhoneCodeForCountry } from "./countryUtils";

interface ContactFieldsProps {
  form: UseFormReturn<SupplierFormValues>;
}

export const ContactFields = ({ form }: ContactFieldsProps) => {
  const watchedCountry = form.watch("country");
  
  useEffect(() => {
    if (watchedCountry) {
      const phoneCode = getPhoneCodeForCountry(watchedCountry);
      
      // Only update phone fields if they're empty or if they contain another country code
      const currentPhone = form.getValues("phone") || "";
      const currentLandline = form.getValues("landline") || "";
      
      if (!currentPhone || currentPhone.startsWith("+")) {
        form.setValue("phone", phoneCode + " ");
      }
      
      if (!currentLandline || currentLandline.startsWith("+")) {
        form.setValue("landline", phoneCode + " ");
      }
    }
  }, [watchedCountry, form]);

  return (
    <>
      <FormField
        control={form.control}
        name="contact"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contact principal</FormLabel>
            <FormControl>
              <Input
                placeholder="Nom du contact"
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
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="email@entreprise.com"
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
