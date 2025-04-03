
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  userEmail: string | null;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true in dev mode
  const [loading, setLoading] = useState(false); // Default to false in dev mode
  const [userEmail, setUserEmail] = useState<string | null>("dev@example.com"); // Default email in dev mode

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    // En mode développement, ne pas vérifier l'authentification
    if (process.env.NODE_ENV === 'development') {
      console.log("Mode développement: Authentification complètement désactivée");
      setIsAuthenticated(true);
      setUserEmail("dev@example.com");
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      setLoading(true);
      
      try {
        // Vérification de la session Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Vérifier que l'utilisateur existe dans internal_users
          const { data, error } = await supabase
            .from('internal_users')
            .select('*')
            .eq('email', session.user.email)
            .single();
          
          if (error || !data) {
            console.log("Session valide mais utilisateur non trouvé dans internal_users");
            await supabase.auth.signOut();
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
            setUserEmail(session.user.email);
            console.log("Utilisateur authentifié:", session.user.email);
          }
        } else {
          setIsAuthenticated(false);
          setUserEmail(null);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification d'authentification:", error);
        setIsAuthenticated(false);
        setUserEmail(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Écouter les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Changement d'état d'authentification:", event);
        
        if (event === "SIGNED_IN" && session) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email);
        } else if (event === "SIGNED_OUT") {
          setIsAuthenticated(false);
          setUserEmail(null);
        }
        
        setLoading(false);
      }
    );
    
    // Nettoyer l'écouteur
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string) => {
    // En mode développement, ne rien faire de spécial
    if (process.env.NODE_ENV === 'development') {
      console.log("Mode développement: Authentification désactivée - Connexion automatique");
      setIsAuthenticated(true);
      setUserEmail(email || "dev@example.com");
      return;
    }
    
    setLoading(true);
    
    try {      
      // L'authentification est gérée par la page de login
      setIsAuthenticated(true);
      setUserEmail(email);
    } catch (error) {
      console.error("Erreur de connexion:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    // En mode développement, ne rien faire de spécial
    if (process.env.NODE_ENV === 'development') {
      console.log("Mode développement: Authentification désactivée - Simulation de déconnexion");
      setIsAuthenticated(false);
      setUserEmail(null);
      return;
    }
    
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserEmail(null);
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, userEmail, login, logout }}>
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
