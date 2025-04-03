
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";

export const useUserData = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const fetchUsers = useCallback(async () => {
    // Only fetch if we haven't already or if we don't have data yet
    if (hasFetchedRef.current && users.length > 0) {
      console.log("Skipping fetch - already have data");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // In development mode, we can simulate user data
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        console.log("Development mode: Simulating user data");
        
        // Simulate some users if none are already present
        const mockUsers: InternalUser[] = [
          {
            id: "dev-1",
            first_name: "Admin",
            last_name: "Utilisateur",
            email: "admin@example.com",
            phone: "+33123456789",
            address: "123 Rue Principale, Paris",
            role: "admin",
            is_active: true
          },
          {
            id: "dev-2",
            first_name: "Manager",
            last_name: "Utilisateur",
            email: "manager@example.com",
            phone: "+33987654321",
            address: "456 Avenue République, Lyon",
            role: "manager",
            is_active: true
          },
          {
            id: "dev-3",
            first_name: "Employé",
            last_name: "Standard",
            email: "employe@example.com",
            phone: "+33567891234",
            address: "789 Boulevard Liberté, Marseille",
            role: "employee",
            is_active: false
          }
        ];
        
        setUsers(mockUsers);
        hasFetchedRef.current = true;
        setIsLoading(false);
        return;
      }

      // In production, make the normal Supabase call
      const { data, error } = await supabase
        .from("internal_users")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) {
        throw error;
      }

      console.log("Fetched users data:", data);
      setUsers(data as InternalUser[]);
      hasFetchedRef.current = true;
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
  }, [users.length]);

  // Method to add a user to the local list
  const addUser = useCallback((user: InternalUser) => {
    console.log("Adding user to local list:", user);
    setUsers(prevUsers => [...prevUsers, user]);
  }, []);

  // Method to update a user in the local list
  const updateUserInList = useCallback((updatedUser: InternalUser) => {
    console.log("Updating user in local list:", updatedUser);
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  }, []);

  return {
    users,
    isLoading,
    fetchUsers,
    addUser,
    updateUserInList
  };
};
