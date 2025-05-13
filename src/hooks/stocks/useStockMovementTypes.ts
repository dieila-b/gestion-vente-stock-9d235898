
import { z } from "zod";

// Schéma pour formulaire d'entrée de stock
export const stockEntrySchema = z.object({
  warehouseId: z.string().min(1, "Veuillez sélectionner un entrepôt"),
  productId: z.string().min(1, "Veuillez sélectionner un produit"),
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  reason: z.string().optional(),
});

// Type pour le formulaire d'entrée de stock
export type StockEntryForm = z.infer<typeof stockEntrySchema>;

// Type pour le mouvement de stock
export interface StockMovement {
  id: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  reason?: string;
  type: 'in' | 'out';
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
  };
}
