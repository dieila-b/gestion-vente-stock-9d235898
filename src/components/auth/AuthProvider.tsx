
import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { toast } from "sonner";
import AuthContext from "./AuthContext";
import { isProduction, authenticateUser, handleForgotPassword } from "./authUtils";
import { getDevUser } from "./devModeUtils";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Initialisation de l'authentification
  useEffect(() => {
    const initAuth = async () => {
      if (!isProduction) {
        // Utilisateur fictif pour le développement
        const devUser = getDevUser();
        
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
      const result = await authenticateUser(email, password);
      
      if (result.success && 'userData' in result) {
        // Stocker les informations utilisateur
        setUser(result.userData as User);
        setIsAuthenticated(true);
        
        // Sauvegarder dans le localStorage pour persister la session
        localStorage.setItem('authUser', JSON.stringify(result.userData));
      }
      
      setLoading(false);
      return { 
        success: result.success, 
        message: result.message 
      };
    } catch (error: any) {
      console.error("Exception lors de l'authentification:", error);
      setLoading(false);
      return { 
        success: false, 
        message: "Une erreur inattendue s'est produite." 
      };
    }
  };

  const forgotPassword = async (email: string) => {
    return handleForgotPassword(email);
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

export { useAuth } from './useAuth';
