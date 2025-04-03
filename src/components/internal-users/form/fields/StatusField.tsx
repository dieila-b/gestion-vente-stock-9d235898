
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { UserFormValues } from "../../validation/user-form-schema";

interface StatusFieldProps {
  form: UseFormReturn<UserFormValues>;
}

export const StatusField = ({ form }: StatusFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Statut</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="actif" id="status-actif" />
                <FormLabel htmlFor="status-actif" className="font-normal cursor-pointer">
                  Actif
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactif" id="status-inactif" />
                <FormLabel htmlFor="status-inactif" className="font-normal cursor-pointer">
                  Inactif
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="en attente" id="status-attente" />
                <FormLabel htmlFor="status-attente" className="font-normal cursor-pointer">
                  En attente
                </FormLabel>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
