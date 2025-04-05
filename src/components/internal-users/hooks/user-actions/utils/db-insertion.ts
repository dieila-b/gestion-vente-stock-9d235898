
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InternalUser } from "@/types/internal-user";
import { CreateUserData } from "../types";

export const insertInternalUser = async (
  userId: string, 
  data: CreateUserData, 
  normalizedEmail: string
): Promise<InternalUser | null> => {
  try {
    console.log("Insertion dans la table internal_users:", userId);
    const { data: insertedUser, error: insertError } = await supabase
      .from("internal_users")
      .insert({
        id: userId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: normalizedEmail,
        phone: data.phone || null,
        address: data.address || null,
        role: data.role,
        is_active: data.is_active,
        photo_url: data.photo_url || null,
        user_id: userId
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Erreur lors de l'insertion de l'utilisateur:", insertError);
      
      // Try to delete the Auth account in case of failure
      try {
        await supabase.auth.admin.deleteUser(userId);
        console.log("Compte Auth supprimé après échec d'insertion");
      } catch (deleteError) {
        console.error("Erreur lors de la suppression du compte Auth après échec:", deleteError);
      }
      
      if (insertError.code === '42501' || insertError.message.includes('permission denied')) {
        toast({
          title: "Erreur d'autorisation",
          description: "Vous n'avez pas les droits nécessaires pour créer un utilisateur. Contactez l'administrateur.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'utilisateur: " + insertError.message,
          variant: "destructive",
        });
      }
      return null;
    }

    // Ensure photo_url is present
    const user: InternalUser = {
      id: insertedUser.id,
      first_name: insertedUser.first_name,
      last_name: insertedUser.last_name,
      email: insertedUser.email,
      phone: insertedUser.phone,
      address: insertedUser.address,
      role: insertedUser.role,
      is_active: insertedUser.is_active,
      photo_url: 'photo_url' in insertedUser ? (insertedUser.photo_url as string | null) : null
    };

    console.log("Utilisateur créé avec succès dans internal_users:", user.email);
    return user;
  } catch (error) {
    console.error("Erreur lors de l'insertion de l'utilisateur:", error);
    return null;
  }
};
