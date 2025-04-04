
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
  status: "actif" | "inactif" | "en attente";
  password?: string;
}

export const updateUser = async (data: UpdateUserData, existingUser: InternalUser): Promise<InternalUser | null> => {
  try {
    // Vérifier les permissions
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: userData, error: roleCheckError } = await supabase
        .from("internal_users")
        .select("role")
        .eq("id", user.id)
        .single();
        
      if (roleCheckError || !userData || !['admin', 'manager'].includes(userData.role)) {
        toast({
          title: "Permissions insuffisantes",
          description: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
          variant: "destructive",
        });
        return null;
      }
    }

    // Préparation des données de mise à jour
    const updateData: any = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      role: data.role,
      is_active: data.is_active,
      status: data.status
    };
    
    // Si un nouveau mot de passe est fourni, simuler son traitement
    // Dans un vrai système, cela serait géré différemment via Auth
    if (data.password) {
      console.log("Mise à jour du mot de passe simulée.");
    }

    // Mise à jour de l'utilisateur en base de données
    const { data: updatedUserData, error: updateError } = await supabase
      .from("internal_users")
      .update(updateData)
      .eq("id", existingUser.id)
      .select("*")
      .single();

    if (updateError) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", updateError);
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
    
    // Add the status field if it's missing in the response
    const typedUserData = updatedUserData as any;
    const finalUserData: InternalUser = {
      ...typedUserData,
      status: typedUserData.status || data.status
    };
    
    return finalUserData;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    toast({
      title: "Erreur",
      description: "Impossible de mettre à jour l'utilisateur",
      variant: "destructive",
    });
    return null;
  }
};
