
import { InternalUser } from "@/types/internal-user";
import { createDefaultUsers, getUsersFromLocalStorage, saveUsersToLocalStorage } from "./localStorage";

// Load users in development mode
export const loadDevModeUsers = (): InternalUser[] => {
  console.log("Mode développement: Récupération des utilisateurs depuis localStorage");
  const users = getUsersFromLocalStorage();
  
  if (users) {
    console.log("Données utilisateurs récupérées du localStorage:", users.length);
    return users;
  } else {
    console.log("Aucun utilisateur trouvé dans localStorage, création d'utilisateurs par défaut");
    return createDefaultUsers();
  }
};

// Add user in development mode
export const addDevModeUser = (users: InternalUser[], user: InternalUser): InternalUser[] => {
  const updatedUsers = [...users, user];
  saveUsersToLocalStorage(updatedUsers);
  console.log("Utilisateurs mis à jour dans localStorage après ajout");
  return updatedUsers;
};

// Update user in development mode
export const updateDevModeUser = (users: InternalUser[], updatedUser: InternalUser): InternalUser[] => {
  const updatedUsers = users.map(user => 
    user.id === updatedUser.id ? updatedUser : user
  );
  saveUsersToLocalStorage(updatedUsers);
  console.log("Utilisateurs mis à jour dans localStorage après mise à jour");
  return updatedUsers;
};
