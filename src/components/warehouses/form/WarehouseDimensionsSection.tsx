
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { WarehouseFormValues } from "../WarehouseForm";

interface WarehouseDimensionsSectionProps {
  form: UseFormReturn<WarehouseFormValues>;
}

export function WarehouseDimensionsSection({ form }: WarehouseDimensionsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="surface"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Surface (m²)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                min={0}
                placeholder="500"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="capacity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Capacité (m³)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                min={0}
                placeholder="1000"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
