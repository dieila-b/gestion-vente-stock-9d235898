
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login, loading, isSubmitting, isDevelopmentMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

  // Rediriger automatiquement vers le dashboard en mode développement ou si déjà authentifié
  useEffect(() => {
    if (isDevelopmentMode) {
      console.log("Mode développeur: Redirection automatique vers le dashboard");
      navigate("/dashboard");
      return;
    }
    
    if (isAuthenticated) {
      console.log("Utilisateur déjà authentifié, redirection vers le dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, isDevelopmentMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // En mode développement, ne rien faire - la redirection est automatique
    if (isDevelopmentMode) {
      navigate("/dashboard");
      return;
    }
    
    setErrorMsg("");
    
    if (!email || !password) {
      setErrorMsg("Veuillez saisir votre email et votre mot de passe");
      toast.error("Veuillez saisir votre email et votre mot de passe");
      return;
    }
    
    setLocalIsSubmitting(true);
    
    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("Tentative de connexion avec email:", normalizedEmail);
      const result = await login(normalizedEmail, password);
      console.log("Résultat login:", result);
      
      if (result.success) {
        console.log("Connexion réussie, redirection vers le dashboard");
        toast.success("Connexion réussie");
        navigate("/dashboard");
      } else {
        console.error("Échec de la connexion:", result.error);
        setErrorMsg(result.error || "Identifiants incorrects");
        toast.error(result.error || "Identifiants incorrects");
      }
    } catch (error) {
      console.error("Exception lors de la tentative de connexion:", error);
      setErrorMsg("Une erreur est survenue. Veuillez réessayer plus tard.");
      toast.error("Une erreur est survenue. Veuillez réessayer plus tard.");
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  // En mode développement, afficher un message clair et rediriger
  if (isDevelopmentMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Mode Développeur</h1>
            <p className="text-muted-foreground text-sm mb-4">
              L'authentification est complètement désactivée en mode développement
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate("/dashboard")}
            >
              Aller au tableau de bord
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Connexion</h1>
          <p className="text-muted-foreground text-sm">
            Accès réservé aux utilisateurs internes
          </p>
        </div>
        
        {errorMsg && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={localIsSubmitting || loading || isSubmitting}
              aria-label="Email"
              autoComplete="email"
              className="bg-card-foreground/5"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={localIsSubmitting || loading || isSubmitting}
              aria-label="Mot de passe"
              autoComplete="current-password"
              className="bg-card-foreground/5"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || localIsSubmitting || isSubmitting}
          >
            {loading || localIsSubmitting || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {localIsSubmitting || isSubmitting ? "Vérification..." : "Connexion..."}
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
