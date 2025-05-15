
import { z } from "zod";

export interface StockMovement {
  id: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  type: 'in' | 'out';
  reason?: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    reference?: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
  pos_location?: {
    id: string;
    name: string;
  } | null;
}

export interface StockEntryForm {
  productId: string;
  warehouseId: string;
  quantity: number;
  unitPrice: number;
  reason: string;
}

export interface FormValues {
  product: string;
  warehouse: string;
  quantity: number;
  unitPrice?: number;
  reason: string;
}

// Add the missing schema definition
export const stockEntrySchema = z.object({
  productId: z.string().min(1, { message: "Veuillez sélectionner un produit" }),
  warehouseId: z.string().min(1, { message: "Veuillez sélectionner un entrepôt" }),
  quantity: z.number().positive({ message: "La quantité doit être positive" }),
  unitPrice: z.number().nonnegative({ message: "Le prix unitaire ne peut pas être négatif" }),
  reason: z.string().min(3, { message: "Veuillez indiquer un motif valide" })
});
