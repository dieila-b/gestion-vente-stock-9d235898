
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { WarehouseFormValues } from "../WarehouseForm";

interface WarehouseStatusSectionProps {
  form: UseFormReturn<WarehouseFormValues>;
}

export function WarehouseStatusSection({ form }: WarehouseStatusSectionProps) {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Statut</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Actif">Actif</SelectItem>
              <SelectItem value="En maintenance">En maintenance</SelectItem>
              <SelectItem value="Fermé">Fermé</SelectItem>
              <SelectItem value="En construction">En construction</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
