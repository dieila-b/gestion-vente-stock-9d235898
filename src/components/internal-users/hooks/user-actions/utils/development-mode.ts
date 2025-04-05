
import { toast } from "@/hooks/use-toast";
import { InternalUser } from "@/types/internal-user";
import { CreateUserData } from "../types";

// Key for localStorage in development mode
export const DEV_USERS_STORAGE_KEY = "internalUsers";

export const createUserInDevMode = (data: CreateUserData): InternalUser => {
  // Simulate a successful user creation for development
  const mockUser: InternalUser = {
    id: `dev-${Date.now()}`,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone || null,
    address: data.address || null,
    role: data.role,
    is_active: data.is_active,
    photo_url: data.photo_url || null
  };
  
  // Store the user in localStorage for persistence in dev mode
  const existingUsers = JSON.parse(localStorage.getItem(DEV_USERS_STORAGE_KEY) || '[]');
  localStorage.setItem(DEV_USERS_STORAGE_KEY, JSON.stringify([...existingUsers, mockUser]));
  
  toast({
    title: "Utilisateur créé (mode développeur)",
    description: `${data.first_name} ${data.last_name} a été créé avec succès`,
  });
  
  return mockUser;
};
