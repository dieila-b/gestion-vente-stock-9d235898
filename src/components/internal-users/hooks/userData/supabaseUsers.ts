
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

    // Map the data to ensure all required properties are present
    const fetchedUsers: InternalUser[] = data.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || null,
      address: user.address || null,
      role: user.role as "admin" | "manager" | "employee",
      is_active: user.is_active,
      // Handle the case where photo_url might not exist in the database
      photo_url: 'photo_url' in user ? (user.photo_url as string | null) : null
    }));
    
    return fetchedUsers;
  } catch (error) {
    console.error("Error fetching users from Supabase:", error);
    return null;
  }
};
