
import { useState, useRef, useCallback, useEffect } from "react";
import { InternalUser } from "@/types/internal-user";
import { loadDevModeUsers, addDevModeUser, updateDevModeUser } from "./utils/devModeUserData";
import { loadSupabaseUsers } from "./utils/prodModeUserData";

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
        // Get users from localStorage in dev mode
        const devUsers = loadDevModeUsers();
        setUsers(devUsers);
      } else {
        // Get users from Supabase in production mode
        const prodUsers = await loadSupabaseUsers();
        setUsers(prodUsers);
      }
      
      hasFetchedRef.current = true;
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      
      // En mode développement, essayer de récupérer depuis localStorage en cas d'erreur
      if (isDevelopmentMode) {
        try {
          const devUsers = loadDevModeUsers();
          setUsers(devUsers);
        } catch (err) {
          console.error("Erreur lors de la récupération des utilisateurs en mode dev:", err);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [isDevelopmentMode]);

  // Méthode pour ajouter un utilisateur à la liste locale
  const addUser = useCallback((user: InternalUser) => {
    console.log("Ajout d'un utilisateur à la liste:", user);
    
    setUsers(prevUsers => {
      if (isDevelopmentMode) {
        return addDevModeUser(prevUsers, user);
      }
      return [...prevUsers, user];
    });
  }, [isDevelopmentMode]);

  // Méthode pour mettre à jour un utilisateur dans la liste locale
  const updateUserInList = useCallback((updatedUser: InternalUser) => {
    console.log("Mise à jour d'un utilisateur dans la liste:", updatedUser);
    
    setUsers(prevUsers => {
      if (isDevelopmentMode) {
        return updateDevModeUser(prevUsers, updatedUser);
      }
      
      return prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
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
