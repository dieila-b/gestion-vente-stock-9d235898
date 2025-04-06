
import { useState, useCallback } from 'react';
import { InternalUser } from '@/types/internal-user';
import { fetchUsersFromSupabase } from './supabaseUsers';

export const useUserData = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Fetching internal users from database");
      const fetchedUsers = await fetchUsersFromSupabase();
      console.log("Fetched users:", fetchedUsers?.length || 0);
      setUsers(fetchedUsers || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new user to the list
  const addUser = useCallback((user: InternalUser) => {
    setUsers(prevUsers => [user, ...prevUsers]);
  }, []);

  // Update a user in the list
  const updateUserInList = useCallback((updatedUser: InternalUser) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  }, []);

  // Remove a user from the list
  const removeUserFromList = useCallback((userId: string) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  }, []);

  return {
    users,
    isLoading,
    fetchUsers,
    addUser,
    updateUserInList,
    removeUserFromList
  };
};
