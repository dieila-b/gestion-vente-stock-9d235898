
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  logout: () => Promise<void>;
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
          console.log("Mode développement: Authentification automatique activée");
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        console.log("Vérification de la session Supabase...");
        // En production, vérifier la session Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur lors de la vérification de session:", error);
          toast.error("Erreur lors de la vérification de session");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        console.log("Résultat getSession:", data);
        
        if (data.session) {
          console.log("Session active trouvée pour:", data.session.user.email);
          
          // Vérifier si l'utilisateur existe dans la table internal_users
          try {
            const { data: internalUser, error: internalError } = await supabase
              .from('internal_users')
              .select('id, email')
              .eq('email', data.session.user.email)
              .single();
            
            console.log("Recherche utilisateur interne:", internalUser, internalError);
            
            if (internalError || !internalUser) {
              console.error("Utilisateur non trouvé dans internal_users:", internalError?.message);
              await supabase.auth.signOut();
              setIsAuthenticated(false);
            } else {
              console.log("Utilisateur interne validé:", internalUser.email);
              setIsAuthenticated(true);
            }
          } catch (err) {
            console.error("Erreur lors de la vérification internal_users:", err);
            setIsAuthenticated(false);
          }
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
      async (event, session) => {
        console.log("Événement d'authentification:", event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            // Vérifier si l'utilisateur est un utilisateur interne
            const { data: internalUser, error: internalError } = await supabase
              .from('internal_users')
              .select('id, email')
              .eq('email', session.user.email)
              .single();
            
            console.log("Vérification internal_users après signin:", internalUser, internalError);
            
            if (internalError || !internalUser) {
              console.error("Utilisateur non trouvé dans internal_users lors du changement d'état");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              toast.error("Vous n'avez pas accès à cette application");
            } else {
              console.log("Utilisateur interne validé après événement auth:", internalUser.email);
              setIsAuthenticated(true);
            }
          } catch (error) {
            console.error("Erreur lors de la vérification de l'utilisateur interne:", error);
            setIsAuthenticated(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log("Fonction login appelée avec:", email);
    
    // En développement, simplement connecter l'utilisateur
    if (process.env.NODE_ENV === 'development') {
      console.log("Mode développement: Connexion automatique pour:", email);
      setIsAuthenticated(true);
      return { success: true };
    }

    try {
      console.log("Tentative de connexion avec Supabase pour:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Résultat signInWithPassword:", data, error);

      if (error) {
        console.error("Erreur d'authentification:", error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log("Utilisateur connecté avec succès:", data.user.email);
        
        // Vérifier si l'utilisateur existe dans la table internal_users
        try {
          const { data: internalUser, error: internalError } = await supabase
            .from('internal_users')
            .select('id, email')
            .eq('email', data.user.email)
            .single();
            
          console.log("Vérification internal_users après login:", internalUser, internalError);
            
          if (internalError || !internalUser) {
            console.error("Utilisateur non trouvé dans internal_users:", internalError?.message);
            toast.error("Vous n'êtes pas autorisé à accéder à cette application.");
            // Déconnexion de l'utilisateur
            await supabase.auth.signOut();
            return { success: false, error: "Utilisateur non autorisé" };
          }
          
          console.log("Utilisateur interne vérifié:", internalUser.email);
          setIsAuthenticated(true);
          return { success: true };
        } catch (err) {
          console.error("Erreur lors de la vérification internal_users:", err);
          await supabase.auth.signOut();
          return { success: false, error: "Erreur de vérification utilisateur" };
        }
      }
      
      return { success: false, error: "Erreur inconnue lors de la connexion" };
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return { success: false, error: "Erreur technique" };
    }
  };
  
  const logout = async () => {
    console.log("Déconnexion en cours...");
    setLoading(true);
    // En mode développement, juste mettre à jour l'état
    if (process.env.NODE_ENV === 'development') {
      setIsAuthenticated(false);
      setLoading(false);
      toast.success("Vous êtes déconnecté");
      return;
    }

    // En production, se déconnecter de Supabase
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erreur lors de la déconnexion:", error);
        toast.error("Erreur lors de la déconnexion");
      } else {
        setIsAuthenticated(false);
        toast.success("Vous êtes déconnecté");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
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
