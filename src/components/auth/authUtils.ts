
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { toast } from "sonner";

// Détermine si l'application est en mode production
export const isProduction = import.meta.env.MODE === 'production';

export const authenticateUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.rpc('authenticate_internal_user', {
      email_input: email,
      password_input: password
    });
    
    if (error) {
      console.error("Erreur d'authentification:", error);
      return { 
        success: false, 
        message: "Une erreur s'est produite lors de l'authentification." 
      };
    }
    
    // Vérification du type et de la structure de la réponse
    if (data && typeof data === 'object' && 'authenticated' in data) {
      if (data.authenticated === true && 'user' in data) {
        // Conversion sécurisée en utilisant un typage intermédiaire
        const userObj = data.user as Record<string, any>;
        const userData: User = {
          id: String(userObj.id || ''),
          first_name: String(userObj.first_name || ''),
          last_name: String(userObj.last_name || ''),
          email: String(userObj.email || ''),
          phone: String(userObj.phone || ''),
          role: (userObj.role as 'admin' | 'manager' | 'employee') || 'employee',
          address: String(userObj.address || ''),
          is_active: Boolean(userObj.is_active ?? true),
          photo_url: userObj.photo_url ? String(userObj.photo_url) : undefined
        };
        
        return { 
          success: true, 
          message: "Connexion réussie.",
          userData 
        };
      } else {
        // Utilisons une vérification plus sûre pour accéder à l'erreur
        const errorMessage = (typeof data === 'object' && data && 'error' in data) 
          ? String(data.error) 
          : "Email ou mot de passe incorrect.";
          
        return { 
          success: false, 
          message: errorMessage
        };
      }
    } else {
      return { 
        success: false, 
        message: "Format de réponse inattendu." 
      };
    }
  } catch (error: any) {
    console.error("Exception lors de l'authentification:", error);
    return { 
      success: false, 
      message: "Une erreur inattendue s'est produite." 
    };
  }
};

export const handleForgotPassword = async (email: string) => {
  if (!isProduction) {
    // En mode développement, simuler une réinitialisation réussie
    return { success: true, message: "Demande de réinitialisation simulée en mode développement." };
  }
  
  try {
    // Vérifions d'abord si l'email existe dans la table internal_users
    const { data: users, error: userCheckError } = await supabase
      .from('internal_users')
      .select('email')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();
    
    if (userCheckError) {
      console.error("Erreur lors de la vérification de l'email:", userCheckError);
      return { 
        success: false, 
        message: "Une erreur s'est produite lors de la vérification de l'email." 
      };
    }
    
    if (!users) {
      // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
      return { 
        success: true, 
        message: "Si cette adresse email est associée à un compte, vous recevrez un email de réinitialisation." 
      };
    }
    
    // On génère un token temporaire pour la réinitialisation
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Le token expire après 1 heure
    
    // En production, ici nous devrions stocker le token de réinitialisation en base de données
    // et envoyer un email avec un lien contenant ce token
    // Pour l'instant, nous simulons cette étape et affichons simplement le token dans les logs
    console.log(`[SIMULATION] Token de réinitialisation pour ${email}: ${resetToken} (expire à ${expiresAt.toISOString()})`);
    
    // Dans une implémentation réelle, nous utiliserions un service d'email pour envoyer ce token à l'utilisateur
    // Exemple: sendResetEmail(email, resetToken);
    
    return { 
      success: true, 
      message: "Si cette adresse email est associée à un compte, vous recevrez un email de réinitialisation." 
    };
    
  } catch (error: any) {
    console.error("Exception lors de la demande de réinitialisation:", error);
    return { 
      success: false, 
      message: "Une erreur inattendue s'est produite." 
    };
  }
};
