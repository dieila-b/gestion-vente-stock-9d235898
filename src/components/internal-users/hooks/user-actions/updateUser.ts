
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
    // Vérifier si nous sommes en mode développement
    const isDevelopmentMode = import.meta.env.DEV;
    
    // En mode développement, simuler une mise à jour réussie
    if (isDevelopmentMode) {
      // Créer l'utilisateur mis à jour
      const updatedUser: InternalUser = {
        ...user,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        role: data.role,
        is_active: data.is_active,
        photo_url: data.photo_url !== undefined ? data.photo_url : user.photo_url
      };
      
      // Mettre à jour l'utilisateur dans localStorage
      const existingUsers = JSON.parse(localStorage.getItem('internalUsers') || '[]');
      const updatedUsers = existingUsers.map((u: InternalUser) => 
        u.id === user.id ? updatedUser : u
      );
      localStorage.setItem('internalUsers', JSON.stringify(updatedUsers));
      
      toast({
        title: "Utilisateur mis à jour (mode développeur)",
        description: `${data.first_name} ${data.last_name} a été mis à jour avec succès`,
      });
      
      return updatedUser;
    }

    // En production, mise à jour réelle dans la base de données
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

    const { data: updatedUser, error: updateError } = await supabase
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

    toast({
      title: "Utilisateur mis à jour",
      description: `${data.first_name} ${data.last_name} a été mis à jour avec succès`,
    });
    
    return updatedUser as InternalUser;
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
