
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
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Détermine si l'application est en mode production
const isProduction = import.meta.env.MODE === 'production';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // En mode développement, définit un utilisateur par défaut
  useEffect(() => {
    const initAuth = async () => {
      if (!isProduction) {
        // Utilisateur fictif pour le développement
        const devUser: User = {
          id: "dev-user-id",
          first_name: "Dev",
          last_name: "User",
          email: "dev@example.com",
          phone: "1234567890",
          role: "admin",
          address: "Dev Address",
          is_active: true,
          photo_url: undefined
        };
        
        setUser(devUser);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }
      
      // En production, vérifier si l'utilisateur est déjà authentifié (à partir du localStorage)
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

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // En mode développement, simule une connexion réussie
    if (!isProduction) {
      // Déjà authentifié en mode développement
      return { success: true, message: "Connexion réussie en mode développement." };
    }
    
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
      
      // Vérification du type et de la structure de la réponse
      if (data && typeof data === 'object' && 'authenticated' in data) {
        if (data.authenticated === true && 'user' in data) {
          // Conversion sécurisée en utilisant un typage intermédiaire
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
          
          // Stocker les informations utilisateur
          setUser(userData);
          setIsAuthenticated(true);
          
          // Sauvegarder dans le localStorage pour persister la session
          localStorage.setItem('authUser', JSON.stringify(userData));
          
          setLoading(false);
          return { success: true, message: "Connexion réussie." };
        } else {
          setLoading(false);
          // Utilisons une vérification plus sûre pour accéder à l'erreur
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
      console.error("Exception lors de l'authentification:", error);
      setLoading(false);
      return { 
        success: false, 
        message: "Une erreur inattendue s'est produite." 
      };
    }
  };

  // Nouvelle fonction pour gérer les demandes de réinitialisation de mot de passe
  const forgotPassword = async (email: string) => {
    if (!isProduction) {
      // En mode développement, simuler une réinitialisation réussie
      return { success: true, message: "Demande de réinitialisation simulée en mode développement." };
    }
    
    try {
      // Au lieu d'utiliser rpc qui nécessite une fonction existante côté serveur,
      // simulons simplement la demande pour le moment
      // Plus tard, une vraie fonction RPC pourra être implémentée côté serveur
      
      // Simulons une réponse positive (généralement, on ne veut pas révéler si l'email existe ou non)
      return { 
        success: true, 
        message: "Si cette adresse email est associée à un compte, vous recevrez un email de réinitialisation." 
      };
      
    } catch (error: any) {
      console.error("Exception lors de la demande de réinitialisation:", error);
      return { 
        success: false, 
        message: "Une erreur inattendue s'est produite." 
      };
    }
  };
  
  const logout = async () => {
    setLoading(true);
    
    if (!isProduction) {
      // Ne rien faire en mode développement, maintenir l'utilisateur fictif
      setLoading(false);
      toast.success("Déconnexion simulée en mode développement.");
      return;
    }
    
    // Supprimer les données d'authentification
    localStorage.removeItem('authUser');
    setUser(null);
    setIsAuthenticated(false);
    
    setLoading(false);
    toast.success("Vous avez été déconnecté avec succès.");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, login, logout, forgotPassword }}>
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
