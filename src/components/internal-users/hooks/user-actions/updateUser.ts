
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";

export const updateUser = async (
  values: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    address: string | null;
    role: "admin" | "manager" | "employee";
    is_active: boolean;
    force_password_change: boolean;
    password?: string;
  },
  selectedUser: InternalUser
): Promise<boolean> => {
  try {
    // Update existing user data in internal_users table
    const updateData: Partial<InternalUser> = {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone || null,
      address: values.address || null,
      role: values.role,
      is_active: values.is_active || true,
      force_password_change: values.force_password_change,
    };

    const { error } = await supabase
      .from("internal_users")
      .update(updateData)
      .eq("id", selectedUser.id);

    if (error) throw error;

    // If password is provided, update it
    if (values.password && values.password.trim() !== "") {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: values.password,
        data: { force_password_change: values.force_password_change }
      });

      if (passwordError) {
        if (isPermissionError(passwordError)) {
          toast({
            title: "Erreur d'autorisation",
            description: "Vous n'avez pas les droits administrateur nécessaires pour effectuer cette action",
            variant: "destructive",
          });
          return false;
        }
        throw passwordError;
      }
    }
    
    toast({
      title: "Utilisateur mis à jour",
      description: "L'utilisateur a été mis à jour avec succès",
    });
    
    return true;
  } catch (error: any) {
    console.error("Error updating user:", error);
    
    if (isPermissionError(error)) {
      toast({
        title: "Erreur d'autorisation",
        description: "Vous n'avez pas les droits administrateur nécessaires pour mettre à jour des utilisateurs",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Erreur",
      description: "Une erreur s'est produite lors de la mise à jour de l'utilisateur",
      variant: "destructive",
    });
    
    return false;
  }
};

function isPermissionError(error: any): boolean {
  return error.message && (
    error.message.includes('auth/admin') || 
    error.message.includes('not_admin') || 
    error.message.includes('permission')
  );
}
