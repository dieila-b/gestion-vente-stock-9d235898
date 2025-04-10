
import React from "react";
import { CardDescription } from "@/components/ui/card";

interface AuthStatusMessageProps {
  isDevelopmentMode: boolean;
  testingMode: boolean;
}

export const AuthStatusMessage = ({ isDevelopmentMode, testingMode }: AuthStatusMessageProps) => {
  // Mode test message
  if (testingMode) {
    return (
      <>
        <CardDescription>
          Mode test: Authentification automatique activée en production
        </CardDescription>
        <div className="text-sm p-2 bg-yellow-100 text-yellow-800 rounded-md mt-2">
          Mode test: Bypass d'authentification activé en production
        </div>
      </>
    );
  }
  
  // Mode développement message
  if (isDevelopmentMode) {
    return (
      <>
        <CardDescription>
          Mode développement: Authentification automatique activée
        </CardDescription>
        <div className="text-sm p-2 bg-blue-100 text-blue-800 rounded-md mt-2">
          Mode développement: Bypass d'authentification activé
        </div>
      </>
    );
  }

  // Message d'authentification normale
  return (
    <CardDescription>
      Entrez vos identifiants pour accéder à l'application
    </CardDescription>
  );
};
