
import React from "react";
import { CardDescription } from "@/components/ui/card";

interface AuthStatusMessageProps {
  isDevelopmentMode: boolean;
  testingMode: boolean;
}

export const AuthStatusMessage = ({ isDevelopmentMode, testingMode }: AuthStatusMessageProps) => {
  // Normal authentication message
  if (!isDevelopmentMode && !testingMode) {
    return (
      <CardDescription>
        Entrez vos identifiants pour accéder à l'application
      </CardDescription>
    );
  }

  // Development or testing mode message
  return (
    <>
      <CardDescription>
        {isDevelopmentMode 
          ? "Mode développement: Authentification automatique activée" 
          : "Mode test: Authentification automatique activée en production"}
      </CardDescription>
      <div className={`text-sm p-2 ${testingMode ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"} rounded-md mt-2`}>
        {isDevelopmentMode 
          ? "Mode développement: Cliquez simplement sur Se connecter pour accéder à l'application" 
          : "Mode test: Bypass d'authentification activé en production"}
      </div>
    </>
  );
};
