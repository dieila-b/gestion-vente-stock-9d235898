
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Key, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidReset, setIsValidReset] = useState(false);

  useEffect(() => {
    // Vérifier si on a un hash dans l'URL qui indique une redirection de réinitialisation de mot de passe
    const hash = window.location.hash;
    
    console.log("Vérification du hash de récupération:", hash);
    
    if (!hash || !hash.includes("type=recovery")) {
      console.log("Pas de hash de récupération valide dans l'URL. Hash actuel:", hash);
      console.log("Redirection vers la page de connexion...");
      
      // Ajouter un délai pour éviter une redirection trop rapide qui pourrait interrompre le chargement du composant
      setTimeout(() => {
        navigate("/login");
      }, 500);
      return;
    }
    
    console.log("Hash de récupération valide trouvé:", hash);
    setIsValidReset(true);
    
    // Vérifier si un utilisateur est associé au token
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      console.log("Session actuelle:", data.session ? "Présente" : "Absente", error || "Pas d'erreur");
      
      if (error || !data.session) {
        console.error("Erreur ou absence de session:", error);
        toast.error("Le lien de réinitialisation est invalide ou a expiré");
        navigate("/login");
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation de base
    if (!newPassword || !confirmPassword) {
      setError("Veuillez remplir tous les champs");
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Tentative de mise à jour du mot de passe");
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      console.log("Résultat de updateUser:", data ? "Succès" : "Échec", updateError || "Pas d'erreur");

      if (updateError) {
        console.error("Erreur détaillée lors de la mise à jour du mot de passe:", updateError);
        setError(updateError.message);
        toast.error("Erreur lors de la réinitialisation du mot de passe");
      } else {
        console.log("Mot de passe réinitialisé avec succès pour l'utilisateur");
        toast.success("Mot de passe réinitialisé avec succès");
        
        // Assurer une déconnexion propre après le changement de mot de passe
        await supabase.auth.signOut();
        
        // Rediriger vers la page de connexion après un court délai
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Exception lors de la réinitialisation du mot de passe:", error);
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
      toast.error("Une erreur est survenue. Veuillez réessayer plus tard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isValidReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <div className="mb-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Vérification du lien...</h2>
          <p className="text-muted-foreground">Veuillez patienter pendant que nous vérifions votre lien de réinitialisation.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Réinitialiser votre mot de passe</h1>
          <p className="text-muted-foreground text-sm">
            Créez un nouveau mot de passe sécurisé.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSubmitting}
              minLength={8}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Réinitialisation en cours...
              </>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </Button>

          <div className="text-center mt-4">
            <Button
              type="button"
              variant="link"
              className="text-sm"
              onClick={() => navigate("/login")}
              disabled={isSubmitting}
            >
              Retour à la connexion
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
