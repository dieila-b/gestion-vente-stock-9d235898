
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { TransferFormValues } from "../schemas/transfer-form-schema";
import { useState, useEffect } from "react";

interface TransferLocationFieldsProps {
  form: UseFormReturn<TransferFormValues>;
  warehouses: any[];
  posLocations: any[];
  transferType: "depot_to_pos" | "pos_to_depot" | "depot_to_depot";
}

export const TransferLocationFields = ({
  form,
  warehouses,
  posLocations,
  transferType,
}: TransferLocationFieldsProps) => {
  const [safeWarehouses, setSafeWarehouses] = useState<any[]>([]);
  const [safePosLocations, setSafePosLocations] = useState<any[]>([]);

  // Ensure we always have arrays even if the props are undefined
  useEffect(() => {
    console.log("TransferLocationFields received warehouses:", warehouses);
    console.log("TransferLocationFields received posLocations:", posLocations);
    setSafeWarehouses(warehouses || []);
    setSafePosLocations(posLocations || []);
  }, [warehouses, posLocations]);

  return (
    <>
      {(transferType === 'depot_to_pos' || transferType === 'depot_to_depot') && (
        <FormField
          control={form.control}
          name="source_warehouse_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dépôt source</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-background/95 border border-gray-300">
                    <SelectValue placeholder="Sélectionnez le dépôt source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent 
                  position="popper" 
                  className="z-[9999] bg-background border border-gray-300 shadow-lg"
                  sideOffset={4}
                >
                  {safeWarehouses.length > 0 ? (
                    safeWarehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>Aucun entrepôt disponible</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {transferType === 'pos_to_depot' && (
        <FormField
          control={form.control}
          name="source_pos_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Point de vente source</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-background/95 border border-gray-300">
                    <SelectValue placeholder="Sélectionnez le point de vente source" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent 
                  position="popper" 
                  className="z-[9999] bg-background border border-gray-300 shadow-lg"
                  sideOffset={4}
                >
                  {safePosLocations.length > 0 ? (
                    safePosLocations.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>Aucun point de vente disponible</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(transferType === 'pos_to_depot' || transferType === 'depot_to_depot') && (
        <FormField
          control={form.control}
          name="destination_warehouse_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dépôt de destination</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-background/95 border border-gray-300">
                    <SelectValue placeholder="Sélectionnez le dépôt de destination" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent 
                  position="popper" 
                  className="z-[9999] bg-background border border-gray-300 shadow-lg"
                  sideOffset={4}
                >
                  {safeWarehouses.length > 0 ? (
                    safeWarehouses.map((warehouse) => (
                      <SelectItem 
                        key={warehouse.id} 
                        value={warehouse.id}
                        disabled={transferType === 'depot_to_depot' && warehouse.id === form.watch('source_warehouse_id')}
                      >
                        {warehouse.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>Aucun entrepôt disponible</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {transferType === 'depot_to_pos' && (
        <FormField
          control={form.control}
          name="destination_pos_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Point de vente de destination</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-background/95 border border-gray-300">
                    <SelectValue placeholder="Sélectionnez le point de vente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent 
                  position="popper" 
                  className="z-[9999] bg-background border border-gray-300 shadow-lg"
                  sideOffset={4}
                >
                  {safePosLocations.length > 0 ? (
                    safePosLocations.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>Aucun point de vente disponible</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
