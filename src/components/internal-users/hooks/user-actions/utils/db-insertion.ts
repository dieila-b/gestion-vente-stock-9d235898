
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
    
    // Vérifier si l'utilisateur existe déjà dans internal_users
    const { data: existingUser, error: checkError } = await supabase
      .from("internal_users")
      .select("*")
      .eq("email", normalizedEmail);
    
    if (!checkError && existingUser && existingUser.length > 0) {
      console.log("Utilisateur déjà existant dans internal_users:", existingUser[0].email);
      
      // Utilisateur déjà existant, retourner ses informations
      const user: InternalUser = {
        id: existingUser[0].id,
        first_name: existingUser[0].first_name,
        last_name: existingUser[0].last_name,
        email: existingUser[0].email,
        phone: existingUser[0].phone,
        address: existingUser[0].address,
        role: existingUser[0].role,
        is_active: existingUser[0].is_active,
        photo_url: 'photo_url' in existingUser[0] ? (existingUser[0].photo_url as string | null) : null
      };
      
      return user;
    }
    
    // Insérer l'utilisateur dans internal_users
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
        photo_url: data.photo_url || null
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Erreur lors de l'insertion de l'utilisateur:", insertError);
      
      // Ne pas supprimer l'utilisateur Auth si nous ne l'avons pas créé
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
