
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { toast } from "sonner";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Constant to check if we're in dev mode and want to bypass auth
const DEV_MODE = import.meta.env.DEV;
const BYPASS_AUTH = DEV_MODE;

// Test user for development
const TEST_USER: User = {
  id: "dev-user-123",
  first_name: "Dev",
  last_name: "User",
  email: "dev@example.com",
  phone: "123-456-7890",
  role: "admin",
  address: "Dev Address",
  is_active: true,
  photo_url: undefined
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(BYPASS_AUTH);
  const [loading, setLoading] = useState(!BYPASS_AUTH);
  const [user, setUser] = useState<User | null>(BYPASS_AUTH ? TEST_USER : null);

  // Check if the user is already authenticated (from localStorage) - only in production
  useEffect(() => {
    if (BYPASS_AUTH) {
      return; // Skip auth check in dev mode
    }
    
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('authUser');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as User;
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error retrieving user data:", error);
          localStorage.removeItem('authUser');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // In development mode, always succeed with test user
    if (BYPASS_AUTH) {
      setUser(TEST_USER);
      setIsAuthenticated(true);
      return { success: true, message: "Connexion réussie (mode développement)" };
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('authenticate_internal_user', {
        email_input: email,
        password_input: password
      });
      
      if (error) {
        console.error("Authentication error:", error);
        setLoading(false);
        return { 
          success: false, 
          message: "Une erreur s'est produite lors de l'authentification." 
        };
      }
      
      // Check the response type and structure
      if (data && typeof data === 'object' && 'authenticated' in data) {
        if (data.authenticated === true && 'user' in data) {
          // Safe conversion using intermediate typing
          const userObj = data.user as Record<string, any>;
          const userData: User = {
            id: String(userObj.id),
            first_name: String(userObj.first_name || ''),
            last_name: String(userObj.last_name || ''),
            email: String(userObj.email),
            phone: String(userObj.phone || ''),
            role: (userObj.role as 'admin' | 'manager' | 'employee') || 'employee',
            address: String(userObj.address || ''),
            is_active: Boolean(userObj.is_active ?? true),
            photo_url: userObj.photo_url ? String(userObj.photo_url) : undefined
          };
          
          // Store user information
          setUser(userData);
          setIsAuthenticated(true);
          
          // Save in localStorage to persist the session
          localStorage.setItem('authUser', JSON.stringify(userData));
          
          setLoading(false);
          return { success: true, message: "Connexion réussie." };
        } else {
          setLoading(false);
          // Use a safer check for accessing the error
          const errorMessage = (typeof data === 'object' && data && 'error' in data) 
            ? String(data.error) 
            : "Email ou mot de passe incorrect.";
            
          return { 
            success: false, 
            message: errorMessage
          };
        }
      } else {
        setLoading(false);
        return { 
          success: false, 
          message: "Format de réponse inattendu." 
        };
      }
    } catch (error: any) {
      console.error("Exception during authentication:", error);
      setLoading(false);
      return { 
        success: false, 
        message: "Une erreur inattendue s'est produite." 
      };
    }
  };
  
  const logout = async () => {
    setLoading(true);
    
    if (BYPASS_AUTH) {
      // In dev mode, we just reset to the test user
      setUser(TEST_USER);
      toast.success("Vous avez été déconnecté avec succès (mode développement)");
      setLoading(false);
      return;
    }
    
    // Remove authentication data
    localStorage.removeItem('authUser');
    setUser(null);
    setIsAuthenticated(false);
    
    setLoading(false);
    toast.success("Vous avez été déconnecté avec succès.");
  };

  const contextValue: AuthContextType = {
    isAuthenticated, 
    loading, 
    user, 
    login, 
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Export the hook separately
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
