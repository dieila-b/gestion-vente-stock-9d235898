
import * as z from "zod";

export const userFormSchema = z.object({
  first_name: z.string().min(1, { message: "Le prénom est requis" }),
  last_name: z.string().min(1, { message: "Le nom est requis" }),
  email: z.string().email({ message: "Format d'email invalide" }),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  role: z.enum(["admin", "manager", "employee"], {
    required_error: "Le rôle est requis",
  }),
  is_active: z.boolean().optional().default(true),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
