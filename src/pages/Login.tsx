
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthProvider";
import { LoginForm } from "@/pages/auth/LoginForm";
import { ForgotPasswordForm } from "@/pages/auth/ForgotPasswordForm";

// Détermine si l'application est en mode production
const isProduction = import.meta.env.MODE === 'production';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated, forgotPassword } = useAuth();
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

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
