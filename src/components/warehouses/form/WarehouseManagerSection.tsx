
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { WarehouseFormValues } from "../WarehouseForm";

interface WarehouseManagerSectionProps {
  form: UseFormReturn<WarehouseFormValues>;
}

export function WarehouseManagerSection({ form }: WarehouseManagerSectionProps) {
  return (
    <FormField
      control={form.control}
      name="manager"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Responsable</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Nom du responsable" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
