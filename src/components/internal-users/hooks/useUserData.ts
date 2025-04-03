
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
      // En mode développement, nous pouvons simuler des données utilisateurs
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment && users.length === 0) {
        console.log("Mode développement: Simulation de données utilisateurs");
        
        // Simuler quelques utilisateurs si aucun n'est déjà présent
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
        setIsLoading(false);
        return;
      }

      // En production ou si des utilisateurs sont déjà chargés, faire l'appel Supabase normal
      const { data, error } = await supabase
        .from("internal_users")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) {
        throw error;
      }

      // Si nous sommes en développement et qu'il n'y a pas de données,
      // gardons nos données simulées
      if (isDevelopment && (!data || data.length === 0) && users.length > 0) {
        setIsLoading(false);
        return;
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

  // Nouvelle méthode pour ajouter un utilisateur à la liste locale
  const addUser = (user: InternalUser) => {
    setUsers(prevUsers => [...prevUsers, user]);
  };

  // Nouvelle méthode pour mettre à jour un utilisateur dans la liste locale
  const updateUserInList = (updatedUser: InternalUser) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  return {
    users,
    isLoading,
    fetchUsers,
    addUser,
    updateUserInList
  };
};
