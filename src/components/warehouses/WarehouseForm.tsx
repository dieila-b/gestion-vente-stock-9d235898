import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Warehouse } from "./WarehouseTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schéma de validation pour le formulaire d'entrepôt
export const warehouseSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  location: z.string().min(2, { message: "La localisation est requise" }),
  capacity: z.coerce.number().min(1, { message: "La capacité doit être d'au moins 1" }),
  manager: z.string().min(2, { message: "Le nom du manager est requis" }),
  surface: z.coerce.number().min(1, { message: "La surface doit être d'au moins 1m²" }),
  status: z.string().default("Actif")
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;

interface WarehouseFormProps {
  onSubmit: (values: WarehouseFormValues) => void;
  isSubmitting: boolean;
  selectedWarehouse: Warehouse | null;
  onCancel: () => void;
}

export function WarehouseForm({ 
  onSubmit, 
  isSubmitting, 
  selectedWarehouse, 
  onCancel 
}: WarehouseFormProps) {
  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: selectedWarehouse?.name || "",
      location: selectedWarehouse?.location || "",
      capacity: selectedWarehouse?.capacity || 0,
      surface: selectedWarehouse?.surface || 0,
      manager: selectedWarehouse?.manager || "",
      status: selectedWarehouse?.status || "Actif"
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
        
        <div className="flex justify-end gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : selectedWarehouse ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
