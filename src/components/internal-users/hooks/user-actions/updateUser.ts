
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InternalUser } from "@/types/internal-user";

interface UpdateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee";
  is_active: boolean;
  password?: string;
  photo_url?: string | null;
}

export const updateUser = async (data: UpdateUserData, user: InternalUser): Promise<InternalUser | null> => {
  try {
    // Préparation des données pour la mise à jour
    const updateData: any = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      role: data.role,
      is_active: data.is_active,
      photo_url: data.photo_url !== undefined ? data.photo_url : user.photo_url
    };

    const { data: updatedUserData, error: updateError } = await supabase
      .from("internal_users")
      .update(updateData)
      .eq("id", user.id)
      .select("*")
      .single();

    if (updateError) {
      console.error("Error updating user:", updateError);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'utilisateur: " + updateError.message,
        variant: "destructive",
      });
      return null;
    }

    // Ensure photo_url is present
    const updatedUser: InternalUser = {
      id: updatedUserData.id,
      first_name: updatedUserData.first_name,
      last_name: updatedUserData.last_name,
      email: updatedUserData.email,
      phone: updatedUserData.phone,
      address: updatedUserData.address,
      role: updatedUserData.role,
      is_active: updatedUserData.is_active,
      photo_url: 'photo_url' in updatedUserData ? (updatedUserData.photo_url as string | null) : null
    };

    toast({
      title: "Utilisateur mis à jour",
      description: `${data.first_name} ${data.last_name} a été mis à jour avec succès`,
    });
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    toast({
      title: "Erreur",
      description: "Impossible de mettre à jour l'utilisateur",
      variant: "destructive",
    });
    return null;
  }
};
