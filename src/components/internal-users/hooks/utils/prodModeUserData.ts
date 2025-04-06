
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";

// Load users from Supabase
export const loadSupabaseUsers = async (): Promise<InternalUser[]> => {
  try {
    // Utiliser Supabase pour récupérer les données
    const { data, error } = await supabase
      .from("internal_users")
      .select("*")
      .order("first_name", { ascending: true });

    if (error) {
      throw error;
    }

    let fetchedUsers: InternalUser[] = [];
    
    if (data && data.length > 0) {
      // Données de Supabase disponibles
      console.log("Données utilisateurs récupérées de Supabase:", data);
      // Map the data to ensure all required properties are present
      fetchedUsers = data.map(user => {
        // Create the user object with the required InternalUser properties
        const internalUser: InternalUser = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone || null,
          address: user.address || null,
          role: user.role as "admin" | "manager" | "employee",
          is_active: user.is_active,
          // Handle the case where photo_url might not exist in the database
          photo_url: null
        };
        
        // Safely add photo_url if it exists in the user object
        if ('photo_url' in user) {
          internalUser.photo_url = user.photo_url as string | null;
        }
        
        return internalUser;
      });
    }
    
    return fetchedUsers;
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
    toast({
      title: "Erreur",
      description: "Impossible de récupérer la liste des utilisateurs",
      variant: "destructive",
    });
    return [];
  }
};
