
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Handle logout for all modes
export const handleLogout = async (isDevelopmentMode: boolean): Promise<void> => {
  try {
    console.log("Performing logout, development mode:", isDevelopmentMode);
    
    // En mode développement, juste afficher un message et ne pas essayer de déconnecter Supabase
    if (isDevelopmentMode) {
      console.log("Development mode: Simulating logout");
      toast.success("Vous êtes déconnecté (mode développement)");
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
      return;
    }
    
    toast.success("Vous êtes déconnecté");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Une erreur est survenue lors de la déconnexion");
  }
};
