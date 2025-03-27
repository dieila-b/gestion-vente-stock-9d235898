
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
      
      // Si les champs de téléphone sont vides ou contiennent seulement un autre indicatif, mettre à jour
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

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Téléphone Mobile</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder={watchedCountry ? getPhoneCodeForCountry(watchedCountry) + " XX XX XX XX" : "+XX X XX XX XX XX"}
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
                placeholder={watchedCountry ? getPhoneCodeForCountry(watchedCountry) + " XX XX XX XX" : "+XX X XX XX XX XX"}
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
