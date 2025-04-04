
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Key } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier si on a un hash dans l'URL qui indique une redirection de réinitialisation de mot de passe
    const hash = window.location.hash;
    if (!hash || !hash.includes("type=recovery")) {
      console.log("Pas de hash de récupération dans l'URL, redirection vers login");
      navigate("/login");
    }
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
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error("Erreur lors de la mise à jour du mot de passe:", updateError);
        setError(updateError.message);
        toast.error("Erreur lors de la réinitialisation du mot de passe");
      } else {
        toast.success("Mot de passe réinitialisé avec succès");
        
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
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
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
