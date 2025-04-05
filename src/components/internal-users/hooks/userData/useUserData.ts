
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { InternalUser } from '@/types/internal-user';
import { fetchUsersFromSupabase } from './supabaseUsers';
import { 
  getUsersFromLocalStorage, 
  saveUsersToLocalStorage, 
  createDefaultUsers,
  DEV_USERS_STORAGE_KEY
} from './localStorage';

export const useUserData = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isDevelopmentMode = import.meta.env.DEV;

  // Initialisation - charger les utilisateurs au démarrage
  useEffect(() => {
    // Pré-initialiser les utilisateurs en mode développement
    if (isDevelopmentMode) {
      try {
        const storedUsers = localStorage.getItem(DEV_USERS_STORAGE_KEY);
        if (!storedUsers) {
          console.log("Aucun utilisateur trouvé dans localStorage, création des utilisateurs par défaut");
          const defaultUsers = createDefaultUsers();
          console.log("Utilisateurs par défaut créés:", defaultUsers);
        } else {
          console.log("Utilisateurs existants trouvés dans localStorage");
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation des utilisateurs:", error);
      }
    }
  }, [isDevelopmentMode]);

  const fetchUsers = useCallback(async () => {
    console.log("Récupération des utilisateurs...");
    setIsLoading(true);
    
    try {
      // En mode développement, utiliser localStorage
      if (isDevelopmentMode) {
        console.log("Mode développement: récupération des utilisateurs depuis localStorage");
        const localUsers = getUsersFromLocalStorage();
        
        if (!localUsers || localUsers.length === 0) {
          console.log("Aucun utilisateur trouvé dans localStorage, création des utilisateurs par défaut");
          const defaultUsers = createDefaultUsers();
          setUsers(defaultUsers);
          console.log("Utilisateurs par défaut définis:", defaultUsers);
        } else {
          console.log("Utilisateurs récupérés depuis localStorage:", localUsers);
          setUsers(localUsers);
        }
      } 
      // En mode production, utiliser Supabase
      else {
        console.log("Mode production: récupération des utilisateurs depuis Supabase");
        const supabaseUsers = await fetchUsersFromSupabase();
        
        if (supabaseUsers) {
          console.log("Utilisateurs récupérés depuis Supabase:", supabaseUsers);
          setUsers(supabaseUsers);
        } else {
          console.error("Erreur lors de la récupération des utilisateurs depuis Supabase");
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les utilisateurs",
            variant: "destructive",
          });
          setUsers([]);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les utilisateurs",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [isDevelopmentMode]);

  const addUser = useCallback((user: InternalUser) => {
    setUsers(prevUsers => {
      const updatedUsers = [...prevUsers, user];
      
      // En mode développement, sauvegarder dans localStorage
      if (isDevelopmentMode) {
        console.log("Mode développement: sauvegarde du nouvel utilisateur dans localStorage:", user);
        saveUsersToLocalStorage(updatedUsers);
      }
      
      return updatedUsers;
    });
  }, [isDevelopmentMode]);

  const updateUserInList = useCallback((updatedUser: InternalUser) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      );
      
      // En mode développement, sauvegarder dans localStorage
      if (isDevelopmentMode) {
        console.log("Mode développement: mise à jour de l'utilisateur dans localStorage:", updatedUser);
        saveUsersToLocalStorage(updatedUsers);
      }
      
      return updatedUsers;
    });
  }, [isDevelopmentMode]);

  return { users, isLoading, fetchUsers, addUser, updateUserInList };
};
