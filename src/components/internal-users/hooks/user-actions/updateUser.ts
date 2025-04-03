
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
  password?: string;
}

export const updateUser = async (data: UpdateUserData, user: InternalUser): Promise<boolean> => {
  try {
    // First, check if we have the current session
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    
    // If we have a session, use it for authentication
    let authHeaders = {};
    if (session) {
      authHeaders = {
        Authorization: `Bearer ${session.access_token}`
      };
    }
    
    const { error } = await supabase
      .from("internal_users")
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        role: data.role,
        is_active: data.is_active
        // Removed password field as it doesn't exist in the database schema
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
