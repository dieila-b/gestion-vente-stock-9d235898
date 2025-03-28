
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";

export const useInternalUserSecurity = () => {
  const generateTemporaryPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const sendWelcomeEmail = async (email: string) => {
    try {
      // Pour démonstration, ce serait en réalité géré par une fonction Edge de Supabase
      // ou votre backend pour envoyer un email de bienvenue avec instructions de réinitialisation de mot de passe
      console.log(`Welcome email with password reset instructions would be sent to ${email}`);
      return true;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  };

  const handleResetPassword = async (user: InternalUser) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error("Reset password error:", error);
        toast.error(`Erreur de réinitialisation: ${error.message}`);
        throw error;
      }
      
      toast.success(`Email de réinitialisation envoyé à ${user.email}`);
      return true;
    } catch (error) {
      toast.error("Échec de l'envoi de l'email de réinitialisation");
      console.error(error);
      return false;
    }
  };

  return {
    generateTemporaryPassword,
    sendWelcomeEmail,
    handleResetPassword,
  };
};
