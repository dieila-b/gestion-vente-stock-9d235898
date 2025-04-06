
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { InternalUser } from '@/types/internal-user';
import { fetchUsersFromSupabase } from './supabaseUsers';

export const useUserData = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Define fetchUsers callback outside of the useEffect
  const fetchUsers = useCallback(async () => {
    console.log("Fetching users...");
    setIsLoading(true);
    
    try {
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
  }, []);

  // Initialize users on component mount
  useEffect(() => {
    console.log("useUserData hook mounted");
    fetchUsers();
  }, [fetchUsers]);

  const addUser = useCallback((user: InternalUser) => {
    setUsers(prevUsers => [...prevUsers, user]);
  }, []);

  const updateUserInList = useCallback((updatedUser: InternalUser) => {
    setUsers(prevUsers => prevUsers.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
  }, []);

  return { users, isLoading, fetchUsers, addUser, updateUserInList };
};
