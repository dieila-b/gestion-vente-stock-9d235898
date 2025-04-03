
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee";
  is_active: boolean;
}

export const createUser = async (data: CreateUserData): Promise<string | null> => {
  try {
    const { data: userData, error } = await supabase
      .from("internal_users")
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        // Removed password field as it doesn't exist in the database schema
        phone: data.phone || null,
        address: data.address || null,
        role: data.role,
        is_active: data.is_active
      })
      .select("id")
      .single();

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
      return null;
    }

    toast({
      title: "Utilisateur créé",
      description: `${data.first_name} ${data.last_name} a été créé avec succès`,
    });

    return userData?.id || null;
  } catch (error) {
    console.error("Error creating user:", error);
    toast({
      title: "Erreur",
      description: "Impossible de créer l'utilisateur",
      variant: "destructive",
    });
    return null;
  }
};
