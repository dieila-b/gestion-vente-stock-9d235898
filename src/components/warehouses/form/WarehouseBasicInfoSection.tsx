
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { WarehouseFormValues } from "../WarehouseForm";

interface WarehouseBasicInfoSectionProps {
  form: UseFormReturn<WarehouseFormValues>;
}

export function WarehouseBasicInfoSection({ form }: WarehouseBasicInfoSectionProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom de l'entrepôt</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Entrepôt Principal" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Localisation</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Alger, Constantine, etc." />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
