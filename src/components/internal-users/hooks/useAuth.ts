
import { useState, useEffect } from "react";

export const useAuth = () => {
  // Simulation d'un utilisateur autorisé
  return {
    isAuthChecking: false,
    isAuthorized: true
  };
};
