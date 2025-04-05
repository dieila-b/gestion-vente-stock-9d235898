
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";

export const fetchUsersFromSupabase = async (): Promise<InternalUser[] | null> => {
  try {
    const { data, error } = await supabase
      .from("internal_users")
      .select("*")
      .order("first_name", { ascending: true });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Mapper les données pour s'assurer que toutes les propriétés requises sont présentes
    const fetchedUsers: InternalUser[] = data.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || null,
      address: user.address || null,
      role: user.role as "admin" | "manager" | "employee",
      is_active: user.is_active,
      // Gérer le cas où photo_url pourrait ne pas exister dans la base de données
      photo_url: 'photo_url' in user ? (user.photo_url as string | null) : null
    }));
    
    return fetchedUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs depuis Supabase:", error);
    return null;
  }
};
