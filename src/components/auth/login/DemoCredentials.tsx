
import React from "react";

interface DemoCredentialsProps {
  isDevelopmentMode: boolean;
  testingMode: boolean;
}

export const DemoCredentials = ({ isDevelopmentMode, testingMode }: DemoCredentialsProps) => {
  if (isDevelopmentMode || testingMode) {
    return null;
  }

  return (
    <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded-md text-sm">
      <p>Identifiants de démonstration:</p>
      <p className="font-mono mt-1">Email: dielabarry@outlook.com</p>
      <p className="font-mono">Mot de passe: password123</p>
    </div>
  );
};
