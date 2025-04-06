
import { useState, useEffect } from 'react';
import { checkUserPermissions } from './user-actions/utils/authorization';

export const useAuth = () => {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const isDevelopmentMode = import.meta.env.DEV;
  
  useEffect(() => {
    // En mode développement, autoriser automatiquement
    if (isDevelopmentMode) {
      console.log("Mode développement: Authentication complètement désactivée pour l'accès aux utilisateurs internes");
      // Assurer que nous avons des utilisateurs de démonstration dans localStorage
      try {
        const storedUsers = localStorage.getItem('internalUsers');
        if (!storedUsers) {
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
            }
          ];
          localStorage.setItem('internalUsers', JSON.stringify(defaultUsers));
          console.log("Données de démonstration créées pour useAuth");
        }
      } catch (err) {
        console.error("Erreur lors de la création des données démo:", err);
      }
      
      // Always authorize in development mode regardless of email
      setIsAuthorized(true);
      setIsAuthChecking(false);
      return;
    }
    
    // En mode production, vérifier les permissions
    const verifyPermissions = async () => {
      try {
        console.log("Vérification des permissions utilisateur...");
        const hasPermission = await checkUserPermissions(['admin', 'manager']);
        console.log("Résultat de la vérification des permissions:", hasPermission);
        setIsAuthorized(hasPermission);
      } catch (error) {
        console.error("Erreur lors de la vérification des permissions:", error);
        setIsAuthorized(false);
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    verifyPermissions();
  }, [isDevelopmentMode]);
  
  return { 
    isAuthChecking: isDevelopmentMode ? false : isAuthChecking, 
    isAuthorized: isDevelopmentMode ? true : isAuthorized 
  };
};
