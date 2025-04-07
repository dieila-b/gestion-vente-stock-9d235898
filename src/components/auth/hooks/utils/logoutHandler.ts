
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Handle logout for all modes - always use production mode
export const handleLogout = async (isDevelopmentMode: boolean): Promise<void> => {
  try {
    // Always use production mode logout
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
