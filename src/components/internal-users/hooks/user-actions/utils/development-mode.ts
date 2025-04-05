
import { InternalUser } from "@/types/internal-user";
import { CreateUserData } from "../types";
import { DEV_USERS_STORAGE_KEY } from "../../userData/localStorage";

export const createUserInDevMode = (data: CreateUserData): InternalUser => {
  // Get existing users from localStorage or initialize empty array
  const existingUsersJson = localStorage.getItem(DEV_USERS_STORAGE_KEY);
  const existingUsers: InternalUser[] = existingUsersJson ? JSON.parse(existingUsersJson) : [];
  
  console.log("Creating user in development mode:", data);
  console.log("Existing users:", existingUsers);

  // Generate a unique ID with timestamp
  const timestamp = Date.now();
  const newUserId = `dev-${timestamp}`;
  
  // Create the new user object
  const newUser: InternalUser = {
    id: newUserId,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone || null,
    address: data.address || null,
    role: data.role,
    is_active: data.is_active,
    photo_url: data.photo_url || null
  };
  
  // Add the new user to the existing users array
  const updatedUsers = [...existingUsers, newUser];
  
  // Save the updated users array to localStorage
  localStorage.setItem(DEV_USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  
  console.log("New user created in development mode:", newUser);
  console.log("Updated users in localStorage:", updatedUsers);
  
  return newUser;
};
