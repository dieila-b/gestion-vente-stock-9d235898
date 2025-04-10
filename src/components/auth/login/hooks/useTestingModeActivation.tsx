
import { useState } from "react";
import { toast } from "sonner";

export function useTestingModeActivation() {
  const [showTestingControls, setShowTestingControls] = useState(false);
  
  // Show testing controls after clicking title 5 times
  const handleTitleClick = () => {
    const clickCount = parseInt(localStorage.getItem('testing_mode_clicks') || '0') + 1;
    localStorage.setItem('testing_mode_clicks', clickCount.toString());
    
    if (clickCount >= 5) {
      setShowTestingControls(true);
      localStorage.setItem('testing_mode_clicks', '0');
      toast.info("Mode test activé", {
        description: "Vous pouvez maintenant activer/désactiver le mode test"
      });
    }
  };
  
  return {
    showTestingControls,
    handleTitleClick
  };
}
