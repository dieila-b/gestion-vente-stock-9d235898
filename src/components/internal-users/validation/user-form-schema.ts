
import { z } from "zod";

export const userFormSchema = z.object({
  id: z.string().optional(),
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  address: z.string().optional(),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").optional(),
  confirm_password: z.string().optional(),
  role: z.enum(["admin", "manager", "employee"]),
  is_active: z.boolean().default(true),
}).refine((data) => {
  // Si pas de password et pas d'id (nouveau user), alors erreur
  if (!data.id && !data.password) {
    return false;
  }
  return true;
}, {
  message: "Le mot de passe est obligatoire pour les nouveaux utilisateurs",
  path: ["password"],
}).refine((data) => {
  // Si password est renseigné, confirm_password doit correspondre
  if (data.password && data.password !== data.confirm_password) {
    return false;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

export type UserFormValues = z.infer<typeof userFormSchema>;
