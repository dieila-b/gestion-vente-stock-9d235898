
import { InternalUser } from "@/types/internal-user";

// Key for localStorage in development mode
export const DEV_USERS_STORAGE_KEY = "internalUsers";

// Get users from localStorage
export const getUsersFromLocalStorage = (): InternalUser[] | null => {
  const storedUsers = localStorage.getItem(DEV_USERS_STORAGE_KEY);
  if (!storedUsers) return null;
  
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
    
    return typedUsers;
  } catch (error) {
    console.error("Error parsing users from localStorage:", error);
    return null;
  }
};

// Save users to localStorage
export const saveUsersToLocalStorage = (users: InternalUser[]): void => {
  localStorage.setItem(DEV_USERS_STORAGE_KEY, JSON.stringify(users));
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
