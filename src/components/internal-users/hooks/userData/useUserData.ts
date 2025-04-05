
import { useState, useRef, useCallback, useEffect } from "react";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";
import { 
  getUsersFromLocalStorage, 
  saveUsersToLocalStorage, 
  createDefaultUsers 
} from "./localStorage";
import { fetchUsersFromSupabase } from "./supabaseUsers";

export const useUserData = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef(false);
  const isDevelopmentMode = import.meta.env.DEV;

  // Fonction pour charger les utilisateurs depuis Supabase ou localStorage en mode dev
  const fetchUsers = useCallback(async () => {
    console.log("Chargement des utilisateurs...");
    setIsLoading(true);
    
    try {
      if (isDevelopmentMode) {
        console.log("Mode développement: Récupération des utilisateurs depuis localStorage");
        const storedUsers = getUsersFromLocalStorage();
        
        if (storedUsers) {
          console.log("Données utilisateurs récupérées du localStorage:", storedUsers);
          setUsers(storedUsers);
        } else {
          console.log("Aucun utilisateur trouvé dans localStorage, création d'utilisateurs par défaut");
          const defaultUsers = createDefaultUsers();
          setUsers(defaultUsers);
        }
        
        hasFetchedRef.current = true;
        setIsLoading(false);
        return;
      }

      // Utiliser Supabase pour récupérer les données
      const fetchedUsers = await fetchUsersFromSupabase();
      
      if (fetchedUsers !== null) {
        console.log("Données utilisateurs récupérées de Supabase:", fetchedUsers);
        setUsers(fetchedUsers);
      }
      
      hasFetchedRef.current = true;
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      
      // En mode développement, essayer de récupérer depuis localStorage en cas d'erreur
      if (isDevelopmentMode) {
        const storedUsers = getUsersFromLocalStorage();
        if (storedUsers) {
          setUsers(storedUsers);
          console.log("Récupération des utilisateurs depuis localStorage après erreur:", storedUsers);
        }
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la liste des utilisateurs",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }
  }, [isDevelopmentMode]);

  // Méthode pour ajouter un utilisateur à la liste locale
  const addUser = useCallback((user: InternalUser) => {
    console.log("Ajout d'un utilisateur à la liste:", user);
    setUsers(prevUsers => {
      const updatedUsers = [...prevUsers, user];
      
      // En mode développement, stocker dans localStorage
      if (isDevelopmentMode) {
        saveUsersToLocalStorage(updatedUsers);
        console.log("Utilisateurs mis à jour dans localStorage après ajout");
      }
      
      return updatedUsers;
    });
  }, [isDevelopmentMode]);

  // Méthode pour mettre à jour un utilisateur dans la liste locale
  const updateUserInList = useCallback((updatedUser: InternalUser) => {
    console.log("Mise à jour d'un utilisateur dans la liste:", updatedUser);
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
      
      // En mode développement, stocker dans localStorage
      if (isDevelopmentMode) {
        saveUsersToLocalStorage(updatedUsers);
        console.log("Utilisateurs mis à jour dans localStorage après mise à jour");
      }
      
      return updatedUsers;
    });
  }, [isDevelopmentMode]);

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchUsers();
    }
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    fetchUsers,
    addUser,
    updateUserInList
  };
};
