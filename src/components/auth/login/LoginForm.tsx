
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  loginError: string;
  isDevelopmentMode: boolean;
  testingMode: boolean;
}

export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  isSubmitting,
  loginError,
  isDevelopmentMode,
  testingMode
}: LoginFormProps) => {
  const requiresCredentials = !isDevelopmentMode && !testingMode;

  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-4">
        {requiresCredentials && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="votre@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}
        {loginError && (
          <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
            {loginError}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Connexion en cours...
            </>
          ) : (
            isDevelopmentMode 
              ? "Accéder à l'application" 
              : testingMode 
                ? "Accéder à l'application (Mode test)" 
                : "Se connecter"
          )}
        </Button>
      </CardFooter>
    </form>
  );
};
