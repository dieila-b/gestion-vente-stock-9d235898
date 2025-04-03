
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";

export const useUserData = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  // Memoized fetch function to prevent recreation on each render
  const fetchUsers = useCallback(async () => {
    console.log("Chargement des utilisateurs...");
    setIsLoading(true);
    
    try {
      // En mode développement, simuler des données
      if (process.env.NODE_ENV === 'development') {
        console.log("Mode développement: Simulation de données utilisateurs");
        
        // Données simulées pour le développement
        const mockUsers: InternalUser[] = [
          {
            id: "dev-1",
            first_name: "Admin",
            last_name: "Utilisateur",
            email: "admin@example.com",
            phone: "+33123456789",
            address: "123 Rue Principale, Paris",
            role: "admin",
            is_active: true,
            status: "actif"
          },
          {
            id: "dev-2",
            first_name: "Manager",
            last_name: "Utilisateur",
            email: "manager@example.com",
            phone: "+33987654321",
            address: "456 Avenue République, Lyon",
            role: "manager",
            is_active: true,
            status: "actif"
          },
          {
            id: "dev-3",
            first_name: "Employé",
            last_name: "Standard",
            email: "employe@example.com",
            phone: "+33567891234",
            address: "789 Boulevard Liberté, Marseille",
            role: "employee",
            is_active: false,
            status: "inactif"
          }
        ];
        
        // Mise à jour des données avec les données simulées
        setUsers(mockUsers);
        hasFetchedRef.current = true;
        setIsLoading(false);
        console.log("Utilisateurs simulés chargés:", mockUsers);
        return;
      }

      // En production, utiliser Supabase
      const { data, error } = await supabase
        .from("internal_users")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) {
        throw error;
      }

      console.log("Données utilisateurs récupérées:", data);
      // Convert the data to InternalUser type, ensuring the status field is present
      const fetchedUsers = data.map((user: any) => ({
        ...user,
        status: user.status || "actif" // Default to 'actif' if status is missing
      })) as InternalUser[];
      
      setUsers(fetchedUsers);
      hasFetchedRef.current = true;
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des utilisateurs",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, []); 

  // Méthode pour ajouter un utilisateur à la liste locale
  const addUser = useCallback((user: InternalUser) => {
    console.log("Ajout d'un utilisateur à la liste:", user);
    setUsers(prevUsers => [...prevUsers, user]);
  }, []);

  // Méthode pour mettre à jour un utilisateur dans la liste locale
  const updateUserInList = useCallback((updatedUser: InternalUser) => {
    console.log("Mise à jour d'un utilisateur dans la liste:", updatedUser);
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
