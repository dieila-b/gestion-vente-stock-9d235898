
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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Vérifier si l'utilisateur est déjà authentifié (à partir du localStorage)
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('authUser');
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser) as User;
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          localStorage.removeItem('authUser');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('authenticate_internal_user', {
        email_input: email,
        password_input: password
      });
      
      if (error) {
        console.error("Erreur d'authentification:", error);
        setLoading(false);
        return { 
          success: false, 
          message: "Une erreur s'est produite lors de l'authentification." 
        };
      }
      
      if (data && data.authenticated) {
        const userData = data.user as User;
        
        // Stocker les informations utilisateur
        setUser(userData);
        setIsAuthenticated(true);
        
        // Sauvegarder dans le localStorage pour persister la session
        localStorage.setItem('authUser', JSON.stringify(userData));
        
        setLoading(false);
        return { success: true, message: "Connexion réussie." };
      } else {
        setLoading(false);
        return { 
          success: false, 
          message: data.error || "Email ou mot de passe incorrect." 
        };
      }
    } catch (error: any) {
      console.error("Exception lors de l'authentification:", error);
      setLoading(false);
      return { 
        success: false, 
        message: "Une erreur inattendue s'est produite." 
      };
    }
  };
  
  const logout = async () => {
    setLoading(true);
    
    // Supprimer les données d'authentification
    localStorage.removeItem('authUser');
    setUser(null);
    setIsAuthenticated(false);
    
    setLoading(false);
    toast.success("Vous avez été déconnecté avec succès.");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
