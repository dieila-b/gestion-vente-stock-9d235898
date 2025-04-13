
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

// Détermine si l'application est en mode production
const isProduction = import.meta.env.MODE === 'production';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated, forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPasswordSubmitting, setForgotPasswordSubmitting] = useState(false);

  // En mode développement, rediriger automatiquement vers le dashboard
  if (!isProduction) {
    navigate("/dashboard");
    return null;
  }

  // Si l'utilisateur est déjà authentifié, le rediriger vers la page d'accueil
  if (isAuthenticated && !loading) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success("Connexion réussie!");
        navigate("/dashboard");
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      setError("Une erreur s'est produite lors de la connexion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim()) {
      setError("Veuillez entrer votre adresse email.");
      return;
    }
    
    setForgotPasswordSubmitting(true);
    
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        toast.success("Un lien de réinitialisation a été envoyé à votre adresse email.");
        setForgotPasswordMode(false);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      console.error("Erreur lors de la demande de réinitialisation:", error);
      setError("Une erreur s'est produite lors de la demande de réinitialisation.");
    } finally {
      setForgotPasswordSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold">
            {forgotPasswordMode ? "Réinitialisation du mot de passe" : "Connexion"}
          </CardTitle>
          <CardDescription>
            {forgotPasswordMode 
              ? "Entrez votre email pour recevoir un lien de réinitialisation"
              : "Entrez vos identifiants pour accéder à l'application"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forgotPasswordMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={forgotPasswordSubmitting}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={forgotPasswordSubmitting}
              >
                {forgotPasswordSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien de réinitialisation"
                )}
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                className="w-full mt-2" 
                onClick={() => setForgotPasswordMode(false)}
                disabled={forgotPasswordSubmitting}
              >
                Retour à la connexion
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Button 
                    type="button" 
                    variant="link" 
                    className="px-0 h-auto text-xs"
                    onClick={() => setForgotPasswordMode(true)}
                  >
                    Mot de passe oublié ?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          Seuls les utilisateurs internes autorisés peuvent se connecter.
        </CardFooter>
      </Card>
    </div>
  );
}
