
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useLoginForm() {
  const navigate = useNavigate();
  const { login, isDevelopmentMode, testingMode } = useAuth();
  const [email, setEmail] = useState("wosyrab@yahoo.fr"); // Pre-fill with existing account
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      setIsSubmitting(true);
      
      // In development or test mode, auto-authenticate
      if (isDevelopmentMode || testingMode) {
        console.log(isDevelopmentMode 
          ? "Development mode: Auto-authenticating user" 
          : "Testing mode: Auto-authenticating user");
        
        const result = await login(email, password);
        
        if (result.success) {
          const modeMessage = isDevelopmentMode ? "Mode développement" : "Mode test";
          toast.success(`Connexion réussie (${modeMessage})`);
          navigate("/dashboard", { replace: true });
        } else if (result.error) {
          setLoginError(result.error);
          toast.error(result.error);
        }
        setIsSubmitting(false);
        return;
      }
      
      // Field validation in production mode
      if (!email.trim()) {
        setLoginError("Veuillez saisir votre email");
        toast.error("Veuillez saisir votre email");
        setIsSubmitting(false);
        return;
      }

      if (!password) {
        setLoginError("Veuillez saisir votre mot de passe");
        toast.error("Veuillez saisir votre mot de passe");
        setIsSubmitting(false);
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      console.log("Tentative de connexion avec:", normalizedEmail);

      // Check if user exists in database directly
      const { data: internalUsers, error: internalError } = await supabase
        .from('internal_users')
        .select('id, email, is_active')
        .eq('email', normalizedEmail)
        .limit(1);
        
      if (internalError) {
        console.error("Erreur lors de la vérification dans internal_users:", internalError);
        setLoginError("Erreur de vérification: " + internalError.message);
        setIsSubmitting(false);
        return;
      }
      
      if (!internalUsers || internalUsers.length === 0) {
        console.log("Utilisateur non trouvé avec eq, tentative avec ilike");
        
        const { data: fuzzyUsers, error: fuzzyError } = await supabase
          .from('internal_users')
          .select('id, email, is_active')
          .ilike('email', normalizedEmail)
          .limit(1);
          
        if (fuzzyError) {
          console.error("Erreur lors de la recherche flexible:", fuzzyError);
        }
        
        if (!fuzzyUsers || fuzzyUsers.length === 0) {
          console.error("Utilisateur non trouvé dans internal_users:", normalizedEmail);
          setLoginError("Cet email n'est pas associé à un compte utilisateur interne");
          toast.error("Cet email n'est pas associé à un compte utilisateur interne");
          setIsSubmitting(false);
          return;
        }
        
        if (!fuzzyUsers[0].is_active) {
          console.error("Utilisateur désactivé:", fuzzyUsers[0].email);
          setLoginError("Ce compte utilisateur a été désactivé");
          toast.error("Ce compte a été désactivé");
          setIsSubmitting(false);
          return;
        }
        
        console.log("Utilisateur trouvé avec ilike et actif:", fuzzyUsers[0]);
      } else if (!internalUsers[0].is_active) {
        console.error("Utilisateur désactivé:", internalUsers[0].email);
        setLoginError("Ce compte utilisateur a été désactivé");
        toast.error("Ce compte a été désactivé");
        setIsSubmitting(false);
        return;
      } else {
        console.log("Utilisateur trouvé et actif:", internalUsers[0]);
      }

      const result = await login(normalizedEmail, password);
      console.log("Résultat de la connexion:", result);

      if (result.success) {
        toast.success("Connexion réussie");
        navigate("/dashboard", { replace: true });
      } else {
        setLoginError(result.error || "Échec de la connexion");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setLoginError("Une erreur est survenue lors de la connexion");
      toast.error("Une erreur est survenue lors de la connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    loginError,
    handleSubmit
  };
}
