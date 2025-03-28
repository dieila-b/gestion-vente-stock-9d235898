
import * as z from "zod";

export const supplierFormSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  contact: z.string().min(2, "Le contact doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  website: z.string().url("URL invalide").optional(),
  status: z.enum(["Actif", "En attente", "Inactif"]),
  // Rendre le champ supplier_code optionnel
  supplier_code: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  postal_box: z.string().optional(),
  landline: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

export const defaultSupplierValues: SupplierFormValues = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  status: "En attente",
  supplier_code: "",
  country: "",
  city: "",
  postal_box: "",
  landline: "",
};
