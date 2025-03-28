
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";

export const useUserData = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("internal_users")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) {
        throw error;
      }

      setUsers(data as InternalUser[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    fetchUsers
  };
};
