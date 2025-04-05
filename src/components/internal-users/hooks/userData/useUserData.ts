
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

  // Define fetchUsers callback outside of the useEffect to ensure consistent reference
  const fetchUsers = useCallback(async () => {
    console.log("Fetching users...");
    setIsLoading(true);
    
    try {
      // In development mode, use localStorage
      if (isDevelopmentMode) {
        console.log("Development mode: fetching users from localStorage");
        const localUsers = getUsersFromLocalStorage();
        
        if (!localUsers || localUsers.length === 0) {
          console.log("No users found in localStorage, creating default users");
          const defaultUsers = createDefaultUsers();
          setUsers(defaultUsers);
          console.log("Default users set:", defaultUsers);
        } else {
          console.log("Users retrieved from localStorage:", localUsers);
          setUsers(localUsers);
        }
      } 
      // In production mode, use Supabase
      else {
        console.log("Production mode: fetching users from Supabase");
        const supabaseUsers = await fetchUsersFromSupabase();
        
        if (supabaseUsers) {
          console.log("Users retrieved from Supabase:", supabaseUsers);
          setUsers(supabaseUsers);
        } else {
          console.error("Error retrieving users from Supabase");
          toast({
            title: "Erreur",
            description: "Impossible de récupérer les utilisateurs",
            variant: "destructive",
          });
          setUsers([]);
        }
      }
    } catch (error) {
      console.error("Error retrieving users:", error);
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

  // Initialize users on component mount
  useEffect(() => {
    console.log("useUserData hook mounted");
    fetchUsers();
  }, [fetchUsers]);

  const addUser = useCallback((user: InternalUser) => {
    setUsers(prevUsers => {
      const updatedUsers = [...prevUsers, user];
      
      // In development mode, save to localStorage
      if (isDevelopmentMode) {
        console.log("Development mode: saving new user to localStorage:", user);
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
      
      // In development mode, save to localStorage
      if (isDevelopmentMode) {
        console.log("Development mode: updating user in localStorage:", updatedUser);
        saveUsersToLocalStorage(updatedUsers);
      }
      
      return updatedUsers;
    });
  }, [isDevelopmentMode]);

  return { users, isLoading, fetchUsers, addUser, updateUserInList };
};
