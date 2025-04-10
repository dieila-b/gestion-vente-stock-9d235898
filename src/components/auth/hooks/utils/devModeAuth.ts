
import { toast } from "sonner";

const DEV_USERS_STORAGE_KEY = "internalUsers";

// Create default users for development mode
export const createDefaultDevUsers = () => {
  const defaultUsers = [
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
    },
    {
      id: "dev-1743853323495",
      first_name: "Dieila",
      last_name: "Barry",
      email: "dielabarry@outlook.com",
      phone: "623268781",
      address: "Madina",
      role: "manager",
      is_active: true,
      photo_url: null
    }
  ];
  
  localStorage.setItem(DEV_USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
};

// Handle login in development mode
export const handleDevModeLogin = (email: string): { success: boolean; error?: string } => {
  try {
    // Normalize email for consistency
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Development mode: Checking login credentials for:", normalizedEmail);
    
    // Get or create users in localStorage
    let users = [];
    const storedUsers = localStorage.getItem(DEV_USERS_STORAGE_KEY);
    
    if (!storedUsers) {
      console.log("No users found in localStorage, creating default users");
      users = createDefaultDevUsers();
    } else {
      users = JSON.parse(storedUsers);
      console.log("Development users found:", users.length);
    }
    
    // Find user with matching email
    const user = users.find((u: any) => 
      u.email && u.email.toLowerCase().trim() === normalizedEmail
    );
    
    if (!user) {
      console.log("User not found in development mode:", normalizedEmail);
      return {
        success: false,
        error: "Cet email n'est pas associé à un compte utilisateur interne"
      };
    }
    
    if (!user.is_active) {
      console.log("User account is inactive in development mode:", normalizedEmail);
      return {
        success: false,
        error: "Ce compte utilisateur a été désactivé. Contactez votre administrateur."
      };
    }
    
    console.log("User found and active in development mode:", user);
    
    // Store current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    toast.success("Connexion réussie en mode développement");
    return { success: true };
  } catch (err) {
    console.error("Error checking development users:", err);
    return {
      success: false,
      error: "Erreur lors de la vérification des identifiants"
    };
  }
};
