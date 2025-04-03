
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";

interface UpdateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee";
  is_active: boolean;
  force_password_change: boolean;
  password?: string;
}

export const updateUser = async (data: UpdateUserData, user: InternalUser): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("internal_users")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        role: data.role,
        is_active: data.is_active,
        force_password_change: data.force_password_change,
        // Only include password if provided
        ...(data.password ? { password: data.password } : {})
      })
      .eq("id", user.id);

    if (error) {
      if (error.code === "42501") {
        toast({
          title: "Permissions insuffisantes",
          description: "Vous n'avez pas les droits d'administrateur nécessaires pour effectuer cette action.",
          variant: "destructive",
        });
      } else {
        throw error;
      }
      return false;
    }

    toast({
      title: "Utilisateur mis à jour",
      description: `${data.first_name} ${data.last_name} a été mis à jour avec succès`,
    });

    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    toast({
      title: "Erreur",
      description: "Impossible de mettre à jour l'utilisateur",
      variant: "destructive",
    });
    return false;
  }
};
