
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session Supabase au chargement
    const checkSession = async () => {
      try {
        // En développement, on est automatiquement authentifié
        if (process.env.NODE_ENV === 'development') {
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        console.log("Vérification de la session Supabase...");
        // En production, vérifier la session Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la vérification de session:", error);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        if (data.session) {
          console.log("Session active trouvée pour:", data.session.user.email);
          setIsAuthenticated(true);
        } else {
          console.log("Aucune session active trouvée");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // S'abonner aux changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Événement d'authentification:", event, session?.user?.email);
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = () => {
    console.log("Fonction login appelée");
    setIsAuthenticated(true);
  };
  
  const logout = async () => {
    console.log("Déconnexion en cours...");
    setLoading(true);
    // En mode développement, juste mettre à jour l'état
    if (process.env.NODE_ENV === 'development') {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // En production, se déconnecter de Supabase
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
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
