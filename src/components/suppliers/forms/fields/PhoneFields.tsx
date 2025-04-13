
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
  useEffect(() => {
    if (watchedCountry) {
      const phoneCode = getPhoneCodeForCountry(watchedCountry);
      
      // Récupérer les valeurs actuelles des champs téléphone
      const currentPhone = form.getValues("phone") || "";
      const currentLandline = form.getValues("landline") || "";
      
      // Mettre à jour uniquement si vide ou si contient un autre code pays
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
