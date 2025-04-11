
import { useState, useEffect } from "react";

export function useTestingModeActivation() {
  const [clickCount, setClickCount] = useState(0);
  const [showTestingControls, setShowTestingControls] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  
  // Charger l'état de visibilité des contrôles depuis localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('testing_controls_visible');
    if (savedState === 'true') {
      setShowTestingControls(true);
    }
  }, []);

  // Réinitialiser le compteur après un délai
  useEffect(() => {
    const timer = setTimeout(() => {
      if (clickCount > 0 && Date.now() - lastClickTime > 3000) {
        setClickCount(0);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [clickCount, lastClickTime]);

  // Gestionnaire de clics pour activer les contrôles de test
  const handleTitleClick = () => {
    const currentTime = Date.now();
    
    // Si le clic précédent est trop ancien, réinitialiser le compteur
    if (currentTime - lastClickTime > 3000) {
      setClickCount(1);
    } else {
      setClickCount(prevCount => prevCount + 1);
    }
    
    setLastClickTime(currentTime);
    
    // Si l'utilisateur a cliqué 5 fois, activer/désactiver les contrôles de test
    if (clickCount + 1 >= 5) {
      const newState = !showTestingControls;
      setShowTestingControls(newState);
      
      // Enregistrer l'état dans localStorage
      if (newState) {
        localStorage.setItem('testing_controls_visible', 'true');
        console.log("Contrôles de mode test activés et enregistrés dans localStorage");
      } else {
        localStorage.removeItem('testing_controls_visible');
        console.log("Contrôles de mode test désactivés et supprimés de localStorage");
      }
      
      // Réinitialiser le compteur
      setClickCount(0);
    }
  };

  return { showTestingControls, handleTitleClick };
}
