
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/components/auth/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

// Détermine si l'application est en mode production
const isProduction = import.meta.env.MODE === 'production';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated, forgotPassword } = useAuth();
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Récupérer l'URL de redirection (si elle existe)
  const from = location.state?.from?.pathname || "/dashboard";

  // Vérifier si l'utilisateur est déjà authentifié
  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate(from, { replace: true });
    } else if (!isProduction) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate, from]);

  // En mode développement, ne pas afficher la page de connexion
  if (!isProduction) {
    return null;
  }

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
            <ForgotPasswordForm 
              onBack={() => setForgotPasswordMode(false)}
              forgotPassword={forgotPassword}
            />
          ) : (
            <LoginForm 
              onForgotPassword={() => setForgotPasswordMode(true)}
              onSubmit={login}
              isLoading={loading}
            />
          )}
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          Seuls les utilisateurs internes autorisés peuvent se connecter.
        </CardFooter>
      </Card>
    </div>
  );
}
