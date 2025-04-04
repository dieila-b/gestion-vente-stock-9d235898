
import { createContext } from "react";

export type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  isSubmitting: boolean;
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
