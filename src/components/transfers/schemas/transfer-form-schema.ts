
import * as z from "zod";

export const transferFormSchema = z.object({
  source_warehouse_id: z.string().optional(),
  source_pos_id: z.string().optional(),
  destination_warehouse_id: z.string().optional(),
  destination_pos_id: z.string().optional(),
  transfer_type: z.enum(["depot_to_pos", "pos_to_depot", "depot_to_depot", "pos_to_pos"], {
    required_error: "Veuillez sélectionner un type de transfert"
  }),
  notes: z.string().optional(),
  status: z.enum(["pending", "completed", "cancelled"]),
  transfer_date: z.string(),
  product_id: z.string({
    required_error: "Veuillez sélectionner un article"
  }),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
}).superRefine((data, ctx) => {
  // Validation spécifique au type de transfert
  if (data.transfer_type === 'depot_to_pos') {
    if (!data.source_warehouse_id) {
      ctx.addIssue({
        code: "custom",
        message: "Le dépôt source est requis pour un transfert vers PDV",
        path: ["source_warehouse_id"],
      });
    }
    if (!data.destination_pos_id) {
      ctx.addIssue({
        code: "custom",
        message: "Le point de vente de destination est requis",
        path: ["destination_pos_id"],
      });
    }
  } else if (data.transfer_type === 'pos_to_depot') {
    if (!data.source_pos_id) {
      ctx.addIssue({
        code: "custom",
        message: "Le point de vente source est requis",
        path: ["source_pos_id"],
      });
    }
    if (!data.destination_warehouse_id) {
      ctx.addIssue({
        code: "custom",
        message: "Le dépôt de destination est requis",
        path: ["destination_warehouse_id"],
      });
    }
  } else if (data.transfer_type === 'depot_to_depot') {
    if (!data.source_warehouse_id) {
      ctx.addIssue({
        code: "custom",
        message: "Le dépôt source est requis",
        path: ["source_warehouse_id"],
      });
    }
    if (!data.destination_warehouse_id) {
      ctx.addIssue({
        code: "custom",
        message: "Le dépôt de destination est requis",
        path: ["destination_warehouse_id"],
      });
    }
    if (data.source_warehouse_id === data.destination_warehouse_id) {
      ctx.addIssue({
        code: "custom",
        message: "Les dépôts source et destination doivent être différents",
        path: ["destination_warehouse_id"],
      });
    }
  } else if (data.transfer_type === 'pos_to_pos') {
    if (!data.source_pos_id) {
      ctx.addIssue({
        code: "custom",
        message: "Le point de vente source est requis",
        path: ["source_pos_id"],
      });
    }
    if (!data.destination_pos_id) {
      ctx.addIssue({
        code: "custom",
        message: "Le point de vente de destination est requis",
        path: ["destination_pos_id"],
      });
    }
    if (data.source_pos_id === data.destination_pos_id) {
      ctx.addIssue({
        code: "custom",
        message: "Les points de vente source et destination doivent être différents",
        path: ["destination_pos_id"],
      });
    }
  }
});

export type TransferFormValues = z.infer<typeof transferFormSchema>;
