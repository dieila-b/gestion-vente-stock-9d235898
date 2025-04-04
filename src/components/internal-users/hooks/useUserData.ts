
import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";

// Clé pour stocker les utilisateurs dans le localStorage en mode développement
const DEV_USERS_STORAGE_KEY = "dev_internal_users";

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
      // Utiliser Supabase pour récupérer les données
      const { data, error } = await supabase
        .from("internal_users")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) {
        throw error;
      }

      let fetchedUsers = [];
      
      if (data && data.length > 0) {
        // Données de Supabase disponibles
        console.log("Données utilisateurs récupérées de Supabase:", data);
        fetchedUsers = data as InternalUser[];
      } else if (isDevelopmentMode) {
        // En mode développement, récupérer depuis localStorage si disponible
        const storedUsers = localStorage.getItem(DEV_USERS_STORAGE_KEY);
        if (storedUsers) {
          fetchedUsers = JSON.parse(storedUsers) as InternalUser[];
          console.log("Données utilisateurs récupérées du localStorage:", fetchedUsers);
        }
      }
      
      setUsers(fetchedUsers);
      hasFetchedRef.current = true;
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      
      // En mode développement, essayer de récupérer depuis localStorage en cas d'erreur
      if (isDevelopmentMode) {
        const storedUsers = localStorage.getItem(DEV_USERS_STORAGE_KEY);
        if (storedUsers) {
          const devUsers = JSON.parse(storedUsers) as InternalUser[];
          setUsers(devUsers);
          console.log("Récupération des utilisateurs depuis localStorage après erreur:", devUsers);
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
        localStorage.setItem(DEV_USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
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
        localStorage.setItem(DEV_USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
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
