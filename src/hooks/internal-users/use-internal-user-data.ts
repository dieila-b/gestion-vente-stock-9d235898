
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InternalUser, SupabaseInternalUser } from "@/types/internal-user";

export const useInternalUserData = () => {
  const navigate = useNavigate();

  const { data: users, refetch, isLoading, error } = useQuery({
    queryKey: ["internal-users"],
    queryFn: async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          // Ne pas naviguer automatiquement, juste retourner un tableau vide
          console.log("Session not found, returning empty array");
          return [];
        }
        
        console.log("Fetching internal users...");
        const { data, error } = await supabase
          .from("internal_users")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching internal users:", error);
          toast.error("Erreur lors du chargement des utilisateurs");
          throw error;
        }

        console.log("Internal users data:", data);

        // Transform the data to ensure it matches InternalUser type
        const transformedData = (data as SupabaseInternalUser[]).map(user => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address,
          is_active: user.is_active,
          // Set default values for potentially missing properties
          require_password_change: user.require_password_change === true,
          two_factor_enabled: user.two_factor_enabled === true,
          last_login: user.last_login || null,
          created_at: user.created_at,
          updated_at: user.updated_at,
          user_id: user.user_id,
          auth_id: user.auth_id
        }));

        return transformedData as InternalUser[];
      } catch (err) {
        console.error("Error in queryFn:", err);
        // Ne pas relancer l'erreur, retourner un tableau vide à la place
        return [];
      }
    },
    // Ajouter retry: false pour éviter les tentatives répétées en cas d'échec
    retry: false,
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "employee":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return {
    users: users || [],
    isLoading,
    error,
    refetch,
    getRoleBadgeColor,
  };
};
