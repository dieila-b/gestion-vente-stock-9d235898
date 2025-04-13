
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { SupplierFormValues } from "./SupplierFormSchema";
import {
  AddressFields,
  CityField,
  CompanyNameField,
  ContactFields,
  CountryField,
  PhoneFields,
  StatusField,
  WebsiteField
} from "./fields";
import { getCitiesByCountry } from "./fields/CityField";

interface SupplierFormFieldsProps {
  form: UseFormReturn<SupplierFormValues>;
  showSupplierCode?: boolean;
}

export const SupplierFormFields = ({ form, showSupplierCode = false }: SupplierFormFieldsProps) => {
  const [cities, setCities] = useState<string[]>([]);
  const watchedCountry = form.watch("country");
  
  useEffect(() => {
    if (watchedCountry) {
      const citiesForCountry = getCitiesByCountry(watchedCountry);
      setCities(citiesForCountry);
      
      // If the current city isn't in the new list, reset it
      const currentCity = form.getValues("city");
      if (currentCity && !citiesForCountry.includes(currentCity)) {
        form.setValue("city", "");
      }
    } else {
      setCities([]);
    }
  }, [watchedCountry, form]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Réorganisation des champs pour placer Pays juste après Email */}
      <CompanyNameField form={form} />
      
      {/* Le champ ContactFields contient Contact et Email */}
      <ContactFields form={form} />
      
      {/* Pays placé juste après Email */}
      <CountryField form={form} />
      
      {/* Téléphones après le pays */}
      <PhoneFields form={form} watchedCountry={watchedCountry} />
      
      <CityField form={form} watchedCountry={watchedCountry} cities={cities} />
      <AddressFields form={form} />
      <WebsiteField form={form} />
      <StatusField form={form} />
    </div>
  );
};
