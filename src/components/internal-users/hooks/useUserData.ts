
import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";

// Clé pour stocker les utilisateurs dans le localStorage en mode développement
const DEV_USERS_STORAGE_KEY = "internalUsers";

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
        const storedUsers = localStorage.getItem(DEV_USERS_STORAGE_KEY);
        
        if (storedUsers) {
          try {
            const parsedUsers = JSON.parse(storedUsers);
            
            // Ensure proper typing by mapping the data
            const typedUsers: InternalUser[] = parsedUsers.map((user: any) => ({
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              phone: user.phone,
              address: user.address,
              role: user.role as "admin" | "manager" | "employee",
              is_active: user.is_active,
              photo_url: user.photo_url as string | null
            }));
            
            console.log("Données utilisateurs récupérées du localStorage:", typedUsers);
            setUsers(typedUsers);
          } catch (error) {
            console.error("Erreur lors du parsing des utilisateurs du localStorage:", error);
            createDefaultUsers();
          }
        } else {
          console.log("Aucun utilisateur trouvé dans localStorage, création d'utilisateurs par défaut");
          createDefaultUsers();
        }
        
        hasFetchedRef.current = true;
        setIsLoading(false);
        return;
      }

      // Utiliser Supabase pour récupérer les données
      const { data, error } = await supabase
        .from("internal_users")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) {
        throw error;
      }

      let fetchedUsers: InternalUser[] = [];
      
      if (data && data.length > 0) {
        // Données de Supabase disponibles
        console.log("Données utilisateurs récupérées de Supabase:", data);
        // Assurer que tous les utilisateurs ont la propriété photo_url
        fetchedUsers = data.map(user => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role as "admin" | "manager" | "employee",
          is_active: user.is_active,
          photo_url: (user.photo_url as string | null)
        }));
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
          try {
            const parsedUsers = JSON.parse(storedUsers);
            const typedUsers: InternalUser[] = parsedUsers.map((user: any) => ({
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              phone: user.phone,
              address: user.address,
              role: user.role as "admin" | "manager" | "employee",
              is_active: user.is_active,
              photo_url: user.photo_url as string | null
            }));
            setUsers(typedUsers);
            console.log("Récupération des utilisateurs depuis localStorage après erreur:", typedUsers);
          } catch (err) {
            console.error("Erreur lors du parsing des utilisateurs après erreur:", err);
          }
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
  
  // Helper function to create default users
  const createDefaultUsers = () => {
    const defaultUsers: InternalUser[] = [
      {
        id: "dev-1743844624581",
        first_name: "Dieila",
        last_name: "Barry",
        email: "wosyrab@gmail.com",
        phone: "623268781",
        address: "Matam",
        role: "admin",
        is_active: true,
        photo_url: null
      },
      {
        id: "dev-1743853323494",
        first_name: "Dieila",
        last_name: "Barry",
        email: "wosyrab@yahoo.fr",
        phone: "623268781",
        address: "Madina",
        role: "manager",
        is_active: true,
        photo_url: null
      }
    ];
    localStorage.setItem(DEV_USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
    setUsers(defaultUsers);
    console.log("Utilisateurs par défaut créés et stockés");
  };

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
