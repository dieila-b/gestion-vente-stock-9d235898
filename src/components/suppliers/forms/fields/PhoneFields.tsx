
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "../SupplierFormSchema";
import { getPhoneCodeForCountry } from "./countryUtils";
import { useEffect } from "react";

interface PhoneFieldsProps {
  form: UseFormReturn<SupplierFormValues>;
  watchedCountry: string;
}

export const PhoneFields = ({ form, watchedCountry }: PhoneFieldsProps) => {
  // Run this effect whenever the country changes
  useEffect(() => {
    if (watchedCountry) {
      // Get the phone code for the selected country
      const phoneCode = getPhoneCodeForCountry(watchedCountry);
      if (!phoneCode) return; // Skip if no phone code available
      
      // Get current phone values
      const currentPhone = form.getValues("phone") || "";
      const currentLandline = form.getValues("landline") || "";
      
      // Function to determine if we should update the field
      const shouldUpdateField = (value: string) => {
        // Update if empty or starts with any country code (+)
        return !value || value.trim() === "" || value.startsWith("+");
      };
      
      // Update mobile phone if needed
      if (shouldUpdateField(currentPhone)) {
        // Use setTimeout to ensure this runs after the React render cycle
        setTimeout(() => {
          form.setValue("phone", phoneCode + " ", { shouldValidate: false });
        }, 0);
      }
      
      // Update landline if needed
      if (shouldUpdateField(currentLandline)) {
        setTimeout(() => {
          form.setValue("landline", phoneCode + " ", { shouldValidate: false });
        }, 0);
      }
    }
  }, [watchedCountry, form]);

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
