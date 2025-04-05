
import { InternalUser } from '@/types/internal-user';

// LocalStorage key for development mode
export const DEV_USERS_STORAGE_KEY = "internalUsers";

// Get users from localStorage
export const getUsersFromLocalStorage = (): InternalUser[] | null => {
  try {
    const storedUsers = localStorage.getItem(DEV_USERS_STORAGE_KEY);
    if (!storedUsers) {
      console.log("No users found in localStorage");
      return null;
    }
    
    const parsedUsers = JSON.parse(storedUsers);
    console.log("Retrieved users from localStorage:", parsedUsers);
    
    // Ensure correct typing by mapping the data
    const typedUsers: InternalUser[] = parsedUsers.map((user: any) => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role as "admin" | "manager" | "employee",
      is_active: user.is_active,
      photo_url: user.photo_url
    }));
    
    return typedUsers;
  } catch (error) {
    console.error("Error retrieving users from localStorage:", error);
    return null;
  }
};

// Save users to localStorage
export const saveUsersToLocalStorage = (users: InternalUser[]): void => {
  try {
    console.log("Saving users to localStorage:", users);
    localStorage.setItem(DEV_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users to localStorage:", error);
  }
};

// Create default users for development mode
export const createDefaultUsers = (): InternalUser[] => {
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
  
  saveUsersToLocalStorage(defaultUsers);
  return defaultUsers;
};
