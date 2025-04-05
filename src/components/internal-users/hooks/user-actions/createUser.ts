
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InternalUser } from "@/types/internal-user";
import { CreateUserData } from "./types";
import { createUserInDevMode } from "./utils/development-mode";
import { checkUserPermissions } from "./utils/authorization";
import { checkIfUserExists } from "./utils/user-verification";
import { createAuthUser } from "./utils/auth-creation";
import { insertInternalUser } from "./utils/db-insertion";

export const createUser = async (data: CreateUserData): Promise<InternalUser | null> => {
  try {
    // Check if we're in development mode
    const isDevelopmentMode = import.meta.env.DEV;
    
    // If in production, check permissions
    if (!isDevelopmentMode) {
      const hasPermission = await checkUserPermissions(['admin', 'manager']);
      if (!hasPermission) {
        return null;
      }
    }

    // In development mode, simulate a successful insertion without touching Supabase
    if (isDevelopmentMode) {
      return createUserInDevMode(data);
    }

    console.log("Création d'un nouvel utilisateur en production:", data.email);
    
    // Normalize email
    const normalizedEmail = data.email.toLowerCase().trim();
    
    // Check if user already exists
    const userExists = await checkIfUserExists(normalizedEmail);
    if (userExists) {
      return null;
    }

    // Create auth user
    const userId = await createAuthUser(data);
    if (!userId) {
      return null;
    }

    // Insert user into internal_users table
    const user = await insertInternalUser(userId, data, normalizedEmail);
    if (user) {
      toast({
        title: "Utilisateur créé",
        description: `${data.first_name} ${data.last_name} a été créé avec succès`,
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    toast({
      title: "Erreur",
      description: "Impossible de créer l'utilisateur",
      variant: "destructive",
    });
    return null;
  }
};
