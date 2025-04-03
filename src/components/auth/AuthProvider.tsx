
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      try {
        // Pour le développement, considérer l'utilisateur comme connecté
        if (process.env.NODE_ENV === 'development') {
          console.log("Mode développement: Utilisateur considéré comme authentifié");
          setIsAuthenticated(true);
          setUserEmail("dev@example.com");
          setLoading(false);
          return;
        }

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
    setLoading(true);
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Mode développement: Simulation de connexion");
        setIsAuthenticated(true);
        setUserEmail(email);
        return;
      }
      
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
    setLoading(true);
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Mode développement: Simulation de déconnexion");
        setIsAuthenticated(false);
        setUserEmail(null);
        return;
      }
      
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
