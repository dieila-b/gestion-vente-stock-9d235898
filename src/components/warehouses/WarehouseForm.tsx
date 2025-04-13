
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Warehouse } from "./WarehouseTable";
import { WarehouseBasicInfoSection } from "./form/WarehouseBasicInfoSection";
import { WarehouseDimensionsSection } from "./form/WarehouseDimensionsSection";
import { WarehouseManagerSection } from "./form/WarehouseManagerSection";
import { WarehouseStatusSection } from "./form/WarehouseStatusSection";
import { WarehouseFormActions } from "./form/WarehouseFormActions";

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
        <WarehouseBasicInfoSection form={form} />
        <WarehouseDimensionsSection form={form} />
        <WarehouseManagerSection form={form} />
        <WarehouseStatusSection form={form} />
        <WarehouseFormActions 
          isSubmitting={isSubmitting} 
          isEditing={!!selectedWarehouse} 
          onCancel={onCancel} 
        />
      </form>
    </Form>
  );
}
