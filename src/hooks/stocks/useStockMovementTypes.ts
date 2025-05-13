
import * as z from "zod";
import { SelectQueryError } from "@/utils/type-utils";

export const stockEntrySchema = z.object({
  warehouseId: z.string().min(1, "Le dépôt est requis"),
  productId: z.string().min(1, "Le produit est requis"),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  reason: z.string().min(1, "Le motif est requis")
});

export type StockEntryForm = z.infer<typeof stockEntrySchema>;

export interface StockMovement {
  id: string;
  product: {
    id: string;
    name: string;
    reference: string;
  };
  warehouse: {
    id: string;
    name: string;
  };
  pos_location: {
    id: string;
    name: string;
  } | null | undefined | SelectQueryError;
  quantity: number;
  unit_price: number;
  total_value: number;
  reason: string;
  type: "in" | "out";
  created_at: string;
}
