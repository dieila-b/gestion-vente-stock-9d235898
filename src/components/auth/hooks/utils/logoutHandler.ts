
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Handle logout in both development and production modes
export const handleLogout = async (isDevelopmentMode: boolean): Promise<void> => {
  if (isDevelopmentMode) {
    console.log("Development mode: Simulated logout");
    // Remove current user from session
    localStorage.removeItem('currentUser');
    toast.success("Vous êtes déconnecté");
    return;
  }

  try {
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
