
import { useState, useEffect } from 'react';
import { checkUserPermissions } from './user-actions/utils/authorization';

export const useAuth = () => {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const isDevelopmentMode = import.meta.env.DEV;
  
  useEffect(() => {
    // En mode développement, autoriser automatiquement
    if (isDevelopmentMode) {
      console.log("Mode développement: Autorisation automatique pour l'accès aux utilisateurs internes");
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
  
  return { isAuthChecking, isAuthorized };
};
