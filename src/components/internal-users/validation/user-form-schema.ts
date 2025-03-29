
import * as z from "zod";

export const userFormSchema = z.object({
  id: z.string().optional(),
  first_name: z.string().min(1, { message: "Le prénom est requis" }),
  last_name: z.string().min(1, { message: "Le nom est requis" }),
  email: z.string().email({ message: "Format d'email invalide" }),
  password: z.string()
    .refine(
      (password) => {
        // Skip validation if password field is empty and we're in edit mode
        if (!password) return true;
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
        
        return password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
      },
      {
        message: "Le mot de passe doit contenir au moins 8 caractères dont une majuscule, une minuscule, un chiffre et un caractère spécial"
      }
    )
    .optional()
    .or(z.literal("")),
  confirm_password: z.string().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  role: z.enum(["admin", "manager", "employee"], {
    required_error: "Le rôle est requis",
  }),
  is_active: z.boolean().optional().default(true),
  force_password_change: z.boolean().optional().default(true),
}).refine((data) => {
  if (data.password && data.confirm_password && data.password !== data.confirm_password) {
    return false;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

export type UserFormValues = z.infer<typeof userFormSchema>;
